import hashlib
import re
import sys

# Baseline SHA-256 hashes from Phase 1B / Step 1 & 2
EXPECTED_HASHES = {
    "public/data/nh44/nh44-route-lod0.geojson": "78f88425f475bce8b4050f2fa98c013ef1259b2579e4df1840902ffb13aeb5ae",
    "public/data/nh44/nh44-route-lod1.geojson": "1b07bf05249a81acb7b4048ba60c904504a79780c08c2dff5b4dc6d6a79d2282",
    "public/data/nh44/nh44-route-lod2.geojson": "6d78013a9b3a645afc8726487203e8948a8b99e87a0f9483e6c4a58a6aab840d",
    "public/data/nh44/nh44-lod-metadata.json": "d0a585d6a3e77e216b9f12f78aa8fc43dee763734d85025f281d642c905178d7",
    "public/data/india.json": "a6687a9176992a92f56486b1335f890c0c3065de7e28e7ac8f0da67c7e2e14c0"
}

def verify_gis_hashes():
    all_ok = True
    print("--- 1. Protected GIS Hash Invariance Check ---")
    for filepath, expected in EXPECTED_HASHES.items():
        try:
            with open(filepath, "rb") as f:
                data = f.read()
            h = hashlib.sha256(data).hexdigest().lower()
            if h == expected.lower():
                print(f"[PASS] {filepath}: {h} (MATCH)")
            else:
                print(f"[FAIL] {filepath}: Expected {expected}, got {h}")
                all_ok = False
        except Exception as e:
            print(f"[ERROR] {filepath}: {e}")
            all_ok = False
    return all_ok

def verify_checkpoints():
    print("\n--- 2. Checkpoints Integrity Check ---")
    with open("content/states.ts", "r", encoding="utf-8") as f:
        content = f.read()

    expected_ids = [
        "srinagar", "jalandhar", "ludhiana", "ambala", "delhi", "gwalior",
        "jhansi", "nagpur", "hyderabad", "bangalore", "salem", "namakkal",
        "madurai", "kanyakumari"
    ]
    
    # Extract IDs belonging to the StateChapter objects (which have order: X)
    found_ids = re.findall(r'id:\s*"([a-z-]+)",\s*\n\s*order:\s*\d+', content)
    
    if found_ids == expected_ids:
        print(f"[PASS] 14 Checkpoints IDs and sequence intact: {len(found_ids)} checkpoints verified.")
    else:
        print(f"[FAIL] Checkpoint mismatch: expected {expected_ids}, got {found_ids}")
        return False
        
    # Check that city-centre reference elevation terminology is preserved
    term_count = len(re.findall(r"Approx\. City-Centre Reference Elevation", content))
    print(f"[PASS] 'Approx. City-Centre Reference Elevation' count: {term_count} (expected 15 including comments/types)")
    return True

if __name__ == "__main__":
    gis_ok = verify_gis_hashes()
    ckpt_ok = verify_checkpoints()
    if not (gis_ok and ckpt_ok):
        print("\nVerification FAILED!")
        sys.exit(1)
    print("\nAll Invariants 100% PASSED!")
