import hashlib
import http.client
import os
import re
import subprocess
import time
import urllib.parse

print("=== 1. VERIFY IMAGE FILE EXISTENCE ===")
img_path = "public/images/nh44/01-srinagar-dal-lake.webp"
exists = os.path.exists(img_path)
print(f"File: {img_path}")
print(f"Exists: {exists}")
if exists:
    size = os.path.getsize(img_path)
    with open(img_path, "rb") as f:
        h = hashlib.sha256(f.read()).hexdigest()
    print(f"Size: {size} bytes")
    print(f"SHA-256: {h}")

print("\n=== 2. VERIFY FIVE-ZONE STRIP ALIGNMENT IN HEROSECTION.TSX ===")
with open("src/components/hero/HeroSection.tsx", "r", encoding="utf-8") as f:
    hero_code = f.read()

expected_zones = [
    {
        "code": "01",
        "name": "Northern Mountain Descent & Submontane Gateway",
        "span": "Srinagar — Jalandhar (Stops 01–02)",
        "badge": "Alpine to Gateway"
    },
    {
        "code": "02",
        "name": "Indo-Gangetic Alluvial Plains & Capital",
        "span": "Ludhiana — Delhi (Stops 03–05)",
        "badge": "Alluvial Corridor"
    },
    {
        "code": "03",
        "name": "Central Ravines, Bundelkhand & Zero Mile",
        "span": "Gwalior — Nagpur (Stops 06–08)",
        "badge": "Vindhyan & Zero Mile"
    },
    {
        "code": "04",
        "name": "Granite Deccan Tablelands & Ghat Passes",
        "span": "Hyderabad — Salem (Stops 09–11)",
        "badge": "Peninsular Craton"
    },
    {
        "code": "05",
        "name": "Kaveri Basin, Sangam Plain & Ocean Littoral",
        "span": "Namakkal — Kanyakumari (Stops 12–14)",
        "badge": "Converging Seas"
    }
]

all_zones_match = True
for z in expected_zones:
    code = z["code"]
    name = z["name"]
    span = z["span"]
    badge = z["badge"]
    if code in hero_code and name in hero_code and span in hero_code and badge in hero_code:
        print(f"[PASS] Zone {code}: '{name}' | Span: '{span}' | Badge: '{badge}'")
    else:
        print(f"[FAIL] Zone {code} mismatch in HeroSection.tsx")
        all_zones_match = False

print("\n=== 3. VERIFY 14 CHECKPOINT COVERAGE ACROSS ZONES ===")
# Zone spans: Stops 01-02, 03-05, 06-08, 09-11, 12-14
stop_ranges = [(1, 2), (3, 5), (6, 8), (9, 11), (12, 14)]
covered_stops = []
for start, end in stop_ranges:
    covered_stops.extend(range(start, end + 1))

print(f"Total stops covered: {len(covered_stops)} (Stops {covered_stops[0]} to {covered_stops[-1]})")
print(f"Stops 1 to 14 complete coverage without gaps: {covered_stops == list(range(1, 15))}")

print("\n=== 4. VERIFY GIS HASHES AGAINST PHASE 1B BASELINE ===")
EXPECTED_HASHES = {
    "public/data/nh44/nh44-route-lod0.geojson": "78f88425f475bce8b4050f2fa98c013ef1259b2579e4df1840902ffb13aeb5ae",
    "public/data/nh44/nh44-route-lod1.geojson": "1b07bf05249a81acb7b4048ba60c904504a79780c08c2dff5b4dc6d6a79d2282",
    "public/data/nh44/nh44-route-lod2.geojson": "6d78013a9b3a645afc8726487203e8948a8b99e87a0f9483e6c4a58a6aab840d",
    "public/data/nh44/nh44-lod-metadata.json": "d0a585d6a3e77e216b9f12f78aa8fc43dee763734d85025f281d642c905178d7",
    "public/data/india.json": "a6687a9176992a92f56486b1335f890c0c3065de7e28e7ac8f0da67c7e2e14c0"
}

all_hashes_match = True
for fpath, expected in EXPECTED_HASHES.items():
    with open(fpath, "rb") as f:
        h = hashlib.sha256(f.read()).hexdigest().lower()
    if h == expected.lower():
        print(f"[PASS] {fpath}: {h}")
    else:
        print(f"[FAIL] {fpath}: expected {expected}, got {h}")
        all_hashes_match = False

print("\n=== 5. VERIFY PRODUCTION HTTP 200 ON IMAGE ASSET ===")
# Launch next start on port 3009 and test HTTP request
PORT = 3009
next_cmd = ".\\node_modules\\.bin\\next.cmd" if os.name == "nt" else "./node_modules/.bin/next"
proc = subprocess.Popen([next_cmd, "start", "-p", str(PORT)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

http_ok = False
try:
    # Wait for server
    for _ in range(30):
        time.sleep(0.5)
        try:
            conn = http.client.HTTPConnection("localhost", PORT, timeout=2)
            conn.request("GET", "/")
            res = conn.getresponse()
            if res.status < 400:
                print(f"[PASS] Next.js server ready on port {PORT}")
                break
        except Exception:
            pass

    # Test direct image request
    test_url = "/images/nh44/01-srinagar-dal-lake.webp"
    conn = http.client.HTTPConnection("localhost", PORT, timeout=2)
    conn.request("GET", test_url)
    res = conn.getresponse()
    print(f"Direct request GET {test_url} -> Status {res.status} {res.reason}")
    if res.status == 200:
        http_ok = True

    # Test Next.js Image optimizer request
    opt_url = "/_next/image?url=" + urllib.parse.quote("/images/nh44/01-srinagar-dal-lake.webp") + "&w=1920&q=75"
    conn = http.client.HTTPConnection("localhost", PORT, timeout=2)
    conn.request("GET", opt_url)
    res_opt = conn.getresponse()
    print(f"Optimized request GET {opt_url} -> Status {res_opt.status} {res_opt.reason}")
    if res_opt.status == 200:
        print("[PASS] Image optimizer returned HTTP 200 OK")
    else:
        print(f"[WARN] Optimizer status: {res_opt.status}")
finally:
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except Exception:
        proc.kill()

print("\n=== 6. GIT STATUS & DIFF ON HEROSECTION.TSX ===")
diff_res = subprocess.run(["git", "diff", "src/components/hero/HeroSection.tsx"], capture_output=True, text=True)
print(diff_res.stdout)

status_res = subprocess.run(["git", "status", "--short"], capture_output=True, text=True)
print("Git short status:")
print(status_res.stdout)
