#!/usr/bin/env python3
"""
Fetch Jakarta RTRW (Rencana Tata Ruang Wilayah) zoning polygon data.

Primary source: GISTARU ATR/BPN ArcGIS REST service.
Fallback:       OpenStreetMap Overpass API.

Run once during setup to cache RTRW data locally:
    python3 backend/scripts/fetch_rtrw.py

Output: backend/data/jakarta_rtrw.geojson
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jakarta_rtrw.geojson")

JAKARTA_BBOX = {"south": -6.4, "west": 106.5, "north": -5.9, "east": 107.1}

# Normalized zone_type → zone_label mapping
ZONE_LABEL_MAP = {
    # MERAH — RTH / Jalur Hijau (commercial activity prohibited, Satpol PP risk)
    "rth": "MERAH", "jalur_hijau": "MERAH", "taman": "MERAH",
    "makam": "MERAH", "sempadan": "MERAH", "konservasi": "MERAH",
    "hutan": "MERAH", "forest": "MERAH", "grass": "MERAH",
    "meadow": "MERAH", "greenfield": "MERAH", "cemetery": "MERAH",
    "nature_reserve": "MERAH", "park": "MERAH", "garden": "MERAH",
    "water": "MERAH", "wetland": "MERAH", "orchard": "MERAH",
    "wood": "MERAH", "scrub": "MERAH",
    # KUNING — Residential / mixed-use (conditional permit required)
    "perumahan": "KUNING", "permukiman": "KUNING", "campuran": "KUNING",
    "khusus": "KUNING", "residential": "KUNING", "mixed": "KUNING",
    "institutional": "KUNING", "education": "KUNING", "religious": "KUNING",
    "allotments": "KUNING", "farmland": "KUNING", "farmyard": "KUNING",
    "military": "KUNING", "quarry": "KUNING", "landfill": "KUNING",
    "recreation_ground": "KUNING",
    # HIJAU — Perdagangan dan Jasa / Komersial (fully permitted)
    "perdagangan": "HIJAU", "jasa": "HIJAU", "komersial": "HIJAU",
    "perkantoran": "HIJAU", "industri": "HIJAU",
    "commercial": "HIJAU", "retail": "HIJAU", "industrial": "HIJAU",
    "office": "HIJAU", "construction": "HIJAU", "port": "HIJAU",
    "railway": "HIJAU",
}


def normalize_zone_type(props: dict) -> str:
    # RDTR field names from jakartasatu endpoint
    for key in ["NAMSZN", "NAMZON", "KODZON", "RTRW", "FUNGSI", "ZONASI", "zone_type"]:
        val = props.get(key)
        if val and val != "Tidak Ada":
            return str(val).lower().replace(" ", "_").replace("-", "_")
    for key in ["landuse", "leisure", "natural", "amenity", "zone"]:
        val = props.get(key)
        if val:
            return str(val).lower().replace(" ", "_")
    return "unknown"


def zone_label_from_type(zone_type: str) -> str:
    return ZONE_LABEL_MAP.get(zone_type, "KUNING")


def fetch_from_gistaru() -> dict | None:
    # Primary: confirmed live Jakarta RDTR endpoint (no auth required)
    base = "https://jakartasatu.jakarta.go.id/server/rest/services/GISTARU/RDTR_GISTARU/MapServer/0/query"
    params = urllib.parse.urlencode({
        "geometry": f"{JAKARTA_BBOX['west']},{JAKARTA_BBOX['south']},{JAKARTA_BBOX['east']},{JAKARTA_BBOX['north']}",
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "outFields": "KODZON,NAMZON,KODSZN,NAMSZN,WADMKD,WADMKC",
        "f": "geojson",
        "resultRecordCount": 2000,
    })
    url = f"{base}?{params}"
    print(f"Trying Jakarta RDTR (jakartasatu): {url[:80]}...")
    req = urllib.request.Request(url, headers={"User-Agent": "AP-Analytics/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status == 200:
                data = json.loads(resp.read())
                if data.get("features") and len(data["features"]) > 0:
                    print(f"  GISTARU returned {len(data['features'])} features.")
                    return data
    except Exception as e:
        print(f"  GISTARU unavailable: {e}")
    return None


def fetch_from_osm() -> dict:
    bbox = f"{JAKARTA_BBOX['south']},{JAKARTA_BBOX['west']},{JAKARTA_BBOX['north']},{JAKARTA_BBOX['east']}"
    query = f"""[out:json][timeout:120];
(
  way["landuse"]({bbox});
  relation["landuse"]({bbox});
  way["leisure"="park"]({bbox});
  way["leisure"="nature_reserve"]({bbox});
  way["leisure"="garden"]({bbox});
  way["natural"="wood"]({bbox});
  way["natural"="water"]({bbox});
);
out geom qt;"""

    print("Fetching from OpenStreetMap Overpass API (fallback)...")
    data = query.encode("utf-8")
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter",
        data=data, method="POST",
        headers={"User-Agent": "AP-Analytics/1.0",
                 "Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = json.loads(resp.read())

    print(f"  OSM returned {len(raw.get('elements', []))} elements.")

    features = []
    for elem in raw.get("elements", []):
        if elem.get("type") not in ("way", "relation"):
            continue
        geom_nodes = elem.get("geometry", [])
        if len(geom_nodes) < 3:
            continue

        coords = [[n["lon"], n["lat"]] for n in geom_nodes]
        if coords[0] != coords[-1]:
            coords.append(coords[0])

        tags = elem.get("tags", {})
        zone_type = normalize_zone_type(tags)
        zone_label = zone_label_from_type(zone_type)
        name = tags.get("name", tags.get("name:id", zone_type))

        features.append({
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [coords]},
            "properties": {
                "zone_type": zone_type,
                "zone_label": zone_label,
                "NAMOBJ": name,
                "name": name,
                "source": "osm",
                "osm_id": elem.get("id"),
            },
        })

    return {"type": "FeatureCollection", "features": features}


def normalize_gistaru_features(geojson: dict) -> dict:
    for feat in geojson.get("features", []):
        props = feat.get("properties", {})
        zone_type = normalize_zone_type(props)
        props["zone_type"] = zone_type
        props["zone_label"] = zone_label_from_type(zone_type)
        if "NAMOBJ" not in props:
            props["NAMOBJ"] = props.get("name", zone_type)
    return geojson


def main():
    os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_PATH)), exist_ok=True)

    geojson = fetch_from_gistaru()
    if geojson:
        geojson = normalize_gistaru_features(geojson)
        source = "GISTARU ATR/BPN"
    else:
        geojson = fetch_from_osm()
        source = "OpenStreetMap Overpass"

    n = len(geojson.get("features", []))
    if n == 0:
        print("ERROR: No features fetched. Check your internet connection and try again.")
        sys.exit(1)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)

    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"\nSaved {n} zones from {source}")
    print(f"Output: {os.path.abspath(OUTPUT_PATH)}")
    print(f"File size: {size_kb:.1f} KB")

    labels: dict[str, int] = {}
    for feat in geojson["features"]:
        lbl = feat["properties"].get("zone_label", "UNKNOWN")
        labels[lbl] = labels.get(lbl, 0) + 1
    print("Zone breakdown:", labels)


if __name__ == "__main__":
    main()
