import os
import io
import base64
import urllib.request
from PIL import Image

USER_AGENT = "GrandBharatHighwayBot/1.0 (Educational GIS Project; https://github.com/project) Python-urllib"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images", "nh44")

PILOT_ASSETS = [
    {
        "id": "01-srinagar-dal-lake",
        "stop_id": "srinagar",
        "filename": "01-srinagar-dal-lake.webp",
        "title": "File:Sunrise at kashmir (wiki loves earth 2017).jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Sunrise_at_kashmir_%28wiki_loves_earth_2017%29.jpg",
        "author": "Amoghamahale",
        "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0",
        "source_page": "https://commons.wikimedia.org/wiki/File:Sunrise_at_kashmir_(wiki_loves_earth_2017).jpg",
        "subject": "Sunrise over Dal Lake with shikara boats, Srinagar, Kashmir",
        "gps": "34.120° N, 74.870° E (Dal Lake, Srinagar)",
        "caption": "Sunrise over calm waters of Dal Lake, Srinagar"
    },
    {
        "id": "05-delhi-humayuns-tomb",
        "stop_id": "delhi",
        "filename": "05-delhi-humayuns-tomb.webp",
        "title": "File:Humayun's Tomb New Delhi India.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Humayun%27s_Tomb_New_Delhi_India.jpg",
        "author": "Jjamwal",
        "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0",
        "source_page": "https://commons.wikimedia.org/wiki/File:Humayun%27s_Tomb_New_Delhi_India.jpg",
        "subject": "Red sandstone facade and charbagh water channels of Humayun's Tomb, New Delhi",
        "gps": "28.593340° N, 77.250602° E",
        "caption": "Humayun's Tomb Mughal architecture and gardens, New Delhi"
    },
    {
        "id": "14-kanyakumari-rock-memorial",
        "stop_id": "kanyakumari",
        "filename": "14-kanyakumari-rock-memorial.webp",
        "title": "File:Rock memorial of Vivekananda.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/5/53/Rock_memorial_of_Vivekananda.jpg",
        "author": "Shivani (User:Smb2595)",
        "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0",
        "source_page": "https://commons.wikimedia.org/wiki/File:Rock_memorial_of_Vivekananda.jpg",
        "subject": "Vivekananda Rock Memorial perched on offshore granite rock at Cape Comorin, Kanyakumari",
        "gps": "8.078104° N, 77.555366° E",
        "caption": "Vivekananda Rock Memorial on the offshore granite islet, Kanyakumari"
    }
]

def generate_blur_placeholder(img):
    """Generates a tiny base64 data URI blur placeholder (~16x10 px)."""
    thumb = img.copy()
    thumb.thumbnail((16, 12), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    thumb.save(buf, format="WEBP", quality=30)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/webp;base64,{b64}"

def ingest_assets():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    results = []

    for asset in PILOT_ASSETS:
        print(f"\nIngesting: {asset['id']} ({asset['title']})...")
        out_path = os.path.join(OUTPUT_DIR, asset["filename"])

        req = urllib.request.Request(asset["url"], headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw_bytes = resp.read()

        orig_img = Image.open(io.BytesIO(raw_bytes))
        orig_w, orig_h = orig_img.size
        orig_size_kb = len(raw_bytes) / 1024

        print(f"  Downloaded: {orig_w}x{orig_h} px ({orig_size_kb:.1f} KB)")

        # Resize if width exceeds 1920px (preserving aspect ratio)
        max_w = 1920
        if orig_w > max_w:
            new_h = int((max_w / orig_w) * orig_h)
            proc_img = orig_img.resize((max_w, new_h), Image.Resampling.LANCZOS)
        else:
            proc_img = orig_img.copy()

        # Ensure RGB mode (strip alpha/palette if necessary)
        if proc_img.mode in ("RGBA", "P"):
            proc_img = proc_img.convert("RGB")

        # Save optimized WebP
        proc_img.save(out_path, format="WEBP", quality=85, method=6)
        opt_size_kb = os.path.getsize(out_path) / 1024
        opt_w, opt_h = proc_img.size

        print(f"  Optimized WebP: {opt_w}x{opt_h} px ({opt_size_kb:.1f} KB) saved to {out_path}")

        # Generate blurDataURL
        blur_uri = generate_blur_placeholder(proc_img)
        print(f"  Blur placeholder: {len(blur_uri)} chars")

        results.append({
            **asset,
            "orig_w": orig_w,
            "orig_h": orig_h,
            "orig_size_kb": round(orig_size_kb, 1),
            "opt_w": opt_w,
            "opt_h": opt_h,
            "opt_size_kb": round(opt_size_kb, 1),
            "blur_uri": blur_uri,
            "local_path": f"/images/nh44/{asset['filename']}"
        })

    return results

if __name__ == "__main__":
    ingested = ingest_assets()
    print("\n================ PILOT INGESTION COMPLETE ================")
    for item in ingested:
        print(f"\nID: {item['id']}")
        print(f"Local Path: {item['local_path']}")
        print(f"Dimensions: {item['orig_w']}x{item['orig_h']} -> {item['opt_w']}x{item['opt_h']}")
        print(f"Size: {item['orig_size_kb']} KB -> {item['opt_size_kb']} KB")
        print(f"Author: {item['author']} | License: {item['license']}")
