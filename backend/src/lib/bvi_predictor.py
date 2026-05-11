import sys
import json
import pickle
import numpy as np
import pandas as pd
import traceback
import os
import warnings
from scipy.spatial.distance import cdist

# Suppress sklearn version warnings
warnings.filterwarnings("ignore", category=UserWarning)

current_dir = os.path.dirname(os.path.abspath(__file__))

# Load the model once
try:
    model_path = os.path.join(current_dir, "..", "..", "business_viability_model.pkl")
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print(json.dumps({"status": "error", "message": f"Failed to load model: {str(e)}"}))
    sys.exit(1)

# Load RWI data for area_wealth_index
rwi_coords = None
rwi_values = None
try:
    rwi_path = os.path.join(current_dir, "..", "..", "data", "jakarta_rwi.csv")
    if os.path.exists(rwi_path):
        rwi_df = pd.read_csv(rwi_path)
        rwi_coords = rwi_df[['latitude', 'longitude']].values
        rwi_values = rwi_df['rwi'].values
except Exception:
    pass

# ─── SPATIAL LAYER (Zone Classification) ─────────────────────────────────────
# Zone data is computed independently of the ML model.
# It is NEVER passed as a feature to model.predict().
# ─────────────────────────────────────────────────────────────────────────────
rtrw_gdf = None
try:
    import geopandas as gpd
    from shapely.geometry import Point

    rtrw_path = os.path.join(current_dir, "..", "..", "data", "jakarta_rtrw.geojson")
    if os.path.exists(rtrw_path):
        rtrw_gdf = gpd.read_file(rtrw_path)
        rtrw_gdf = rtrw_gdf.to_crs("EPSG:4326")
        print(json.dumps({"status": "info", "message": f"RTRW data loaded: {len(rtrw_gdf)} zones"}),
              file=sys.stderr)
except ImportError:
    print(json.dumps({"status": "warning",
                      "message": "geopandas not installed — zone classification unavailable. "
                                 "Run: pip3 install geopandas shapely"}),
          file=sys.stderr)
except Exception as e:
    print(json.dumps({"status": "warning", "message": f"RTRW data not loaded: {str(e)}"}),
          file=sys.stderr)


def classify_zone(lat, lng):
    if lat is None or lng is None or rtrw_gdf is None:
        return {
            "zone_label": "UNKNOWN",
            "zone_type": None,
            "zone_name": "Data RTRW tidak tersedia",
            "green_zone_ratio": 0.0,
            "commercial_ratio": 0.0,
            "mixed_use_ratio": 0.0,
            "is_restricted": False,
        }

    try:
        from shapely.geometry import Point as _Point
        point = _Point(lng, lat)  # GeoJSON uses (lng, lat) order

        containing = rtrw_gdf[rtrw_gdf.geometry.contains(point)]
        buffer = point.buffer(0.005)  # ~500 m in degrees
        nearby = rtrw_gdf[rtrw_gdf.geometry.intersects(buffer)]

        total_nearby = len(nearby) if len(nearby) > 0 else 1
        green_count      = len(nearby[nearby['zone_label'] == 'MERAH'])
        commercial_count = len(nearby[nearby['zone_label'] == 'HIJAU'])
        mixed_count      = len(nearby[nearby['zone_label'] == 'KUNING'])

        if len(containing) > 0:
            zone_row  = containing.iloc[0]
            label     = zone_row.get('zone_label', 'KUNING')
            zone_type = zone_row.get('zone_type', 'unknown')
            zone_name = zone_row.get('NAMOBJ', zone_row.get('name', zone_type))
        else:
            label     = 'KUNING'
            zone_type = 'unclassified'
            zone_name = 'Di luar peta RTRW'

        return {
            "zone_label": label,
            "zone_type": zone_type,
            "zone_name": str(zone_name) if zone_name else zone_type,
            "green_zone_ratio": round(green_count / total_nearby, 3),
            "commercial_ratio": round(commercial_count / total_nearby, 3),
            "mixed_use_ratio": round(mixed_count / total_nearby, 3),
            "is_restricted": label == "MERAH",
        }
    except Exception as e:
        return {
            "zone_label": "UNKNOWN",
            "zone_type": None,
            "zone_name": "Gagal mengklasifikasi zona",
            "green_zone_ratio": 0.0,
            "commercial_ratio": 0.0,
            "mixed_use_ratio": 0.0,
            "is_restricted": False,
        }


def get_area_wealth_index(lat, lng):
    if rwi_coords is not None and lat and lng:
        dist = cdist([[lat, lng]], rwi_coords)
        closest_idx = np.argmin(dist)
        return float(rwi_values[closest_idx])
    return 1.25


def safe_float(val):
    if pd.isna(val) or np.isinf(val):
        return 0.0
    return float(val)


while True:
    line = sys.stdin.readline()
    if not line:
        break
    try:
        data = json.loads(line)
        req_id = data.get('id')

        # Extract location early — needed for both zone classification and wealth index
        location = data.get('location', {})
        lat = location.get('lat')
        lng = location.get('lng')

        # Short-circuit for zone-only queries — ML model is NOT invoked
        if data.get('mode') == 'zone_only':
            zone = classify_zone(lat, lng)
            print(json.dumps({"id": req_id, "status": "success", "zone": zone}))
            sys.stdout.flush()
            continue

        competitors = data.get('competitors', [])
        products = data.get('products', [])

        num_competitors = len(competitors)
        ratings = [float(c.get('rating', 0)) for c in competitors if c.get('rating') is not None]
        avg_competitor_rating = float(np.mean(ratings)) if ratings else 0.0
        max_competitor_rating = float(np.max(ratings)) if ratings else 0.0
        rating_variance = float(np.var(ratings)) if len(ratings) > 1 else 0.0

        distances = [float(c.get('distanceMeters', 0)) for c in competitors]
        min_competitor_distance_m = float(np.min(distances)) if distances else 0.0

        radius_meters = float(data.get('radiusMeters', 1000))
        area_km2 = np.pi * ((radius_meters / 1000.0) ** 2)
        competitor_density = float(num_competitors / area_km2) if area_km2 > 0 else 0.0

        category_mapping = {
            'food_beverage': 0,
            'retail': 1,
            'services': 2,
            'technology': 3,
            'other': 4
        }
        category_str = str(data.get('category', 'other')).lower().replace(' ', '_').replace('&', '')
        category_encoded = category_mapping.get(category_str, 0)

        prices = [float(p.get('price', 0)) for p in products]
        avg_product_price_idr = float(np.mean(prices)) if prices else 0.0
        num_products = len(products)
        num_goals = len(data.get('goals', []))

        area_wealth_index = get_area_wealth_index(lat, lng)

        # Step 1 — ML inference (exactly 12 features, model untouched)
        features = pd.DataFrame([{
            'num_competitors': num_competitors,
            'avg_competitor_rating': avg_competitor_rating,
            'min_competitor_distance_m': min_competitor_distance_m,
            'max_competitor_rating': max_competitor_rating,
            'rating_variance': rating_variance,
            'competitor_density': competitor_density,
            'category_encoded': category_encoded,
            'avg_product_price_idr': avg_product_price_idr,
            'num_products': num_products,
            'radius_meters': radius_meters,
            'num_goals': num_goals,
            'area_wealth_index': area_wealth_index
        }])

        preds = model.predict(features)[0]

        # Step 2 — Zone classification (separate spatial layer, no model involvement)
        zone = classify_zone(lat, lng)

        result = {
            "id": req_id,
            "status": "success",
            "predictions": {
                "competition_density_score": safe_float(preds[0]),
                "location_appeal_score": safe_float(preds[1]),
                "market_demand_score": safe_float(preds[2]),
                "concept_uniqueness_score": safe_float(preds[3]),
                "success_score": safe_float(preds[4])
            },
            "zone": zone
        }
        print(json.dumps(result))
        sys.stdout.flush()
    except Exception as e:
        req_id = data.get('id') if 'data' in locals() else None
        err = {"id": req_id, "status": "error", "message": str(e), "trace": traceback.format_exc()}
        print(json.dumps(err))
        sys.stdout.flush()
