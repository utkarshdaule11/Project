# Official NH44 Corridor Reference & Alignment Document
**Corridor:** Srinagar – Kanyakumari National Corridor (NH44)  
**Authoritative Reference:** Ministry of Road Transport and Highways (MoRTH), Government of India  
**Document Context:** Annexure II(d), List of National Corridors  
**Listed Corridor Length:** ~3,810 KM  
**Data Provenance & Quality Gate Status:** Fully Audited, Factual Provenance Corrected  

---

## 1. Geographic Context & Jurisdiction Count

National Highway 44 (NH44) is the longest operational national highway in India, traversing the country along its central north–south spine from Srinagar in Jammu & Kashmir to Kanyakumari in Tamil Nadu.

Under the National Highways numbering rationalization (promulgated by MoRTH) and the National Corridors master planning (Annexure II(d)):
- The official corridor length listed for the Srinagar–Kanyakumari primary alignment is **approximately 3,810 KM**.
- Prior project documentation incorrectly cited 3,700 KM and only 6 states.
- The route connects **12 states and union territories** (10 States, 1 Union Territory, and 1 National Capital Territory):
  1. **Jammu & Kashmir** (Union Territory)
  2. **Punjab** (State)
  3. **Haryana** (State)
  4. **Delhi** (National Capital Territory)
  5. **Uttar Pradesh** (State)
  6. **Rajasthan** (State — traverses a brief ~28 km section through Dholpur district)
  7. **Madhya Pradesh** (State)
  8. **Maharashtra** (State)
  9. **Telangana** (State)
  10. **Andhra Pradesh** (State — traverses Kurnool and Anantapur districts)
  11. **Karnataka** (State)
  12. **Tamil Nadu** (State)

---

## 2. Official Major City Corridor Alignment Sequence

As documented in MoRTH National Corridors Annexure II(d), the primary corridor alignment lists a sequence of **14 major cities**:

1. **Srinagar** (Jammu & Kashmir)
2. **Jalandhar** (Punjab)
3. **Ludhiana** (Punjab)
4. **Ambala** (Haryana)
5. **Delhi** (NCT of Delhi)
6. **Gwalior** (Madhya Pradesh)
7. **Jhansi** (Uttar Pradesh)
8. **Nagpur** (Maharashtra)
9. **Hyderabad** (Telangana)
10. **Bangalore** (Karnataka)
11. **Salem** (Tamil Nadu)
12. **Namakkal** (Tamil Nadu)
13. **Madurai** (Tamil Nadu)
14. **Kanyakumari** (Tamil Nadu)

### Editorial Checkpoint Scope:
- These 14 locations represent **major editorial checkpoints** corresponding to the primary urban hubs designated in MoRTH Annexure II(d).
- They serve high-level subcontinental storytelling, regional chapters, and macro-corridor orientation.
- They are **NOT** an exhaustive inventory of every town, tehsil, toll plaza, interchange, or highway junction traversed by NH44.
- No intermediate towns or arbitrary waypoints have been invented or represented as official MoRTH corridor hubs.

---

## 3. Critical Geographical Clarifications & Exclusions

### 3.1 Spur Exclusion: Salem–Coimbatore–Thrissur–Angamali–Kochi
- MoRTH Annexure II(d) separately lists a connecting branch:
  $$\text{Salem} \rightarrow \text{Coimbatore} \rightarrow \text{Thrissur} \rightarrow \text{Angamali} \rightarrow \text{Kochi}$$
- This branch represents the historic NH47 corridor, now reclassified as **NH544**.
- While connected to NH44 at the Salem interchange, this western spur heads southwest into Kerala and terminates at Kochi port. It is **NOT** part of the main North–South Srinagar–Kanyakumari NH44 spine.
- **Rule for The Grand Bharat Highway:** The main expedition strictly proceeds south from Salem through Namakkal and Madurai directly to Kanyakumari. The Salem–Kochi branch remains excluded to prevent confusing the western spur with the North–South K2K journey.

### 3.2 Correction of Western Detours in Previous Code
- The legacy codebase included Jaipur (Rajasthan), Ahmedabad (Gujarat), Mumbai (Maharashtra), and Panaji (Goa).
- These destinations belong to the Western NH48 and NH66 corridors along the Arabian Sea and do not lie on NH44.
- All references to Jaipur, Ahmedabad, Mumbai, and Goa as NH44 stops have been eliminated from the active route model.

---

## 4. Coordinate Provenance & Limitations

### 4.1 What MoRTH Annexure II(d) Establishes vs. What It Does Not
- **MoRTH Establishes:** The official national corridor identity, the 14 major-city sequence, and the listed corridor length of **3,810 KM**.
- **MoRTH Does NOT Establish:** MoRTH Annexure II(d) does **not** publish geodetic coordinates, municipal boundary centroids, or turn-by-turn road centerline vector data.

### 4.2 Status of Coordinates in Phase 1A
- The coordinates displayed in the application are **approximate city-centre / municipal-centroid references** utilized solely for d3-geo projection on the schematic India map.
- Because these coordinates have not yet been correlated against an authoritative geodetic survey dataset (such as Survey of India benchmarks or NHAI highway chainage shapefiles), their **independent geodetic verification remains PENDING**.
- Under no circumstances should these coordinates be described as official MoRTH coordinates.

---

## 5. Checkpoint Data Confidence Classification Matrix

To enforce strict intellectual and scientific honesty, all attributes in the project data store are classified as follows:

| Classification Category | Definition & Criteria | Applicable Attributes |
|---|---|---|
| **Officially Sourced** | Directly gazetted in MoRTH Annexure II(d) documentation. | Corridor alignment, 14 major-city sequence, 3,810 KM listed length. |
| **Independently Verified (Identifiable Source)** | Corroborated by an identified, authoritative external dataset. | None currently certified (all external spatial layers under audit). |
| **Approximate / Estimated / Unverified (Verification Pending)** | Working approximations without an identified geodetic or authoritative source. | Municipal centroid coordinates (geodetic source audit pending), cumulative highway milestones (`~KM Est.`), topographic elevations (`~m Est.`), real-world driving distance, India boundary polygons (`public/data/india.json` — unverified public open-data boundary asset, Survey/Census provenance undocumented). |
| **Editorial Content** | Curated by editorial team for travel documentary storytelling. | Narrative introductions, taglines, cultural highlights, famous landmarks, culinary heritage, route context. |

### Data Classification Table for the 14 Checkpoints

| Checkpoint # | City | State / UT | Municipal Centroid Coords (Approximate, Verification Pending) | Cumulative Milestone (Est. Approximate) | Elevation (Est. Approximate) | Cultural & Culinary Highlights | Alignment Provenance |
|---|---|---|---|---|---|---|---|
| **01** | Srinagar | Jammu & Kashmir (UT) | 34.0837° N, 74.7973° E | ~0 KM (Origin) | ~1,585 m | Editorial Content | Officially Sourced (MoRTH) |
| **02** | Jalandhar | Punjab | 31.3260° N, 75.5762° E | ~410 KM (Est.) | ~228 m | Editorial Content | Officially Sourced (MoRTH) |
| **03** | Ludhiana | Punjab | 30.9010° N, 75.8573° E | ~470 KM (Est.) | ~244 m | Editorial Content | Officially Sourced (MoRTH) |
| **04** | Ambala | Haryana | 30.3782° N, 76.7767° E | ~580 KM (Est.) | ~264 m | Editorial Content | Officially Sourced (MoRTH) |
| **05** | Delhi | NCT of Delhi | 28.6139° N, 77.2090° E | ~780 KM (Est.) | ~216 m | Editorial Content | Officially Sourced (MoRTH) |
| **06** | Gwalior | Madhya Pradesh | 26.2183° N, 78.1828° E | ~1,110 KM (Est.) | ~211 m | Editorial Content | Officially Sourced (MoRTH) |
| **07** | Jhansi | Uttar Pradesh | 25.4484° N, 78.5685° E | ~1,210 KM (Est.) | ~284 m | Editorial Content | Officially Sourced (MoRTH) |
| **08** | Nagpur | Maharashtra | 21.1458° N, 79.0882° E | ~1,630 KM (Est.) | ~310 m | Editorial Content | Officially Sourced (MoRTH) |
| **09** | Hyderabad | Telangana | 17.3850° N, 78.4867° E | ~2,130 KM (Est.) | ~542 m | Editorial Content | Officially Sourced (MoRTH) |
| **10** | Bangalore | Karnataka | 12.9716° N, 77.5946° E | ~2,700 KM (Est.) | ~920 m | Editorial Content | Officially Sourced (MoRTH) |
| **11** | Salem | Tamil Nadu | 11.6643° N, 78.1460° E | ~2,900 KM (Est.) | ~278 m | Editorial Content | Officially Sourced (MoRTH) |
| **12** | Namakkal | Tamil Nadu | 11.2189° N, 78.1674° E | ~2,950 KM (Est.) | ~218 m | Editorial Content | Officially Sourced (MoRTH) |
| **13** | Madurai | Tamil Nadu | 9.9252° N, 78.1198° E | ~3,170 KM (Est.) | ~136 m | Editorial Content | Officially Sourced (MoRTH) |
| **14** | Kanyakumari | Tamil Nadu | 8.0883° N, 77.5385° E | ~3,810 KM (Est.) | ~10 m | Editorial Content | Officially Sourced (MoRTH) |

---

## 6. Official Corridor Length vs. Actual Road-Trip Driving Distance

- **MoRTH Listed Corridor Length (3,810 KM):** The definitive administrative listed corridor length under MoRTH Annexure II(d).
- **Actual Road-Trip Driving Distance:** Actual vehicular odometer distance varies depending on ring road bypasses (e.g. Eastern/Western Peripheral Expressway around Delhi), urban elevated flyovers, and local interchange choices.
- **Data Integrity Rule:** We do **not** cite any specific driving-distance range (such as 3,750–3,920 KM) as an established official fact. Any driving-distance calculation remains **independently unverified** until a formal routing engine calculation against a validated GIS road centerline is completed.
- **Application Display:** The website solely cites **3,810 KM** as the *MoRTH listed corridor length* and clearly qualifies all intermediate checkpoint distances as *approximate highway estimates* (`~KM`).

---

## 7. Map Representation Disclaimer

- The interactive map in [RouteMap.tsx](file:///d:/Desktop/Project/src/components/map/RouteMap.tsx) renders an **editorial corridor schematic** connecting 14 municipal centroids.
- It does **not** represent a surveyed, turn-by-turn road centerline trace.
- A true sub-kilometer GIS road trace will be incorporated in future phases when authoritative road centerline vectors are curated and downsampled.
