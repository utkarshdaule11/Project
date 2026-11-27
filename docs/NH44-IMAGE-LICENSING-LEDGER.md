# National Highway 44 (NH44) — Photographic Asset & Licensing Ledger
**The Grand Bharat Highway — Kashmir to Kanyakumari**

**Date of Ledger:** November 26, 2026  
**Document ID:** `docs/NH44-IMAGE-LICENSING-LEDGER.md`  
**Ledger Status:** **STEP 1 PILOT COMPLETED (3 of 29 Assets Ingested & Verified)**  
**Standard:** Open Access / Creative Commons Attribution-ShareAlike Compliance (CC BY-SA 4.0 / CC BY 4.0 / Public Domain)  

---

## 1. Provenance Policy & Hosting Scope Boundaries

Every photographic asset integrated into **The Grand Bharat Highway** is subjected to strict intellectual property and geographical verification:

1. **Staged Local Asset Hosting (Pilot vs Pending Scope):**
   - **Pilot Assets (Step 1):** Exactly 3 of 29 image slots (Srinagar `img1`, Delhi `img1`, Kanyakumari `img1`) have been migrated to locally hosted, immutable WebP assets stored in `public/images/nh44/`.
   - **Zero External Requests Applies Only to Pilot Landmarks:** Live network traffic audits confirm zero external requests to `images.unsplash.com` strictly and exclusively for these three pilot landmarks.
   - **Remaining Imagery Pending Migration (Steps 2–6):** The remaining 26 images (25 chapter images + 1 Hero background) currently remain un-migrated external Unsplash references until subsequent steps are authorized. No claim of project-wide zero external hotlinks is made at this stage.
2. **Authentic Provenance:** Images must depict the designated historical monument, highway pass, or landscape within the verified geographical boundary of that checkpoint.
3. **Open-Access Licensing:** All assets in this ledger are sourced under documented **Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)**, **Creative Commons Attribution 4.0 (CC BY 4.0)**, or **Public Domain** licenses.
4. **Attribution Requirement:** Under Section 3(a) of the Creative Commons License, every asset retains full attribution to the creator, source link, license terms, and Section 3(a)(1)(B) modification statements.
5. **Blur Placeholder Implementation Scope:**
   - **Generation:** Completed (base64 WebP blur thumbnails generated via Lanczos downsampling during ingestion).
   - **Documentation:** Completed (documented in this ledger and the implementation report).
   - **Application Integration & Rendering:** **NOT IMPLEMENTED.** Placeholders have not been injected into `content/states.ts` or rendered in `StateChapterCard.tsx` because `StateImage` in `src/types/state.ts` does not define `blurDataURL`. In accordance with Step 1 constraints, application architecture and type definitions were not modified.

---

## 2. Ingested Pilot Asset Ledger (Step 1)

### Asset 01: Srinagar — Dal Lake Shikaras at Sunrise
- **Asset ID:** `01-srinagar-dal-lake`
- **Slot Type:** Checkpoint 01 (Srinagar) — `img1` (Landmark / Alpine Lake Basin)
- **Local File Path:** `/images/nh44/01-srinagar-dal-lake.webp`
- **Filesystem Location:** `public/images/nh44/01-srinagar-dal-lake.webp`
- **Subject Matter:** Sunrise over Dal Lake with morning light reflecting off tranquil waters and shikara boats, framed by the Pir Panjal mountains, Srinagar, Jammu & Kashmir.
- **Geographical Relevance:** Milestone 0 / Northern origin of National Highway 44 in the Kashmir Valley.
- **Source Repository:** Wikimedia Commons
- **Source Page:** [File:Sunrise at kashmir (wiki loves earth 2017).jpg](https://commons.wikimedia.org/wiki/File:Sunrise_at_kashmir_(wiki_loves_earth_2017).jpg)
- **Direct Source URL:** `https://upload.wikimedia.org/wikipedia/commons/9/93/Sunrise_at_kashmir_%28wiki_loves_earth_2017%29.jpg`
- **Creator / Photographer:** **Amoghamahale** (Wikimedia Commons)
- **License:** **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**
- **License Terms URL:** [https://creativecommons.org/licenses/by-sa/4.0/](https://creativecommons.org/licenses/by-sa/4.0/)
- **Attribution Notice:** *"Sunrise over Dal Lake" by Amoghamahale, licensed under CC BY-SA 4.0 via Wikimedia Commons.*
- **Original Dimensions:** $3,264 \times 2,448\text{ px}$ (Original Size: $3,818.0\text{ KB}$)
- **Optimized Dimensions:** $1,920 \times 1,440\text{ px}$ (Optimized Size: $259.6\text{ KB}$, $265,858\text{ bytes}$)
- **Compression Ratio:** **93.2% size reduction** (Lanczos downscale + WebP quality 85)
- **Modification Statement:** Resized from original ($3,264 \times 2,448\text{ px}$) to $1,920 \times 1,440\text{ px}$ via Lanczos resampling; converted to WebP format at quality 85; sRGB profile preserved. In compliance with CC BY-SA 4.0 Section 3(a)(1)(B).
- **Blur Placeholder:** `data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADQAQCdASoQAAwABABoJZQAAughAw+8AAD8PIB245iog3UFpR654vl5w8ECTN+GeA68wNpyNRZfALGZ2+xrbrhYltcL9X70hqTft0hUzCUXeOguQgAAAA==` *(Generated & documented; UI integration deferred)*
- **Verification Status:** **VERIFIED AUTHENTIC & INGESTED LOCALLY**

---

### Asset 02: Delhi NCR — Humayun's Tomb Red Sandstone Facade
- **Asset ID:** `05-delhi-humayuns-tomb`
- **Slot Type:** Checkpoint 05 (Delhi NCR) — `img1` (Landmark / Imperial Architecture)
- **Local File Path:** `/images/nh44/05-delhi-humayuns-tomb.webp`
- **Filesystem Location:** `public/images/nh44/05-delhi-humayuns-tomb.webp`
- **Subject Matter:** The monumental red sandstone and white marble garden tomb facade of Mughal Emperor Humayun, framed by charbagh water channels, Nizamuddin East, New Delhi.
- **Geographical Relevance:** Checkpoint 05 along the NH44 Delhi bypass corridor; UNESCO World Heritage site and seminal precursor to the Taj Mahal.
- **Geographic Coordinates:** $28^\circ 35' 36.0''\text{ N}, 77^\circ 15' 02.2''\text{ E}$ (`28.593340, 77.250602`)
- **Source Repository:** Wikimedia Commons
- **Source Page:** [File:Humayun's Tomb New Delhi India.jpg](https://commons.wikimedia.org/wiki/File:Humayun%27s_Tomb_New_Delhi_India.jpg)
- **Direct Source URL:** `https://upload.wikimedia.org/wikipedia/commons/e/ec/Humayun%27s_Tomb_New_Delhi_India.jpg`
- **Creator / Photographer:** **Jjamwal** (Wikimedia Commons)
- **License:** **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**
- **License Terms URL:** [https://creativecommons.org/licenses/by-sa/4.0/](https://creativecommons.org/licenses/by-sa/4.0/)
- **Attribution Notice:** *"Humayun's Tomb New Delhi" by Jjamwal, licensed under CC BY-SA 4.0 via Wikimedia Commons.*
- **Original Dimensions:** $4,510 \times 2,500\text{ px}$ (Original Size: $994.0\text{ KB}$)
- **Optimized Dimensions:** $1,920 \times 1,064\text{ px}$ (Optimized Size: $247.0\text{ KB}$, $252,946\text{ bytes}$)
- **Compression Ratio:** **75.1% size reduction** (Lanczos downscale + WebP quality 85)
- **Modification Statement:** Resized from original ($4,510 \times 2,500\text{ px}$) to $1,920 \times 1,064\text{ px}$ via Lanczos resampling; converted to WebP format at quality 85; sRGB profile preserved. In compliance with CC BY-SA 4.0 Section 3(a)(1)(B).
- **Blur Placeholder:** `data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAACQAQCdASoQAAkABABoJZACdABTpAAA/lprNeDyFpDTSFCi+vkTC47tr0PPx/84YP5BBHKMTKMwDGT3uAhlAAAA` *(Generated & documented; UI integration deferred)*
- **Verification Status:** **VERIFIED AUTHENTIC & INGESTED LOCALLY**

---

### Asset 03: Kanyakumari — Vivekananda Rock Memorial
- **Asset ID:** `14-kanyakumari-rock-memorial`
- **Slot Type:** Checkpoint 14 (Kanyakumari) — `img1` (Landmark / Offshore Monolith)
- **Local File Path:** `/images/nh44/14-kanyakumari-rock-memorial.webp`
- **Filesystem Location:** `public/images/nh44/14-kanyakumari-rock-memorial.webp`
- **Subject Matter:** The red and blue granite meditation pavilion of Vivekananda Rock Memorial perched on an offshore rocky islet at Cape Comorin, where the Arabian Sea, Bay of Bengal, and Indian Ocean meet.
- **Geographical Relevance:** Milestone 3,810 / Southern terminus of National Highway 44 at the southern tip of the Indian subcontinent.
- **Geographic Coordinates:** $8^\circ 04' 41.2''\text{ N}, 77^\circ 33' 19.3''\text{ E}$ (`8.078104, 77.555366`)
- **Source Repository:** Wikimedia Commons
- **Source Page:** [File:Rock memorial of Vivekananda.jpg](https://commons.wikimedia.org/wiki/File:Rock_memorial_of_Vivekananda.jpg)
- **Direct Source URL:** `https://upload.wikimedia.org/wikipedia/commons/5/53/Rock_memorial_of_Vivekananda.jpg`
- **Creator / Photographer:** **Shivani** (Wikimedia Commons User:Smb2595)
- **License:** **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**
- **License Terms URL:** [https://creativecommons.org/licenses/by-sa/4.0/](https://creativecommons.org/licenses/by-sa/4.0/)
- **Attribution Notice:** *"Vivekananda Rock Memorial" by Shivani, licensed under CC BY-SA 4.0 via Wikimedia Commons.*
- **Original Dimensions:** $4,092 \times 2,103\text{ px}$ (Original Size: $1,105.9\text{ KB}$)
- **Optimized Dimensions:** $1,920 \times 986\text{ px}$ (Optimized Size: $123.0\text{ KB}$, $125,978\text{ bytes}$)
- **Compression Ratio:** **88.9% size reduction** (Lanczos downscale + WebP quality 85)
- **Modification Statement:** Resized from original ($4,092 \times 2,103\text{ px}$) to $1,920 \times 986\text{ px}$ via Lanczos resampling; converted to WebP format at quality 85; sRGB profile preserved. In compliance with CC BY-SA 4.0 Section 3(a)(1)(B).
- **Blur Placeholder:** `data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAACQAQCdASoQAAgABABoJZQAAuKClAAA/dcSTzoaj5NW5WPaXGtmZSpaeUQAAA==` *(Generated & documented; UI integration deferred)*
- **Verification Status:** **VERIFIED AUTHENTIC & INGESTED LOCALLY**

---

## 3. Pilot Summary & Remaining Asset Roadmap

| Category | Total Assets | Hosting Status | Blur Placeholder Status | Notes |
|---|:---:|---|---|---|
| **Pilot Assets (Step 1)** | **3** | **Locally Hosted (`/images/nh44/`)** | **Generated & Documented (Not Integrated in StateImage)** | Sourced from Wikimedia Commons, verified in production runtime. Zero external requests strictly for these 3 landmarks. |
| **Pending Assets (Steps 2–6)** | 26 | External Unsplash URLs | Pending Ingestion | 25 chapter images + 1 Hero background. |
| **Total Project Imagery** | 29 | **10.3% Local (3 of 29)** | **10.3% Generated (3 of 29)** | Project-wide zero external hotlinks will be achieved progressively across subsequent authorized steps. |
