import urllib.request
import urllib.parse
import json

USER_AGENT = "GrandBharatHighwayBot/1.0 (Educational GIS Project; https://github.com/project) Python-urllib"

def search_commons(query, limit=5):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": f"{query}",
        "gsrnamespace": "6", # File namespace
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|user"
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            results = []
            for page_id, page in pages.items():
                title = page.get("title", "")
                imageinfos = page.get("imageinfo", [])
                if not imageinfos:
                    continue
                imageinfo = imageinfos[0]
                img_url = imageinfo.get("url", "")
                width = imageinfo.get("width", 0)
                height = imageinfo.get("height", 0)
                user = imageinfo.get("user", "")
                extmeta = imageinfo.get("extmetadata", {})
                
                license_name = extmeta.get("LicenseShortName", {}).get("value", "")
                license_url = extmeta.get("LicenseUrl", {}).get("value", "")
                artist = extmeta.get("Artist", {}).get("value", user)
                desc = extmeta.get("ObjectName", {}).get("value", "") or extmeta.get("ImageDescription", {}).get("value", "")
                date_created = extmeta.get("DateTimeOriginal", {}).get("value", "")
                
                results.append({
                    "title": title,
                    "url": img_url,
                    "width": width,
                    "height": height,
                    "artist": artist,
                    "license_name": license_name,
                    "license_url": license_url,
                    "date": date_created,
                    "desc": desc[:150] if desc else ""
                })
            return results
    except Exception as e:
        print(f"Error querying {query}: {e}")
        return []

if __name__ == "__main__":
    queries = [
        ("srinagar", "Dal Lake Shikara sunrise"),
        ("delhi", "Humayuns Tomb facade"),
        ("kanyakumari", "Vivekananda Rock Memorial")
    ]
    
    for tag, q in queries:
        print(f"\n=================== {tag.upper()}: {q} ===================")
        items = search_commons(q, limit=5)
        for i, item in enumerate(items):
            print(f"[{i+1}] {item['title']}")
            print(f"    Dimensions: {item['width']}x{item['height']}")
            print(f"    Artist: {item['artist']}")
            print(f"    License: {item['license_name']} ({item['license_url']})")
            print(f"    URL: {item['url']}")
