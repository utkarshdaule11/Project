import { StateChapter, HeroData, IntroData } from "@/types/state";
export type { StateChapter, HeroData, IntroData };

export const introContent: IntroData = {
  title: "Kashmir to Kanyakumari",
  subtitle: "Heading to Kanyakumari",
  startLabel: "Start your journey",
  skipLabel: "Skip",
  targetKm: 3800,
};

export const heroContent: HeroData = {
  kicker: "The Grand Bharat Highway",
  title: "Kashmir to Kanyakumari",
  tagline: "3,700 kilometres across six states along India's historic north-to-south highway spine.",
  stats: [
    { label: "Distance", value: "3,700 KM" },
    { label: "Corridor", value: "NH 44" },
    { label: "Checkpoints", value: "6 States" },
  ],
  fallbackImage: {
    src: "/images/hero-compass-fallback.svg",
    alt: "Illustrated highway compass with winding saffron road ribbon",
  },
};

export const states: StateChapter[] = [
  {
    id: "kashmir",
    order: 1,
    name: "Jammu & Kashmir",
    stop: "Srinagar",
    tagline: "Where the road begins, high in the Himalaya",
    lat: 34.0837,
    lng: 74.7973,
    intro:
      "The journey starts in the Kashmir Valley, where Mughal gardens step down to Dal Lake and snow-covered Pir Panjal ridges frame every horizon. Mornings here are cold, quiet and unhurried.",
    specialities: [
      {
        title: "Kashmiri Saffron",
        description:
          "Grown in Pampore and hand-harvested in autumn, prized for its intense aroma and deep golden hue.",
      },
      {
        title: "Pashmina & Kani Weaving",
        description:
          "Master artisans in Srinagar spin fine Pashmina wool and weave intricate Kani shawls with wooden bobbins.",
      },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=900&q=80", alt: "Dal Lake houseboats and carved shikara boats in Srinagar", caption: "Dal Lake and shikaras at sunrise, Srinagar", type: "landmark" },
      { src: "https://images.unsplash.com/photo-1661747340818-df15f186554e?auto=format&fit=crop&w=900&q=80", alt: "Pahalgam and Gulmarg Himalayan alpine valley pine forest", caption: "Gulmarg meadows below the Pir Panjal range", type: "nature" },
    ],
  },
  {
    id: "rajasthan",
    order: 2,
    name: "Rajasthan",
    stop: "Jaipur",
    tagline: "Forts, colour and the edge of the desert",
    lat: 26.9124,
    lng: 75.7873,
    intro:
      "Heading south, the terrain turns to pink sandstone and bright sun. Rajasthan is a land of hilltop fortresses, ornate royal palaces and bustling bazaars edged by the Thar Desert.",
    specialities: [
      {
        title: "Block Printing",
        description:
          "In Sanganer and Bagru, artisans stamp cotton with hand-carved teak woodblocks and natural plant dyes.",
      },
      {
        title: "Dal Baati Churma",
        description:
          "Crisp baked whole-wheat dumplings crushed into fragrant spiced lentils, drenched in pure cow ghee and churma.",
      },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=900&q=80", alt: "Hawa Mahal pink sandstone honeycomb facade in Jaipur", caption: "Hawa Mahal, the Palace of Winds, Jaipur", type: "landmark" },
      { src: "https://images.unsplash.com/photo-1633319755208-26bef3342d34?auto=format&fit=crop&w=900&q=80", alt: "Rippled golden sand dunes of the Thar Desert near Jaisalmer", caption: "Thar Desert dunes near Jaisalmer at dusk", type: "nature" },
    ],
  },
  {
    id: "gujarat",
    order: 3,
    name: "Gujarat",
    stop: "Ahmedabad",
    tagline: "Heritage architecture, vibrant textiles and endless white salt flats",
    lat: 23.0225,
    lng: 72.5714,
    intro:
      "Gujarat unites architectural heritage with remarkable salt desert landscapes. Ahmedabad is India's first UNESCO World Heritage City, leading outward to the great salt marshes of Kutch.",
    specialities: [
      {
        title: "Bandhani Tie-Dye",
        description:
          "Craftswomen in Kutch and Jamnagar tie thousands of minute thread knots into mulberry silks before dyeing.",
      },
      {
        title: "Gujarati Thali",
        description:
          "A generous spread harmonising sweet, savory and spiced flavours with hot rotlis, farsan, shaak, dal and chaas.",
      },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1701796784170-60980a4745f7?auto=format&fit=crop&w=900&q=80", alt: "Adalaj Stepwell subterranean carved sandstone architecture in Gujarat", caption: "Adalaj Stepwell (Adalaj Ni Vav), Gandhinagar / Ahmedabad", type: "landmark" },
      { src: "https://images.unsplash.com/photo-1780681426080-0486829a0d07?auto=format&fit=crop&w=900&q=80", alt: "Crystalline white salt desert horizon across the Great Rann of Kutch", caption: "White Rann of Kutch salt desert horizon", type: "nature" },
    ],
  },
  {
    id: "maharashtra",
    order: 4,
    name: "Maharashtra",
    stop: "Mumbai",
    tagline: "From the Arabian Sea harbor to misty Western Ghats",
    lat: 19.076,
    lng: 72.8777,
    intro:
      "Maharashtra greets travelers at Mumbai, a historic port city and financial powerhouse, then ascends into the ancient basalt peaks and waterfalls of the Sahyadri mountains.",
    specialities: [
      {
        title: "Vada Pav",
        description:
          "Mumbai's definitive street snack: a golden spiced potato vada tucked in a soft pav with garlic chutney.",
      },
      {
        title: "Paithani Sarees",
        description:
          "Handwoven in Paithan with pure mulberry silk and gold zari borders, featuring regal peacock pallu motifs.",
      },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80", alt: "Gateway of India monument arch overlooking Mumbai Harbour at sunset", caption: "Gateway of India, Mumbai Harbour", type: "landmark" },
      { src: "https://images.unsplash.com/photo-1712186869971-24b3e49b1375?auto=format&fit=crop&w=900&q=80", alt: "Verdant peaks and monsoon waterfalls across the Sahyadri Western Ghats", caption: "Sahyadri range and Western Ghats escarpment", type: "nature" },
    ],
  },
  {
    id: "goa",
    order: 5,
    name: "Goa",
    stop: "Panaji",
    tagline: "Baroque churches, coastal villages and palm-lined bays",
    lat: 15.4909,
    lng: 73.8278,
    intro:
      "The highway slows along the Konkan coast in Goa. Portuguese heritage mansions, whitewashed chapels, lush coconut groves and golden beaches offer a warm coastal respite.",
    specialities: [
      {
        title: "Goan Fish Curry Rice",
        description:
          "Fresh catch simmered in coconut gravy with tart kokum and red chillies, served over steaming rice.",
      },
      {
        title: "Bebinca",
        description:
          "A traditional sixteen-layer Goan dessert made from coconut milk, egg yolks, nutmeg and caramelized ghee.",
      },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1706940119676-957a79a61248?auto=format&fit=crop&w=900&q=80", alt: "Basilica of Bom Jesus Baroque church facade in Old Goa", caption: "Basilica of Bom Jesus, Old Goa", type: "landmark" },
      { src: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80", alt: "Curved tropical sandy bay lined with coconut palms in South Goa", caption: "Palolem coastal shoreline and coconut palms, South Goa", type: "nature" },
    ],
  },
  {
    id: "kanyakumari",
    order: 6,
    name: "Tamil Nadu",
    stop: "Kanyakumari",
    tagline: "The southern terminus, where three oceans converge",
    lat: 8.0883,
    lng: 77.5385,
    intro:
      "The highway reaches its dramatic conclusion at Cape Comorin, where the Arabian Sea, the Bay of Bengal and the Indian Ocean unite at the southernmost point of mainland India.",
    specialities: [
      {
        title: "Kanchipuram Silk",
        description:
          "Heavy lustrous silk woven with gold zari threads, known for korvai borders inspired by temple gopurams.",
      },
      {
        title: "Chettinad Cuisine",
        description:
          "Heritage cooking seasoned with star anise, black pepper, stone flower kalpasi and aromatic roasted spices.",
      },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1704019541434-550af5403e7f?auto=format&fit=crop&w=900&q=80", alt: "Vivekananda Rock Memorial and Thiruvalluvar Statue on rocky islets offshore", caption: "Vivekananda Rock Memorial, Kanyakumari", type: "landmark" },
      { src: "https://images.unsplash.com/photo-1707408350511-7c97527bce8b?auto=format&fit=crop&w=900&q=80", alt: "Sunrise over the ocean confluence at Triveni Sangam in Kanyakumari", caption: "Triveni Sangam tri-ocean confluence at dawn", type: "nature" },
    ],
  },
];
