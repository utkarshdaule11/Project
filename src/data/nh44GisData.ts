export interface Nh44CheckpointGis {
  id: string;
  order: number;
  name: string;
  jurisdiction: string;
  snappedLat: number;
  snappedLng: number;
  centroidLat: number;
  centroidLng: number;
  offsetMeters: number;
  cumulativeHighwayKm: number;
  highwayRef: string;
  labelAlign: "start" | "end";
  labelDx: number;
  labelDy: number;
  isOrigin?: boolean;
  isTerminus?: boolean;
}

export interface LodMetadataItem {
  level: 0 | 1 | 2;
  label: string;
  shortLabel: string;
  filename: string;
  path: string;
  targetVertices: number;
  actualVertices: number;
  toleranceMeters: number;
  toleranceDisplay: string;
  totalLengthKm: number;
  payloadGzipKb: number;
  description: string;
}

export const NH44_LOD_CONFIGS: Record<0 | 1 | 2, LodMetadataItem> = {
  2: {
    level: 2,
    label: "LOD 2 · Overview",
    shortLabel: "LOD 2",
    filename: "nh44-route-lod2.geojson",
    path: "/data/nh44/nh44-route-lod2.geojson",
    targetVertices: 600,
    actualVertices: 593,
    toleranceMeters: 580,
    toleranceDisplay: "±580 m",
    totalLengthKm: 3528.27,
    payloadGzipKb: 7.5,
    description: "Subcontinental silhouette for national overview and small viewports",
  },
  1: {
    level: 1,
    label: "LOD 1 · Balanced",
    shortLabel: "LOD 1",
    filename: "nh44-route-lod1.geojson",
    path: "/data/nh44/nh44-route-lod1.geojson",
    targetVertices: 4000,
    actualVertices: 4032,
    toleranceMeters: 30,
    toleranceDisplay: "±30 m",
    totalLengthKm: 3603.56,
    payloadGzipKb: 41.3,
    description: "Production default with sharp road curvature and snappy performance",
  },
  0: {
    level: 0,
    label: "LOD 0 · Full Detail",
    shortLabel: "LOD 0",
    filename: "nh44-route-lod0.geojson",
    path: "/data/nh44/nh44-route-lod0.geojson",
    targetVertices: 43089,
    actualVertices: 43089,
    toleranceMeters: 0,
    toleranceDisplay: "Exact (0 m)",
    totalLengthKm: 3612.21,
    payloadGzipKb: 385.1,
    description: "Unsimplified authoritative road geometry from OpenStreetMap master relation",
  },
};

/**
 * 14 Major-City Editorial Checkpoints on NH44
 * Geodetically snapped to OSM centerline geometry (Relation 11568320)
 * Metric Geodesic Point-to-Segment Orthogonal Projection (WGS84 EPSG:4326)
 */
export const NH44_CHECKPOINTS_GIS: Nh44CheckpointGis[] = [
  {
    id: "srinagar",
    order: 1,
    name: "Srinagar",
    jurisdiction: "Jammu & Kashmir",
    snappedLat: 34.035712,
    snappedLng: 74.860096,
    centroidLat: 34.0837,
    centroidLng: 74.7973,
    offsetMeters: 7870,
    cumulativeHighwayKm: 0,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: 4,
    isOrigin: true,
  },
  {
    id: "jalandhar",
    order: 2,
    name: "Jalandhar",
    jurisdiction: "Punjab",
    snappedLat: 31.35206,
    snappedLng: 75.594532,
    centroidLat: 31.326,
    centroidLng: 75.5762,
    offsetMeters: 3380.6,
    cumulativeHighwayKm: 451.14,
    highwayRef: "NH44",
    labelAlign: "end",
    labelDx: -16,
    labelDy: -2,
  },
  {
    id: "ludhiana",
    order: 3,
    name: "Ludhiana",
    jurisdiction: "Punjab",
    snappedLat: 30.908087,
    snappedLng: 75.880669,
    centroidLat: 30.901,
    centroidLng: 75.8573,
    offsetMeters: 2364.8,
    cumulativeHighwayKm: 515.12,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: 6,
  },
  {
    id: "ambala",
    order: 4,
    name: "Ambala",
    jurisdiction: "Haryana",
    snappedLat: 30.385998,
    snappedLng: 76.784655,
    centroidLat: 30.3782,
    centroidLng: 76.7767,
    offsetMeters: 1155.1,
    cumulativeHighwayKm: 621.02,
    highwayRef: "NH44",
    labelAlign: "end",
    labelDx: -16,
    labelDy: 4,
  },
  {
    id: "delhi",
    order: 5,
    name: "Delhi",
    jurisdiction: "NCT of Delhi",
    snappedLat: 28.622985,
    snappedLng: 77.24762,
    centroidLat: 28.6139,
    centroidLng: 77.209,
    offsetMeters: 3902.7,
    cumulativeHighwayKm: 832.56,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: 4,
  },
  {
    id: "gwalior",
    order: 6,
    name: "Gwalior",
    jurisdiction: "Madhya Pradesh",
    snappedLat: 26.191117,
    snappedLng: 78.234721,
    centroidLat: 26.2183,
    centroidLng: 78.1828,
    offsetMeters: 5997.3,
    cumulativeHighwayKm: 1164.63,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: 4,
  },
  {
    id: "jhansi",
    order: 7,
    name: "Jhansi",
    jurisdiction: "Uttar Pradesh",
    snappedLat: 25.474552,
    snappedLng: 78.543084,
    centroidLat: 25.4484,
    centroidLng: 78.5685,
    offsetMeters: 3868.7,
    cumulativeHighwayKm: 1258.34,
    highwayRef: "NH27;NH44",
    labelAlign: "end",
    labelDx: -16,
    labelDy: 4,
  },
  {
    id: "nagpur",
    order: 8,
    name: "Nagpur",
    jurisdiction: "Maharashtra",
    snappedLat: 21.069151,
    snappedLng: 79.132103,
    centroidLat: 21.1458,
    centroidLng: 79.0882,
    offsetMeters: 9663.5,
    cumulativeHighwayKm: 1873.83,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: 4,
  },
  {
    id: "hyderabad",
    order: 9,
    name: "Hyderabad",
    jurisdiction: "Telangana",
    snappedLat: 17.383783,
    snappedLng: 78.475248,
    centroidLat: 17.385,
    centroidLng: 78.4867,
    offsetMeters: 1222.7,
    cumulativeHighwayKm: 2369.72,
    highwayRef: "NH44;NH65;NH163",
    labelAlign: "end",
    labelDx: -16,
    labelDy: 4,
  },
  {
    id: "bangalore",
    order: 10,
    name: "Bangalore",
    jurisdiction: "Karnataka",
    snappedLat: 12.917395,
    snappedLng: 77.622926,
    centroidLat: 12.9716,
    centroidLng: 77.5946,
    offsetMeters: 6763.9,
    cumulativeHighwayKm: 2957.62,
    highwayRef: "NH44;NH48",
    labelAlign: "end",
    labelDx: -16,
    labelDy: 4,
  },
  {
    id: "salem",
    order: 11,
    name: "Salem",
    jurisdiction: "Tamil Nadu",
    snappedLat: 11.672023,
    snappedLng: 78.127424,
    centroidLat: 11.6643,
    centroidLng: 78.146,
    offsetMeters: 2197.6,
    cumulativeHighwayKm: 3149.07,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: -2,
  },
  {
    id: "namakkal",
    order: 12,
    name: "Namakkal",
    jurisdiction: "Tamil Nadu",
    snappedLat: 11.235156,
    snappedLng: 78.139803,
    centroidLat: 11.2189,
    centroidLng: 78.1674,
    offsetMeters: 3511,
    cumulativeHighwayKm: 3202.05,
    highwayRef: "NH44",
    labelAlign: "end",
    labelDx: -16,
    labelDy: 6,
  },
  {
    id: "madurai",
    order: 13,
    name: "Madurai",
    jurisdiction: "Tamil Nadu",
    snappedLat: 9.937635,
    snappedLng: 78.058779,
    centroidLat: 9.9252,
    centroidLng: 78.1198,
    offsetMeters: 6825.1,
    cumulativeHighwayKm: 3377.39,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: 4,
  },
  {
    id: "kanyakumari",
    order: 14,
    name: "Kanyakumari",
    jurisdiction: "Tamil Nadu",
    snappedLat: 8.088303,
    snappedLng: 77.538447,
    centroidLat: 8.0883,
    centroidLng: 77.5385,
    offsetMeters: 5.8,
    cumulativeHighwayKm: 3613.79,
    highwayRef: "NH44",
    labelAlign: "start",
    labelDx: 16,
    labelDy: 6,
    isTerminus: true,
  },
];

export const CHECKPOINTS_GIS_MAP = new Map<string, Nh44CheckpointGis>(
  NH44_CHECKPOINTS_GIS.map((cp) => [cp.id, cp])
);
