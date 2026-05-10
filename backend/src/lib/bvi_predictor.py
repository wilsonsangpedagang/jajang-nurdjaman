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
    rwi_path = os.path.join(current_dir, "..", "data", "jakarta_rwi.csv")
    if os.path.exists(rwi_path):
        rwi_df = pd.read_csv(rwi_path)
        rwi_coords = rwi_df[['latitude', 'longitude']].values
        rwi_values = rwi_df['rwi'].values
except Exception as e:
    pass

def get_area_wealth_index(lat, lng):
    if rwi_coords is not None and lat and lng:
        # Calculate euclidean distance to find nearest RWI point
        dist = cdist([[lat, lng]], rwi_coords)
        closest_idx = np.argmin(dist)
        return float(rwi_values[closest_idx])
    # Fallback if no RWI data
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
        
        # Mapping category to category_encoded
        # You can adjust this to precisely match how you encoded categories
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
        
        # Fetch area wealth index based on location
        location = data.get('location', {})
        lat = location.get('lat')
        lng = location.get('lng')
        area_wealth_index = get_area_wealth_index(lat, lng)
        
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
        
        # Predict using the loaded model
        preds = model.predict(features)[0]
        
        result = {
            "id": req_id,
            "status": "success",
            "predictions": {
                "competition_density_score": safe_float(preds[0]),
                "location_appeal_score": safe_float(preds[1]),
                "market_demand_score": safe_float(preds[2]),
                "concept_uniqueness_score": safe_float(preds[3]),
                "success_score": safe_float(preds[4])
            }
        }
        print(json.dumps(result))
        sys.stdout.flush()
    except Exception as e:
        req_id = data.get('id') if 'data' in locals() else None
        err = {"id": req_id, "status": "error", "message": str(e), "trace": traceback.format_exc()}
        print(json.dumps(err))
        sys.stdout.flush()
