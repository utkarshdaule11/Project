import json
import re
import os

def count_coords(geom):
    gtype = geom['type']
    coords = geom['coordinates']
    if gtype == 'LineString':
        return len(coords)
    elif gtype == 'MultiLineString':
        return sum(len(part) for part in coords)
    elif gtype == 'Polygon':
        return sum(len(ring) for ring in coords)
    elif gtype == 'MultiPolygon':
        return sum(sum(len(ring) for ring in poly) for poly in coords)
    return 0

print("=== PROTECTED GEOJSON COORDINATE COUNTS ===")
for lod in [0, 1, 2]:
    fn = f'public/data/nh44/nh44-route-lod{lod}.geojson'
    with open(fn, 'r', encoding='utf-8') as f:
        d = json.load(f)
    features = d.get('features', [])
    total_pts = sum(count_coords(feat['geometry']) for feat in features)
    print(f"LOD {lod} ({fn}):")
    print(f"  Feature count: {len(features)}")
    for i, feat in enumerate(features):
        pts = count_coords(feat['geometry'])
        gtype = feat['geometry']['type']
        props = feat.get('properties', {})
        print(f"    Feature {i}: type={gtype}, points={pts}, props={props}")
    print(f"  Total Vertices/Coordinates: {total_pts}")

print("\n=== SEARCHING FOR PREVIOUS VERTEX NUMBERS IN DOCS/SRC ===")
targets = ['24015', '24,015', '4032', '4,032', '1029', '1,029', '6290', '6,290', '2752', '2,752', '43089', '43,089', '593']
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.md', '.ts', '.tsx', '.json', '.py', '.js')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                for t in targets:
                    if t in content:
                        # find line numbers
                        for line_no, line in enumerate(content.splitlines(), 1):
                            if t in line:
                                print(f"Found '{t}' in {path}:{line_no} -> {line.strip()[:100]}")
            except Exception as e:
                pass
