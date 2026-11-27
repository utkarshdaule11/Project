import {
  StateChapter,
  HeroData,
  IntroData,
  BiomeId,
  BiomeClassification,
} from "@/types/state";
export type { StateChapter, HeroData, IntroData, BiomeId, BiomeClassification };

export const introContent: IntroData = {
  title: "The Grand Bharat Highway",
  subtitle: "NH44 · Srinagar to Kanyakumari",
  startLabel: "Begin Corridor Expedition",
  skipLabel: "Skip",
  targetKm: 3810,
};

export const heroContent: HeroData = {
  kicker: "The Grand Bharat Highway",
  title: "KASHMIR TO\nKANYAKUMARI.",
  tagline:
    "One road. A thousand stories. A north-to-south expedition across India's extraordinary landscapes, cities, cultures and living heritage.",
  stats: [
    { label: "Corridor", value: "NH44" },
    { label: "Listed Length", value: "3,810 KM (MoRTH)" },
    { label: "Direction", value: "North to South" },
  ],
  fallbackImage: {
    src: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1800&q=85",
    alt: "Scenic Himalayan mountain highway with alpine snow-dusted ridges in Jammu and Kashmir",
  },
};

/**
 * Official NH44 Major-City Sequence (MoRTH Annexure II(d))
 *
 * Data Confidence & Geospatial Classification:
 * - order, name, stop: Officially Sourced (MoRTH Annexure II(d) Major-City Sequence)
 * - lat, lng: Approximate Municipal Centroids (Independent Geodetic Reference; not verified by MoRTH)
 * - distanceFromStartKm: Estimated highway milestone (~KM from Srinagar, planning reference)
 * - elevation: Approx. City-Centre Reference Elevation (~m MSL estimate; not a continuous road gradient profile)
 * - biome: Five-Zone Highway Corridor Classification (Himalayan-Alpine / Northern Mountain Descent, Indo-Gangetic, Central-India, Deccan-Tablelands, Southern-Basins)
 * - intro, tagline, routeContext: Editorial Content with Verified Infrastructure Landmarks
 * - culturalHighlights, famousLandmarks, foodAndExperiences: Editorial Content
 * - images: High-resolution licensed photographic assets (Staged Local Hosting)
 */
export const states: StateChapter[] = [
  {
    id: "srinagar",
    order: 1,
    name: "Jammu & Kashmir",
    stop: "Srinagar",
    tagline: "Where the road begins, beneath the snowlines of the Pir Panjal",
    lat: 34.0837,
    lng: 74.7973,
    distanceFromStartKm: 0,
    elevation: "1,585 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "himalayan-alpine",
      name: "Northern Mountain Descent & Submontane Gateway",
      description:
        "An editorial journey zone following the northern corridor from the Kashmir Valley toward the Shivalik-facing gateway and the alluvial plains. Stops are grouped by the highway's geographic journey, not by a claim of identical ecological biome classification.",
    },
    intro:
      "The northern origin of NH44 begins in the high-altitude bowl of the Kashmir Valley, ringed by the snow-crested ramparts of the Pir Panjal and Great Himalayan ranges. At an average municipal elevation of ~1,585 m, Srinagar is an ancient riverine capital shaped by Dal Lake, chinar-shaded Mughal promenades, and centuries of trans-Himalayan trade routes.",
    routeContext:
      "Starting point at Milestone 0. Heading south across the alluvial saffron terraces of Pampore, the highway pierces the Pir Panjal barrier via the Banihal corridor and the 9.28 km Dr. Syama Prasad Mookerjee (Chenani-Nashri) Tunnel [VERIFIED], descending through mountain gorges toward the sub-Himalayan Jammu foothills.",
    specialities: [
      {
        title: "Pampore Saffron",
        description:
          "Hand-harvested in autumn in the alluvial plateaus of Pampore, celebrated worldwide for high crocin potency.",
      },
      {
        title: "Pashmina & Kani Weaving",
        description:
          "Master craftsmen hand-spin fine Changthangi cashmere, weaving intricate floral patterns with wooden bobbins.",
      },
    ],
    culturalHighlights: [
      {
        title: "Kashmiri Sufi Musical Traditions",
        description:
          "The contemplative strains of Santoor and Rabab resonate through the historic courtyards of Downtown Srinagar.",
      },
      {
        title: "Pinewood Houseboat Architecture",
        description:
          "Carved cedar-wood floating residences dating to 19th-century craft conventions anchored along Dal and Nigeen lakes.",
      },
    ],
    famousLandmarks: [
      {
        name: "Dal Lake & Shikara Channels",
        description: "The beating aquatic heart of Srinagar, alive with floating vegetable markets at first light.",
      },
      {
        name: "Shankaracharya Hill",
        description: "An ancient basalt temple overlooking the valley and the meandering Jhelum river.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Royal Wazwan Feast",
        description: "A 36-course formal banquet featuring slow-cooked Rogan Josh, Gushtaba, and Rista prepared over woodfires.",
      },
      {
        name: "Morning Kahwa with Crushed Almonds",
        description: "Green tea brewed with saffron strands, crushed cardamom, and wild cinnamon.",
      },
    ],
    images: [
      {
        src: "/images/nh44/01-srinagar-dal-lake.webp",
        alt: "Sunrise over calm waters of Dal Lake with shikara boats in Srinagar, Kashmir",
        caption: "Sunrise over Dal Lake and shikaras, Srinagar",
        type: "landmark",
      },
    ],
  },
  {
    id: "jalandhar",
    order: 2,
    name: "Punjab",
    stop: "Jalandhar",
    tagline: "The Doaba gateway of ancient craftsmanship and fertile plains",
    lat: 31.326,
    lng: 75.5762,
    distanceFromStartKm: 410,
    elevation: "228 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "himalayan-alpine",
      name: "Northern Mountain Descent & Submontane Gateway",
      description:
        "An editorial journey zone following the northern corridor from the Kashmir Valley toward the Shivalik-facing gateway and the alluvial plains. Stops are grouped by the highway's geographic journey, not by a claim of identical ecological biome classification.",
    },
    intro:
      "Situated in the rich alluvial Doaba plain cradled between the Beas and Sutlej rivers, Jalandhar marks the transition where the sub-Himalayan piedmont dissolves into the flat, fertile agrarian heartland of Punjab. Renowned worldwide for artisan leatherwork, hand-stitched test cricket balls, and precision sports engineering.",
    routeContext:
      "Merging onto the historic Grand Trunk alignment south of the Beas River, the corridor traverses canal-irrigated wheat and mustard plains, transitioning out of the northern foothill drainage into the arterial agricultural spine of Punjab.",
    specialities: [
      {
        title: "Sports Goods Guilds",
        description:
          "Artisans stitch world-class cricket bats, leather balls, and footballs used across international test arenas.",
      },
      {
        title: "Phulkari Embroidery",
        description:
          "Traditional geometric silk thread floral embroidery hand-stitched on coarse homespun khaddar fabric.",
      },
    ],
    culturalHighlights: [
      {
        title: "Harballabh Sangeet Sammelan",
        description:
          "India's oldest festival of Hindustani classical music, held unbroken in Jalandhar since 1875.",
      },
      {
        title: "Doaba Agricultural Folklore",
        description:
          "Festive Bhangra and Giddha rhythms celebrating seasonal harvests across the canal-irrigated farmland.",
      },
    ],
    famousLandmarks: [
      {
        name: "Devi Talab Mandir",
        description: "An ancient 200-year-old temple sanctum situated beside a sacred temple pond.",
      },
      {
        name: "St. Mary's Cathedral",
        description: "A distinctive modern Franco-Indian church celebrated for its harmonious architectural lines.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Makki di Roti & Sarson ka Saag",
        description: "Stoneground corn flatbreads paired with slow-simmered mustard greens, jaggery, and white butter.",
      },
      {
        name: "Highway Kulchas & Lassi",
        description: "Crisp tandoor-baked potato kulchas served with spiced chole and thick sweet clay-cup lassi.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
        alt: "Vibrant golden mustard and wheat fields in Punjab along the highway corridor",
        caption: "Fertile agricultural fields of the Doaba plains near Jalandhar",
        type: "nature",
      },
      {
        src: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1200&q=80",
        alt: "Traditional clay oven tandoor bread making in a roadside Punjabi dhaba",
        caption: "Roadside highway culinary traditions along the Grand Trunk stretch",
        type: "landmark",
      },
    ],
  },
  {
    id: "ludhiana",
    order: 3,
    name: "Punjab",
    stop: "Ludhiana",
    tagline: "The industrious textile capital of the northern plains",
    lat: 30.901,
    lng: 75.8573,
    distanceFromStartKm: 470,
    elevation: "244 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "indo-gangetic",
      name: "Indo-Gangetic Alluvial Plains & Capital",
    },
    intro:
      "Sprawled across the southern floodplain of the Sutlej River, Ludhiana is Punjab's economic engine and manufacturing powerhouse. Hailed as the 'Manchester of India,' the city unites sprawling agrarian wealth with heavy engineering, precision bicycle manufacturing, and winter knitwear that supplies the entire subcontinent.",
    routeContext:
      "Navigating the Grand Trunk industrial bypass corridor [EDITORIAL / REGIONAL CONTEXT] south of the Sutlej River, the multi-lane expressway cuts through extensive freight distribution hubs, logistics staging yards, and iconic roadside dhabas.",
    specialities: [
      {
        title: "Fine Woolen Knitwear",
        description:
          "Known as the Manchester of India, Ludhiana produces premium thermal knitwear, merino sweaters, and shawls.",
      },
      {
        title: "Precision Bicycle Engineering",
        description:
          "The undisputed global hub of Indian bicycle design, building millions of precision steel commuter cycles annually.",
      },
    ],
    culturalHighlights: [
      {
        title: "Punjabi Entrepreneurship",
        description:
          "A celebrated legacy of self-reliant industrial design and innovative post-partition metalcraft.",
      },
      {
        title: "Kila Raipur Rural Olympics",
        description:
          "The legendary annual rural sporting spectacle celebrating bullock cart races, tug-of-war, and feats of strength.",
      },
    ],
    famousLandmarks: [
      {
        name: "Maharaja Ranjit Singh War Museum",
        description: "A monumental repository chronicling the valor and military heritage of the Sikh Empire.",
      },
      {
        name: "Historic Lodhi Fort",
        description: "Centuries-old brick ramparts built by Sultan Sikandar Lodhi guarding the Sutlej river crossing.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Authentic Highway Butter Chicken",
        description: "Tandoori chicken pulled and stewed in a rich velvet tomato gravy laced with fenugreek and cream.",
      },
      {
        name: "Warm Jalebi & Kadai Milk",
        description: "Crispy saffron sugar coils eaten straight from the boiling pan alongside slow-reduced whole milk.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        alt: "Busy modern highway corridor with trucks and transit at dusk",
        caption: "Logistics and transport pulse along the NH44 expressway near Ludhiana",
        type: "highway",
      },
      {
        src: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80",
        alt: "Traditional Indian sweets and delicacies prepared fresh",
        caption: "Artisanal sweetcraft and culinary heritage of Punjab",
        type: "landmark",
      },
    ],
  },
  {
    id: "ambala",
    order: 4,
    name: "Haryana",
    stop: "Ambala",
    tagline: "Historic cantonment crossroads linking the hills to the plains",
    lat: 30.3782,
    lng: 76.7767,
    distanceFromStartKm: 580,
    elevation: "264 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "indo-gangetic",
      name: "Indo-Gangetic Alluvial Plains & Capital",
    },
    intro:
      "A strategic transportation crossroads since the 19th century, Ambala lies where the drainage of the Shivalik foothill streams meets the broad Indo-Gangetic alluvial divide. Known both for its heritage 1843 military cantonment and as India's premier 'Science City,' manufacturing over a third of the nation's laboratory glassware and precision optical instruments.",
    routeContext:
      "The highway skirts the Shivalik foothill approaches [EDITORIAL / GEOGRAPHICAL] along the Haryana boundary, forming the primary transport junction where feeder traffic from Chandigarh and the Himachal ranges funnels southward toward the national capital.",
    specialities: [
      {
        title: "Scientific Instruments Guild",
        description:
          "Ambala produces nearly 40% of India's laboratory glass apparatus, microscopes, and precision measurement tools.",
      },
      {
        title: "Ceremonial Silk & Zari Textiles",
        description:
          "Renowned traditional bridal cloth markets drawing families from across three neighboring northern states.",
      },
    ],
    culturalHighlights: [
      {
        title: "1857 Cantonment Heritage",
        description:
          "One of India's earliest colonial cantonments, featuring historic garrison churches and red-brick barracks.",
      },
      {
        title: "Sufi Shrines of Ambala",
        description:
          "Ancient dargahs that have served as spiritual sanctuaries along the northern highway for six centuries.",
      },
    ],
    famousLandmarks: [
      {
        name: "St. Paul's Church Ruins",
        description: "Gothic church arches surviving from 1857, surrounded by tranquil shaded cantonment gardens.",
      },
      {
        name: "Gurudwara Manji Sahib",
        description: "Historic sacred shrine commemorating the visits of Guru Hargobind and Guru Tegh Bahadur.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Haryana Dal Makhani & Missi Roti",
        description: "Slow-simmered whole black urad dal cooked overnight on wood embers with spiced chickpea flatbreads.",
      },
      {
        name: "Highway Murthal Style Peda & Tea",
        description: "Rich caramelized milk fudge pedas served alongside ginger-infused clay-cup chai.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
        alt: "Grand open highway corridor stretching toward the horizon beneath evening sky",
        caption: "Open multi-lane NH44 corridor approaching the Haryana border",
        type: "highway",
      },
      {
        src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80",
        alt: "Authentic highway dhaba serving hot clay-baked flatbreads and rich lentils",
        caption: "Classic roadside dhaba hospitality across the Haryana corridor",
        type: "landmark",
      },
    ],
  },
  {
    id: "delhi",
    order: 5,
    name: "NCT of Delhi",
    stop: "Delhi",
    tagline: "The millennium-old seat of subcontinental empires",
    lat: 28.6139,
    lng: 77.209,
    distanceFromStartKm: 780,
    elevation: "216 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "indo-gangetic",
      name: "Indo-Gangetic Alluvial Plains & Capital",
    },
    intro:
      "The imperial pivot of the subcontinent along the western banks of the Yamuna River. Layered over millennia across eight historic dynasty centers—from the Tomara and Chauhan citadels to the sultanates, Mughals, and the stately avenues of New Delhi—the capital commands the northern plains as the political and infrastructural heart of India.",
    routeContext:
      "Traversing the National Capital Region, the corridor links with the peripheral bypass network at the Kundli interchange [VERIFIED INTERCHANGE / EXTERNAL TO NH44 MAINLINE], bridging the northern alluvial plains across the Yamuna basin toward the central uplands.",
    specialities: [
      {
        title: "Mughal Stone & Jali Inlay",
        description:
          "The enduring architectural art of pietra dura marble and red sandstone lattice carving.",
      },
      {
        title: "Old Delhi Spice Markets",
        description:
          "Khari Baoli, Asia's largest historic spice exchange trading cardamom, mace, and dried chilies since the 17th century.",
      },
    ],
    culturalHighlights: [
      {
        title: "Dastangoi & Urdu Poetry",
        description:
          "The revival of ancient storytelling and mushairas in the courtyards of Shahjahanabad.",
      },
      {
        title: "Living Craft Traditions",
        description:
          "Craft villages, handloom expos, and master artisans keeping classical textile and pottery arts alive.",
      },
    ],
    famousLandmarks: [
      {
        name: "Humayun's Tomb",
        description: "The seminal Persian-inspired red sandstone garden mausoleum that inspired the Taj Mahal.",
      },
      {
        name: "Qutb Minar Complex",
        description: "A 72.5-meter fluted sandstone minaret and 4th-century rust-resistant Iron Pillar.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Old Delhi Nihari & Sheermal",
        description: "Twelve-hour slow-cooked spiced shank broth eaten at dawn with saffron-infused baked leavened bread.",
      },
      {
        name: "Chandni Chowk Chaat",
        description: "Crisp potato tikki, dahi bhalla, and tangy tamarind water wafers prepared with heritage spice blends.",
      },
    ],
    images: [
      {
        src: "/images/nh44/05-delhi-humayuns-tomb.webp",
        alt: "Majestic Humayun's Tomb red sandstone facade and garden waterways in Delhi",
        caption: "Humayun's Tomb Mughal architecture, Delhi",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
        alt: "Qutb Minar red sandstone tower against a dramatic sky in New Delhi",
        caption: "Qutb Minar tower and 12th-century stone carvings, Delhi",
        type: "nature",
      },
    ],
  },
  {
    id: "gwalior",
    order: 6,
    name: "Madhya Pradesh",
    stop: "Gwalior",
    tagline: "The impregnable fortress citadel above the Chambal valley",
    lat: 26.2183,
    lng: 78.1828,
    distanceFromStartKm: 1110,
    elevation: "211 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "central-india",
      name: "Central Ravines, Bundelkhand & Zero Mile",
    },
    intro:
      "Rising abruptly on an isolated basaltic sandstone ridge 300 feet above the surrounding plains, Gwalior Fort anchors the northern threshold of Central India. Hailed by Babur as 'the pearl amongst the fortresses of Hind,' the city is the cradle of the Gwalior Gharana and courtly musical maestro Tansen, where royal Tomar and Scindia architecture presides over ancient trade routes.",
    routeContext:
      "Spanning the state boundary across the Chambal River Bridge [VERIFIED], the highway cuts through the eroded badlands and ravines of Morena, ascending from the Gangetic drainage into the rugged sandstone plateaus of northern Madhya Pradesh.",
    specialities: [
      {
        title: "Gwalior Gharana Music",
        description:
          "The oldest and most prestigious khayal singing tradition in Hindustani classical music, born under Tansen.",
      },
      {
        title: "Chanderi Weaving Vicinity",
        description:
          "Gwalior merchants trade the sheer silk, cotton, and gold zari Chanderi sarees woven in nearby historic settlements.",
      },
    ],
    culturalHighlights: [
      {
        title: "Tansen Sangeet Samaroh",
        description:
          "Annual world music festival held beside the legendary musician's tomb beneath an ancient tamarind tree.",
      },
      {
        title: "Tomar Dynasty Stone Architecture",
        description:
          "Intricate elephant-bracketed sandstone galleries and vibrant ceramic peacock tiles of the 15th-century Man Mandir.",
      },
    ],
    famousLandmarks: [
      {
        name: "Gwalior Fort & Man Mandir Palace",
        description: "Described by Emperor Babur as 'the pearl amongst the fortresses of Hind'.",
      },
      {
        name: "Saas Bahu Sandstone Temples",
        description: "Exquisite 11th-century dual Vishnu temples covered with intricate figurative friezes.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Gwalior Bedmi Poori & Aloo Sabzi",
        description: "Crispy lentil-stuffed deep-fried wheat pooris paired with spicy asafoetida-infused potato curry.",
      },
      {
        name: "Morena Gajak",
        description: "Crispy, wafer-thin sesame seed and jaggery confections hammered by hand in winter workshops.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1600100397608-f010f443a99e?auto=format&fit=crop&w=1200&q=80",
        alt: "The imposing stone walls and circular bastions of Gwalior Fort",
        caption: "Gwalior Fort sandstone bastions and palace battlements",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
        alt: "Intricate ancient stone temple architecture with detailed carved columns in central India",
        caption: "11th-century sandstone temple carvings in the Gwalior complex",
        type: "nature",
      },
    ],
  },
  {
    id: "jhansi",
    order: 7,
    name: "Uttar Pradesh",
    stop: "Jhansi",
    tagline: "The Bundelkhand citadel of valor and historic resistance",
    lat: 25.4484,
    lng: 78.5685,
    distanceFromStartKm: 1210,
    elevation: "284 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "central-india",
      name: "Central Ravines, Bundelkhand & Zero Mile",
    },
    intro:
      "The legendary bastion of the Bundelkhand plateau, immortalized by Rani Lakshmibai's leadership during the 1857 war of independence. Set amidst granite hills, dry thorn forests, and historic stone tank reservoirs, Jhansi represents the rugged cultural and geographical soul of north-central India.",
    routeContext:
      "The historic intersection of India's Golden Quadrilateral North–South (NH44) and East–West (NH27) highway corridors [VERIFIED HIGHWAY INTERSECTION], where a major grade-separated interchange connects the two primary subcontinental transport axes across the rocky Bundelkhand terrain.",
    specialities: [
      {
        title: "Bundelkhand Stone Carving",
        description:
          "Granite and sandstone masonry traditions cultivated across royal palaces and fortified temple gateways.",
      },
      {
        title: "Brass & Bell Metal Casting",
        description:
          "Artisans hand-cast traditional lamps, bells, and household vessels using lost-wax methods.",
      },
    ],
    culturalHighlights: [
      {
        title: "Rani Lakshmibai Memorials",
        description:
          "Oral ballads and commemorative military parades honoring the legendary 19th-century warrior queen.",
      },
      {
        title: "Bundeli Folk Theatre (Swang)",
        description:
          "Vibrant musical street theatre performed during festive seasons in village courtyards.",
      },
    ],
    famousLandmarks: [
      {
        name: "Jhansi Fort atop Bangira Hill",
        description: "A colossal 17th-century fortress featuring 10 defensive gates and panoramic vistas of the Bundelkhand plain.",
      },
      {
        name: "Rani Mahal",
        description: "Two-storey palace featuring exquisite multi-colored floral murals and ornate arched balconies.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Bundeli Kadhi & Samosas",
        description: "Spicy gram flour yogurt kadhi seasoned with fenugreek and served with crispy cumin potato samosas.",
      },
      {
        name: "Mawa Jalebi",
        description: "Dark caramelized milk-solid jalebis drenched in rose-scented syrup.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80",
        alt: "Historic stone fortress ramparts and watchtowers against the twilight sky",
        caption: "Historic stone fortifications of the Bundelkhand region at Jhansi",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=1200&q=80",
        alt: "Central Indian rural landscape and stone architecture",
        caption: "Rugged granite outcrops of the Bundelkhand plateau",
        type: "nature",
      },
    ],
  },
  {
    id: "nagpur",
    order: 8,
    name: "Maharashtra",
    stop: "Nagpur",
    tagline: "The Zero Mile geographic heart of the Indian subcontinent",
    lat: 21.1458,
    lng: 79.0882,
    distanceFromStartKm: 1630,
    elevation: "310 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "central-india",
      name: "Central Ravines, Bundelkhand & Zero Mile",
    },
    intro:
      "Marked by the British Zero Mile stone as the geographic center of undivided India, Nagpur is framed by teak-rich tiger reserves and celebrated as the Orange City of the Deccan. It is the crucial geographic hinge of the North–South corridor, bridging Central India's forests into the volcanic black-cotton soils of Vidarbha.",
    routeContext:
      "Traversing the Satpura-Maikal ecological belt, the corridor crosses the celebrated 16 km Pench Tiger Corridor Elevated Highway [VERIFIED]—an eco-engineered highway stretch featuring dedicated wildlife underpasses and acoustic sound barriers before entering the Vidarbha plateau.",
    specialities: [
      {
        title: "Vidarbha Tussar Silks",
        description:
          "Wild forest-harvested golden tussar silk spun and woven by indigenous tribal guilds in nearby Bhandara.",
      },
      {
        title: "Nagpur Orange Cultivation",
        description:
          "Sweet-and-tart mandarin oranges harvested twice a year from extensive volcanic soil orchards.",
      },
    ],
    culturalHighlights: [
      {
        title: "Deekshabhoomi Dhamma Pilgrimage",
        description:
          "The sacred monument where Dr. B.R. Ambedkar led the historic Buddhist revival movement in 1956.",
      },
      {
        title: "Marbat Festival",
        description:
          "A unique centuries-old procession of towering effigies paraded to ward off civic malevolence.",
      },
    ],
    famousLandmarks: [
      {
        name: "Zero Mile Stone & Pillar",
        description: "The sandstone obelisk and 4 sculpted horses erected in 1907 to measure all highway distances in India.",
      },
      {
        name: "Deekshabhoomi Stupa",
        description: "The largest hollow Buddhist stupa in Asia, crowned with a graceful arched hemispherical dome.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Fiery Saoji Mutton / Chicken",
        description: "A volcanic, deeply spiced meat curry prepared with a secret blend of 32 roasted whole spices.",
      },
      {
        name: "Tarri Poha with Chana",
        description: "Flatted rice topped with a scorching, piping-hot chickpea broth, fresh onions, and sev.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        alt: "The lush forests and nature corridors around the Central Indian plateau",
        caption: "Pench and Satpura forest reserves surrounding the Nagpur corridor",
        type: "nature",
      },
      {
        src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        alt: "Highway road leading through forested hills in central India",
        caption: "NH44 forest flyway bridging central wildlife sanctuaries",
        type: "highway",
      },
    ],
  },
  {
    id: "hyderabad",
    order: 9,
    name: "Telangana",
    stop: "Hyderabad",
    tagline: "The City of Pearls, Golconda diamonds and Deccan heritage",
    lat: 17.385,
    lng: 78.4867,
    distanceFromStartKm: 2130,
    elevation: "542 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "deccan-tablelands",
      name: "Granite Deccan Tablelands & Ghat Passes",
    },
    intro:
      "Perched on the undulating granite plateau of the northern Deccan at ~542 m, Hyderabad unites 400 years of Qutb Shahi and Asaf Jahi courtly splendor with modern biotechnology and software corridors. Famed for its Golconda diamond treasuries, natural pearl-drilling bazaars, balancing boulder landscapes, and fragrant slow-cooked biryanis.",
    routeContext:
      "Traversing the undulating pre-Cambrian granite tablelands of the Deccan [EDITORIAL / GEOLOGICAL CONTEXT], the multi-lane expressway navigates past ancient tors and semi-arid scrub plateaus, heading south across the Krishna and Tungabhadra river basins.",
    specialities: [
      {
        title: "Bidriware Metal Inlay",
        description:
          "Striking blackened zinc-copper alloy inlaid with pure silver wire motifs, refined in the Deccan sultanates.",
      },
      {
        title: "Basra & South Sea Pearl Drilling",
        description:
          "Traditional artisans in the old bazaar grade, pierce, and string world-renowned pearl necklaces.",
      },
    ],
    culturalHighlights: [
      {
        title: "Deccani Urdu Ghazal Culture",
        description:
          "Courtly traditions of poetry, calligraphy, and polite Tehzeeb nurtured through the Nizam's dynasty.",
      },
      {
        title: "Bonalu & Bathukamma Celebrations",
        description:
          "Telangana's vibrant folk flower festivals honouring Mother Nature with multi-tiered floral arrangements.",
      },
    ],
    famousLandmarks: [
      {
        name: "Charminar Monument",
        description: "The 1591 triumphal archway with four 56-meter stucco-adorned minarets anchoring the Old City.",
      },
      {
        name: "Golconda Fort Citadel",
        description: "The medieval mountain fortress famed for its acoustic whispering galleries and diamond treasuries.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Hyderabadi Dum Biryani",
        description: "Marinated meat and aged long-grain basmati rice sealed in a copper deg with dough and slow-steamed over coals.",
      },
      {
        name: "Irani Chai & Osmania Biscuits",
        description: "Rich condensed-milk tea served in glass tumblers with sweet-and-salty cumin butter biscuits.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=1200&q=80",
        alt: "The iconic Charminar monument illuminated in the heart of Hyderabad",
        caption: "The Charminar 16th-century monument, Hyderabad",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80",
        alt: "Rugged granite boulders and landscape of the Deccan plateau around Hyderabad",
        caption: "Granite boulder formations of the Deccan plateau, Hyderabad",
        type: "nature",
      },
    ],
  },
  {
    id: "bangalore",
    order: 10,
    name: "Karnataka",
    stop: "Bangalore",
    tagline: "The high-altitude garden capital and silicon frontier",
    lat: 12.9716,
    lng: 77.5946,
    distanceFromStartKm: 2700,
    elevation: "920 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "deccan-tablelands",
      name: "Granite Deccan Tablelands & Ghat Passes",
    },
    intro:
      "Resting at an elevated ~920 m upon the ridge of the Mysore plateau, Bangalore enjoys a temperate upland climate that nurtured colonial rain-tree boulevards, Lalbagh botanical glass pavilions, and India's preeminent aerospace and technology frontier. Marking the highest municipal elevation along the southern corridor.",
    routeContext:
      "The highway bypasses dense metropolitan traffic via the 9.98 km Bangalore Electronic City Elevated Expressway [VERIFIED] along Hosur Road, carrying interstate traffic seamlessly south across the Karnataka-Tamil Nadu state boundary.",
    specialities: [
      {
        title: "Mysore Silk & Sandalwood",
        description:
          "Lustrous gold-zari mulberry silks and delicate fragrant sandalwood carvings from royal artisans.",
      },
      {
        title: "Specialty Shade-Grown Coffee",
        description:
          "Single-origin Arabica and Robusta beans cultivated in the nearby Western Ghats estates roasted fresh across city roasteries.",
      },
    ],
    culturalHighlights: [
      {
        title: "Classical Carnatic & Indie Music",
        description:
          "From heritage sabhas in Malleswaram to energetic live music amphitheaters in Indiranagar.",
      },
      {
        title: "Bengaluru Karaga Festival",
        description:
          "The centuries-old nocturnal floral pot procession dedicated to Draupadi, winding through the historic Pete quarters.",
      },
    ],
    famousLandmarks: [
      {
        name: "Lalbagh Glass House",
        description: "The 1889 cast-iron botanical pavilion modeled after London's Crystal Palace, set among ancient trees.",
      },
      {
        name: "Vidhana Soudha",
        description: "The colossal Neo-Dravidian granite legislative assembly building inscribed with 'Government Work is God's Work'.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Crispy Benne Masala Dosa",
        description: "Crisp, golden fermented rice crepe roasted with pure white butter, spiced potato masala, and coconut chutney.",
      },
      {
        name: "Degree Filter Coffee",
        description: "Dark chicory-infused decoction pulled with frothy boiling milk in a traditional brass dabarah and tumbler.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
        alt: "The ornate Bangalore Palace Tudor-style stone towers and gardens",
        caption: "Bangalore Palace Tudor-style architecture and gardens",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&w=1200&q=80",
        alt: "Lush green botanical gardens and ancient trees in Bangalore",
        caption: "Lalbagh botanical canopy and rain trees on the Mysore plateau",
        type: "nature",
      },
    ],
  },
  {
    id: "salem",
    order: 11,
    name: "Tamil Nadu",
    stop: "Salem",
    tagline: "Steel, silk and granite cradled by the Shevaroy Hills",
    lat: 11.6643,
    lng: 78.146,
    distanceFromStartKm: 2900,
    elevation: "278 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "deccan-tablelands",
      name: "Granite Deccan Tablelands & Ghat Passes",
    },
    intro:
      "Encircled by the blue-shadowed granite ridges of the Eastern Ghats, Salem is an ancient commercial and metallurgical center in the Kongu region. Famed for its stainless steel alloy production, GI-tagged Venpattu pure white mulberry silks, and aromatic mango orchards lining the foothills of the Shevaroy range.",
    routeContext:
      "Descending from the Mysore plateau through the steep engineering gradients and hairpin bends of the Thoppur Ghat Pass [VERIFIED], the highway drops over 400 vertical meters into the interior agrarian plains of Tamil Nadu.",
    specialities: [
      {
        title: "Salem Venpattu Silk Weaving",
        description:
          "Fine handwoven pure white and ivory silk dhotis and sarees prized across South Indian ceremonial occasions.",
      },
      {
        title: "Silver Anklet & Jewelry Craft",
        description:
          "Cottage industries in Shevapet handcraft delicate silver payals exported across all of India.",
      },
    ],
    culturalHighlights: [
      {
        title: "Eastern Ghats Tribal Heritage",
        description:
          "Indigenous Malayali tribal customs, organic coffee plantations, and spice orchards in the Shevaroy range.",
      },
      {
        title: "Kottai Mariamman Temple Festivals",
        description:
          "Energetic annual temple celebrations with rhythmic thappu percussion and floral offerings.",
      },
    ],
    famousLandmarks: [
      {
        name: "Yercaud Mountain Ascent",
        description: "The 20 hairpin bends leading 1,500 meters up into the tranquil coffee plantations of the Shevaroy hills.",
      },
      {
        name: "Kottai Mariamman Temple",
        description: "An ancient fortress-city temple located along the banks of the historic Thirumanimutharu river.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Salem Thattu Vadai Set",
        description: "Crispy spiced rice crackers sandwiched with fresh grated beetroot, carrot, onion, and spicy garlic chutney.",
      },
      {
        name: "Kongu Mutton Chukka",
        description: "Dry-roasted tender meat cooked in stone-ground shallots, dry red chilies, and cold-pressed sesame oil.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        alt: "Highway road winding through misted hills and mountain passes",
        caption: "NH44 descent through the Thoppur ghat pass near Salem",
        type: "highway",
      },
      {
        src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        alt: "Misted mountain ridges of the Eastern Ghats at sunrise",
        caption: "Shevaroy Hills and mountain ranges encircling Salem",
        type: "nature",
      },
    ],
  },
  {
    id: "namakkal",
    order: 12,
    name: "Tamil Nadu",
    stop: "Namakkal",
    tagline: "The monolithic fortress rock and subcontinental transport crossroads",
    lat: 11.2189,
    lng: 78.1674,
    distanceFromStartKm: 2950,
    elevation: "218 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "southern-basins",
      name: "Kaveri Basin, Sangam Plain & Ocean Littoral",
    },
    intro:
      "Dominated by a single colossal granite monolith rising 200 feet out of the city center with a 16th-century Nayaka fort crown, Namakkal is also the logistics capital of South India. The town serves as a vital national hub for commercial vehicle bodybuilding, freight lorry maintenance, and poultry logistics.",
    routeContext:
      "Traversing the fertile agrarian Kaveri River basin, the highway corridor passes through extensive logistics yards and truck bodybuilding workshops [VERIFIED INDUSTRIAL / LOGISTICS CONTEXT] that support national long-haul freight operations.",
    specialities: [
      {
        title: "Automotive Coach & Chassis Building",
        description:
          "Skilled metalworkers craft customized truck bodies, refrigerated cabins, and trailers for national freight.",
      },
      {
        title: "Rock-Cut Cave Temple Sculpture",
        description:
          "Eighth-century Adiyaman rock-cut shrine carvings depicting Narasimha and Ranganatha in solid bedrock.",
      },
    ],
    culturalHighlights: [
      {
        title: "Truck Logistics Brotherhood",
        description:
          "A celebrated community of interstate drivers, transport operators, and master mechanics powering Indian trade.",
      },
      {
        title: "Kolli Hills Medicinal Ecology",
        description:
          "Nearby Kolli range famous for 70 continuous hairpin bends, medicinal herbs, and pure mountain forest honey.",
      },
    ],
    famousLandmarks: [
      {
        name: "Namakkal Durgam Rock Fort",
        description: "A monumental single-rock fortress covering 1.5 acres built by Ramachandra Nayaka in the 16th century.",
      },
      {
        name: "18-Foot Monolithic Anjaneyar Statue",
        description: "An open-sky monolithic stone idol standing facing the rock-cut cave temples.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Kongunadu Nattu Kozhi Curry",
        description: "Country chicken simmered with freshly ground coriander, shallots, cumin, and coconut milk.",
      },
      {
        name: "Fresh Kaveri Basin Tender Coconut",
        description: "Refreshing sweet water straight from green coconuts cut fresh along the highway shoulders.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80",
        alt: "Imposing ancient single rock hill fort under a dramatic sky",
        caption: "The monolithic granite rock fortress dominating Namakkal",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
        alt: "Straight highway lined with coconut palm trees in southern India",
        caption: "NH44 through the fertile agrarian Kaveri river plains",
        type: "highway",
      },
    ],
  },
  {
    id: "madurai",
    order: 13,
    name: "Tamil Nadu",
    stop: "Madurai",
    tagline: "The eternal temple metropolis of Tamil Sangam poetry",
    lat: 9.9252,
    lng: 78.1198,
    distanceFromStartKm: 3170,
    elevation: "136 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "southern-basins",
      name: "Kaveri Basin, Sangam Plain & Ocean Littoral",
    },
    intro:
      "Continuously inhabited for over 2,500 years along the sacred Vaigai River, Madurai was the capital of the ancient Pandyan dynasty and the historic seat of the classical Tamil Sangam literary assemblies. The city's concentric lotus-petal street plan radiates outward from the monumental sculpted gopurams of the Meenakshi Sundareswarar Temple.",
    routeContext:
      "Crossing the alluvial floodplain of the Vaigai River basin [EDITORIAL / HYDROGRAPHICAL CONTEXT], the corridor traverses red-loam agricultural plains and ancient canal irrigation systems toward the southern tip of the peninsula.",
    specialities: [
      {
        title: "Madurai Malli (Jasmine)",
        description:
          "Globally prized GI-tagged jasmine flowers with an intense, lingering fragrance woven into ceremonial garlands.",
      },
      {
        title: "Sungudi Cotton Tie-Dye",
        description:
          "Saurashtrian migrant artisans hand-tie minute knots into soft cotton sarees dyed in natural mineral tones.",
      },
    ],
    culturalHighlights: [
      {
        title: "Ancient Tamil Sangam Literature",
        description:
          "The birthplace of classical Tamil poetry celebrating ethical governance, love, and heroism 2,000 years ago.",
      },
      {
        title: "Chithirai Festival Spectacle",
        description:
          "Over a million pilgrims gather for the celestial wedding of Goddess Meenakshi and the procession of Lord Kallazhagar.",
      },
    ],
    famousLandmarks: [
      {
        name: "Meenakshi Amman Temple Gopurams",
        description: "Fourteen monumental multi-tiered gateway towers covered in thousands of vibrant mythological sculptures.",
      },
      {
        name: "Thirumalai Nayakkar Palace",
        description: "A 17th-century masterpiece blending Italian and Dravidian styles with massive stucco-coated stone pillars.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Madurai Jigarthanda",
        description: "A celebrated cooling dessert drink of almond gum, reduced milk, sarsaparilla syrup, and handmade ice cream.",
      },
      {
        name: "Kari Dosa & Bun Parotta",
        description: "Fluffy bun parottas served with spicy mutton salna and three-layered meat-topped crispy dosas.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
        alt: "The majestic multi-tiered gopuram towers of Meenakshi Temple in Madurai",
        caption: "Meenakshi Amman Temple gopuram towers, Madurai",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
        alt: "Temple architecture carvings and stone pillars in Tamil Nadu",
        caption: "Carved stone corridors and temple architecture, Madurai",
        type: "nature",
      },
    ],
  },
  {
    id: "kanyakumari",
    order: 14,
    name: "Tamil Nadu",
    stop: "Kanyakumari",
    tagline: "The sacred cape where three oceans meet at the edge of the subcontinent",
    lat: 8.0883,
    lng: 77.5385,
    distanceFromStartKm: 3810,
    elevation: "10 m (Approx. City-Centre Reference Elevation)",
    biome: {
      id: "southern-basins",
      name: "Kaveri Basin, Sangam Plain & Ocean Littoral",
    },
    intro:
      "The dramatic southern terminus of NH44 and the Indian landmass at Cape Comorin. Here, the continental peninsula narrows to a rocky point where the waters of the Arabian Sea, the Bay of Bengal, and the Indian Ocean converge at the coastal Triveni Sangam. A place of extraordinary ocean sunrises, multi-hued mineral beach sands, and offshore granite memorials.",
    routeContext:
      "Final milestone of the 3,810 KM MoRTH corridor. The highway terminates along the southern cape littoral [EDITORIAL / GEOGRAPHICAL CONFLUENCE — NOT AN INFRASTRUCTURE TERMINAL], where the continental highway network meets the open waters of the Indian Ocean.",
    specialities: [
      {
        title: "Multi-Coloured Beach Sands",
        description:
          "Unique coastal sands naturally tinted in shades of red, black, and yellow from garnet, ilmenite, and monazite minerals.",
      },
      {
        title: "Seashell Carving & Craft",
        description:
          "Artisans carve mother-of-pearl shells and conches with spiritual and nautical imagery.",
      },
    ],
    culturalHighlights: [
      {
        title: "Triveni Sangam Convergence",
        description:
          "Pilgrims gather at dawn to immerse in the sacred waters where three major subcontinental water bodies meet.",
      },
      {
        title: "Swami Vivekananda Meditation Legacy",
        description:
          "The rock memorial marks the offshore islet where Swami Vivekananda meditated in 1892 before his world mission.",
      },
    ],
    famousLandmarks: [
      {
        name: "Vivekananda Rock Memorial",
        description: "A serene red and blue granite meditation hall perched on twin rocky islets 500 meters offshore.",
      },
      {
        name: "133-Foot Thiruvalluvar Statue",
        description: "Colossal stone monument honoring the celebrated Tamil philosopher and poet of the Tirukkural.",
      },
    ],
    foodAndExperiences: [
      {
        name: "Coastal Kanyakumari Fish Curry",
        description: "Fresh ocean catch simmered in freshly ground coconut paste, kudampuli, green chilies, and curry leaves.",
      },
      {
        name: "Pazha Bajji & Nannari Sarbath",
        description: "Golden batter-fried sweet Nendran bananas served with cooling wild sarsaparilla herb sherbet.",
      },
    ],
    images: [
      {
        src: "/images/nh44/14-kanyakumari-rock-memorial.webp",
        alt: "Vivekananda Rock Memorial perched on offshore granite rock at Cape Comorin, Kanyakumari",
        caption: "Vivekananda Rock Memorial and Thiruvalluvar Statue, Kanyakumari",
        type: "landmark",
      },
      {
        src: "https://images.unsplash.com/photo-1707408350511-7c97527bce8b?auto=format&fit=crop&w=1200&q=80",
        alt: "Dramatic sunrise over the ocean confluence at Triveni Sangam in Kanyakumari",
        caption: "Tri-ocean convergence at dawn at India's southern terminus",
        type: "nature",
      },
    ],
  },
];
