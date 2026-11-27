/**
 * scripts/gis/generate_nh44_lods.js
 * 
 * Phase 1B.2B — NH44 Multi-Resolution Geometry Simplification Pipeline
 * 
 * Generates:
 * 1. public/data/nh44/nh44-route-lod0.geojson (Full authoritative MultiLineString, 43,089 vertices)
 * 2. public/data/nh44/nh44-route-lod1.geojson (Interactive Highway scale, ~4,000 vertices, ε = 30m)
 * 3. public/data/nh44/nh44-route-lod2.geojson (National Overview scale, ~600 vertices, ε = 580m)
 * 4. public/data/nh44/nh44-lod-metadata.json (Complete metrics, deviations, lengths, checkpoint validations)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SRC_GEOJSON = path.join(__dirname, '..', '..', 'data', 'nh44', 'nh44-route-candidate.geojson');
const CP_FILE = path.join(__dirname, '..', '..', 'data', 'nh44', 'nh44-checkpoints-validation.json');
const GAPS_FILE = path.join(__dirname, '..', '..', 'data', 'nh44', 'nh44-gap-audit.json');
const DIRECTION_FILE = path.join(__dirname, '..', '..', 'data', 'nh44', 'nh44-direction-audit.json');
const LENGTH_FILE = path.join(__dirname, '..', '..', 'data', 'nh44', 'nh44-length-reconciliation.json');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'data', 'nh44');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371008.8; // WGS84 mean earth radius
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  return haversineMeters(lat1, lon1, lat2, lon2) / 1000;
}

// Perpendicular distance in meters from point P to segment AB
function perpDistanceMeters(p, a, b) {
  const [lonP, latP] = p;
  const [lonA, latA] = a;
  const [lonB, latB] = b;

  if (lonA === lonB && latA === latB) {
    return haversineMeters(latP, lonP, latA, lonA);
  }

  const R = 6371008.8;
  const midLat = ((latA + latB) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(midLat);
  const mPerDegLat = (Math.PI / 180) * R;
  const mPerDegLon = (Math.PI / 180) * R * cosLat;

  const bx = (lonB - lonA) * mPerDegLon;
  const by = (latB - latA) * mPerDegLat;
  const px = (lonP - lonA) * mPerDegLon;
  const py = (latP - latA) * mPerDegLat;

  const segLenSq = bx * bx + by * by;
  let t = (px * bx + py * by) / segLenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = t * bx;
  const projY = t * by;

  const dx = px - projX;
  const dy = py - projY;

  return Math.sqrt(dx * dx + dy * dy);
}

// RDP algorithm on a sub-segment
function rdp(points, epsilonMeters) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistanceMeters(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilonMeters) {
    const left = rdp(points.slice(0, index + 1), epsilonMeters);
    const right = rdp(points.slice(index), epsilonMeters);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [first, last];
  }
}

// Simplify polyline with pinned indices preserved strictly
function simplifySectionWithPinned(points, pinnedIndices, epsilonMeters) {
  const sortedPins = Array.from(new Set([0, ...pinnedIndices, points.length - 1])).sort((a, b) => a - b);
  let result = [];

  for (let i = 0; i < sortedPins.length - 1; i++) {
    const startIdx = sortedPins[i];
    const endIdx = sortedPins[i + 1];
    const subPoints = points.slice(startIdx, endIdx + 1);
    const simplifiedSub = rdp(subPoints, epsilonMeters);

    if (i === 0) {
      result = simplifiedSub;
    } else {
      result = result.concat(simplifiedSub.slice(1));
    }
  }
  return result;
}

// Measure polyline length in km
function polylineLengthKm(coords) {
  let len = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    len += haversineKm(coords[i][1], coords[i][0], coords[i + 1][1], coords[i + 1][0]);
  }
  return len;
}

// Measure MultiLineString total length
function multiLineStringLengthKm(sections) {
  return sections.reduce((sum, sec) => sum + polylineLengthKm(sec), 0);
}

// Compute maximum and average perpendicular deviation of original vertices relative to simplified polyline
function computeSectionDeviations(origPoints, simpPoints) {
  let maxDev = 0;
  let sumDev = 0;

  for (let i = 0; i < origPoints.length; i++) {
    const p = origPoints[i];
    // Find minimum perpendicular distance from p to any segment in simpPoints
    let minD = Infinity;
    for (let j = 0; j < simpPoints.length - 1; j++) {
      const d = perpDistanceMeters(p, simpPoints[j], simpPoints[j + 1]);
      if (d < minD) {
        minD = d;
      }
    }
    if (minD > maxDev) maxDev = minD;
    sumDev += minD;
  }

  return {
    maxDeviationMeters: Number(maxDev.toFixed(2)),
    avgDeviationMeters: Number((sumDev / origPoints.length).toFixed(2))
  };
}

// Measure file sizes: raw uncompressed and gzip compressed
function getPayloadSizes(filePath) {
  const rawBytes = fs.statSync(filePath).size;
  const fileContent = fs.readFileSync(filePath);
  const gzipBytes = zlib.gzipSync(fileContent).length;
  return {
    rawBytes,
    rawKb: Number((rawBytes / 1024).toFixed(1)),
    rawMb: Number((rawBytes / 1024 / 1024).toFixed(2)),
    gzipBytes,
    gzipKb: Number((gzipBytes / 1024).toFixed(1)),
    gzipMb: Number((gzipBytes / 1024 / 1024).toFixed(2))
  };
}

function main() {
  console.log('=== PHASE 1B.2B: MULTI-RESOLUTION GEOMETRY SIMPLIFICATION ===\n');

  // Load source authoritative geometry
  const candidateGeojson = JSON.parse(fs.readFileSync(SRC_GEOJSON, 'utf8'));
  const multiFeature = candidateGeojson.features.find(f => f.geometry.type === 'MultiLineString');
  const origSections = multiFeature.geometry.coordinates;

  // Load supporting metadata
  const cpData = JSON.parse(fs.readFileSync(CP_FILE, 'utf8'));
  const gapsData = JSON.parse(fs.readFileSync(GAPS_FILE, 'utf8'));
  const directionData = JSON.parse(fs.readFileSync(DIRECTION_FILE, 'utf8'));
  const lengthData = JSON.parse(fs.readFileSync(LENGTH_FILE, 'utf8'));

  const checkpoints = cpData.results;
  const origTotalVertices = origSections.reduce((sum, s) => sum + s.length, 0);
  const origLengthKm = multiLineStringLengthKm(origSections);

  console.log(`Authoritative LOD 0 Geometry:`);
  console.log(`  Sections: ${origSections.length}`);
  console.log(`  Total Vertices: ${origTotalVertices}`);
  console.log(`  Physical Centerline Length: ${origLengthKm.toFixed(2)} KM\n`);

  // Map each checkpoint to its section and nearest vertex index in that section
  console.log('Mapping and pinning all 14 checkpoint anchors...');
  const sectionPins = origSections.map(() => []);

  const checkpointAnchorMetadata = checkpoints.map(cp => {
    const snap = cp.orthogonalProjection.snappedPoint;
    let bestDist = Infinity;
    let bestSec = -1;
    let bestIdx = -1;

    origSections.forEach((sec, sIdx) => {
      sec.forEach((pt, pIdx) => {
        const d = haversineMeters(snap.latitude, snap.longitude, pt[1], pt[0]);
        if (d < bestDist) {
          bestDist = d;
          bestSec = sIdx;
          bestIdx = pIdx;
        }
      });
    });

    sectionPins[bestSec].push(bestIdx);

    return {
      checkpointId: cp.checkpointId,
      name: cp.name,
      jurisdiction: cp.jurisdiction,
      sectionIndex: bestSec,
      pinnedVertexIndexLOD0: bestIdx,
      pinnedCoordinate: [origSections[bestSec][bestIdx][0], origSections[bestSec][bestIdx][1]],
      distanceToOrthogonalSnappedPointMeters: Number(bestDist.toFixed(2))
    };
  });

  // 1. GENERATE LOD 0
  console.log('Generating LOD 0 (Authoritative Full Resolution MultiLineString)...');
  const lod0Geojson = {
    type: 'FeatureCollection',
    name: 'NH44_Grand_Bharat_Highway_LOD0',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    metadata: {
      lodLevel: 0,
      scaleDescription: 'Full GIS Detail (Local Street & Mountain Pass Inspection)',
      simplificationToleranceMeters: 0,
      targetVertices: origTotalVertices,
      actualVertices: origTotalVertices,
      reductionPercentage: '0.0%',
      totalLengthKm: Number(origLengthKm.toFixed(2)),
      sectionsCount: origSections.length,
      coordinateSystem: 'EPSG:4326 (WGS84)',
      coordinateOrder: '[longitude, latitude]',
      officialCorridorBenchmarkKm: 3810,
      osmAttribution: '© OpenStreetMap contributors (ODbL), Relation 11568320',
      extractionProvenance: 'Phase 1B.2A conditionally certified extraction pipeline',
      authoritativeGeometryNotice: 'This MultiLineString is the authoritative ground truth geometry for NH44. Disconnected segments reflect physical road gaps/omissions in OpenStreetMap relations and must remain discrete.'
    },
    features: [
      {
        type: 'Feature',
        id: 'nh44-multilinestring-lod0',
        properties: {
          corridor: 'NH44',
          name: 'The Grand Bharat Highway (LOD 0)',
          lod: 0,
          toleranceMeters: 0,
          totalLengthKm: Number(origLengthKm.toFixed(2)),
          vertexCount: origTotalVertices,
          sectionsCount: origSections.length
        },
        geometry: {
          type: 'MultiLineString',
          coordinates: origSections
        }
      }
    ]
  };

  const lod0Path = path.join(OUT_DIR, 'nh44-route-lod0.geojson');
  fs.writeFileSync(lod0Path, JSON.stringify(lod0Geojson, null, 2), 'utf8');
  console.log(`Saved LOD 0: ${lod0Path}`);

  // 2. GENERATE LOD 1 (Target ~4,000 vertices, ε = 30.0m)
  const EPSILON_LOD1 = 30.0;
  console.log(`\nGenerating LOD 1 (Interactive Highway View, target ~4,000 vertices, ε = ${EPSILON_LOD1}m)...`);

  const lod1Sections = origSections.map((sec, sIdx) => {
    return simplifySectionWithPinned(sec, sectionPins[sIdx], EPSILON_LOD1);
  });

  const lod1TotalVertices = lod1Sections.reduce((sum, s) => sum + s.length, 0);
  const lod1LengthKm = multiLineStringLengthKm(lod1Sections);
  const lod1Reduction = ((1 - lod1TotalVertices / origTotalVertices) * 100).toFixed(1);

  // Compute deviations section by section
  let lod1MaxDev = 0;
  let lod1SumDevWeighted = 0;
  origSections.forEach((sec, sIdx) => {
    const dev = computeSectionDeviations(sec, lod1Sections[sIdx]);
    if (dev.maxDeviationMeters > lod1MaxDev) lod1MaxDev = dev.maxDeviationMeters;
    lod1SumDevWeighted += dev.avgDeviationMeters * sec.length;
  });
  const lod1AvgDev = Number((lod1SumDevWeighted / origTotalVertices).toFixed(2));

  console.log(`  LOD 1 Vertices: ${lod1TotalVertices} (${lod1Reduction}% reduction)`);
  console.log(`  LOD 1 Length: ${lod1LengthKm.toFixed(2)} KM (delta: ${(lod1LengthKm - origLengthKm).toFixed(2)} KM)`);
  console.log(`  LOD 1 Max Deviation: ${lod1MaxDev.toFixed(2)} m, Avg Deviation: ${lod1AvgDev.toFixed(2)} m`);

  const lod1Geojson = {
    type: 'FeatureCollection',
    name: 'NH44_Grand_Bharat_Highway_LOD1',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    metadata: {
      lodLevel: 1,
      scaleDescription: 'Interactive Highway Scale (State-Level Exploration & Regional Viewports)',
      simplificationToleranceMeters: EPSILON_LOD1,
      targetVertices: 4000,
      actualVertices: lod1TotalVertices,
      reductionPercentage: `${lod1Reduction}%`,
      totalLengthKm: Number(lod1LengthKm.toFixed(2)),
      lengthDeltaKm: Number((lod1LengthKm - origLengthKm).toFixed(2)),
      maxGeometricDeviationMeters: lod1MaxDev,
      avgGeometricDeviationMeters: lod1AvgDev,
      sectionsCount: lod1Sections.length,
      coordinateSystem: 'EPSG:4326 (WGS84)',
      coordinateOrder: '[longitude, latitude]',
      pinnedCheckpointsCount: checkpoints.length,
      osmAttribution: '© OpenStreetMap contributors (ODbL), Relation 11568320'
    },
    features: [
      {
        type: 'Feature',
        id: 'nh44-multilinestring-lod1',
        properties: {
          corridor: 'NH44',
          name: 'The Grand Bharat Highway (LOD 1)',
          lod: 1,
          toleranceMeters: EPSILON_LOD1,
          totalLengthKm: Number(lod1LengthKm.toFixed(2)),
          vertexCount: lod1TotalVertices,
          sectionsCount: lod1Sections.length
        },
        geometry: {
          type: 'MultiLineString',
          coordinates: lod1Sections
        }
      }
    ]
  };

  const lod1Path = path.join(OUT_DIR, 'nh44-route-lod1.geojson');
  fs.writeFileSync(lod1Path, JSON.stringify(lod1Geojson, null, 2), 'utf8');
  console.log(`Saved LOD 1: ${lod1Path}`);

  // 3. GENERATE LOD 2 (Target ~600 vertices, ε = 580.0m)
  const EPSILON_LOD2 = 580.0;
  console.log(`\nGenerating LOD 2 (National Overview Scale, target ~600 vertices, ε = ${EPSILON_LOD2}m)...`);

  const lod2Sections = origSections.map((sec, sIdx) => {
    return simplifySectionWithPinned(sec, sectionPins[sIdx], EPSILON_LOD2);
  });

  const lod2TotalVertices = lod2Sections.reduce((sum, s) => sum + s.length, 0);
  const lod2LengthKm = multiLineStringLengthKm(lod2Sections);
  const lod2Reduction = ((1 - lod2TotalVertices / origTotalVertices) * 100).toFixed(1);

  // Compute deviations section by section
  let lod2MaxDev = 0;
  let lod2SumDevWeighted = 0;
  origSections.forEach((sec, sIdx) => {
    const dev = computeSectionDeviations(sec, lod2Sections[sIdx]);
    if (dev.maxDeviationMeters > lod2MaxDev) lod2MaxDev = dev.maxDeviationMeters;
    lod2SumDevWeighted += dev.avgDeviationMeters * sec.length;
  });
  const lod2AvgDev = Number((lod2SumDevWeighted / origTotalVertices).toFixed(2));

  console.log(`  LOD 2 Vertices: ${lod2TotalVertices} (${lod2Reduction}% reduction)`);
  console.log(`  LOD 2 Length: ${lod2LengthKm.toFixed(2)} KM (delta: ${(lod2LengthKm - origLengthKm).toFixed(2)} KM)`);
  console.log(`  LOD 2 Max Deviation: ${lod2MaxDev.toFixed(2)} m, Avg Deviation: ${lod2AvgDev.toFixed(2)} m`);

  const lod2Geojson = {
    type: 'FeatureCollection',
    name: 'NH44_Grand_Bharat_Highway_LOD2',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    metadata: {
      lodLevel: 2,
      scaleDescription: 'National Overview Scale (Full-India Highway Silhouette & Hero Preview)',
      simplificationToleranceMeters: EPSILON_LOD2,
      targetVertices: 600,
      actualVertices: lod2TotalVertices,
      reductionPercentage: `${lod2Reduction}%`,
      totalLengthKm: Number(lod2LengthKm.toFixed(2)),
      lengthDeltaKm: Number((lod2LengthKm - origLengthKm).toFixed(2)),
      maxGeometricDeviationMeters: lod2MaxDev,
      avgGeometricDeviationMeters: lod2AvgDev,
      sectionsCount: lod2Sections.length,
      coordinateSystem: 'EPSG:4326 (WGS84)',
      coordinateOrder: '[longitude, latitude]',
      pinnedCheckpointsCount: checkpoints.length,
      osmAttribution: '© OpenStreetMap contributors (ODbL), Relation 11568320'
    },
    features: [
      {
        type: 'Feature',
        id: 'nh44-multilinestring-lod2',
        properties: {
          corridor: 'NH44',
          name: 'The Grand Bharat Highway (LOD 2)',
          lod: 2,
          toleranceMeters: EPSILON_LOD2,
          totalLengthKm: Number(lod2LengthKm.toFixed(2)),
          vertexCount: lod2TotalVertices,
          sectionsCount: lod2Sections.length
        },
        geometry: {
          type: 'MultiLineString',
          coordinates: lod2Sections
        }
      }
    ]
  };

  const lod2Path = path.join(OUT_DIR, 'nh44-route-lod2.geojson');
  fs.writeFileSync(lod2Path, JSON.stringify(lod2Geojson, null, 2), 'utf8');
  console.log(`Saved LOD 2: ${lod2Path}`);

  // 4. MEASURE PAYLOAD SIZES
  console.log('\nMeasuring payload sizes...');
  const lod0Sizes = getPayloadSizes(lod0Path);
  const lod1Sizes = getPayloadSizes(lod1Path);
  const lod2Sizes = getPayloadSizes(lod2Path);

  console.log(`LOD 0: ${lod0Sizes.rawMb} MB (${lod0Sizes.gzipKb} KB gzipped)`);
  console.log(`LOD 1: ${lod1Sizes.rawKb} KB (${lod1Sizes.gzipKb} KB gzipped)`);
  console.log(`LOD 2: ${lod2Sizes.rawKb} KB (${lod2Sizes.gzipKb} KB gzipped)`);

  // 5. VALIDATE 14 CHECKPOINTS RETENTION & OFFSETS ACROSS LODS
  console.log('\nValidating 14 checkpoint retention across all LODs...');
  const checkpointLodComparisons = checkpoints.map(cp => {
    const snap = cp.orthogonalProjection.snappedPoint;

    // LOD 0 offset
    let d0 = Infinity;
    origSections.forEach(sec => {
      for (let i = 0; i < sec.length - 1; i++) {
        const d = perpDistanceMeters([snap.longitude, snap.latitude], sec[i], sec[i + 1]);
        if (d < d0) d0 = d;
      }
    });

    // LOD 1 offset
    let d1 = Infinity;
    lod1Sections.forEach(sec => {
      for (let i = 0; i < sec.length - 1; i++) {
        const d = perpDistanceMeters([snap.longitude, snap.latitude], sec[i], sec[i + 1]);
        if (d < d1) d1 = d;
      }
    });

    // LOD 2 offset
    let d2 = Infinity;
    lod2Sections.forEach(sec => {
      for (let i = 0; i < sec.length - 1; i++) {
        const d = perpDistanceMeters([snap.longitude, snap.latitude], sec[i], sec[i + 1]);
        if (d < d2) d2 = d;
      }
    });

    return {
      checkpointId: cp.checkpointId,
      name: cp.name,
      jurisdiction: cp.jurisdiction,
      orthogonalOffsetLOD0Meters: Number(d0.toFixed(2)),
      orthogonalOffsetLOD1Meters: Number(d1.toFixed(2)),
      orthogonalOffsetLOD2Meters: Number(d2.toFixed(2)),
      isAnchorRetainedInLOD1: d1 < 5.0,
      isAnchorRetainedInLOD2: d2 < 50.0
    };
  });

  // 6. COMPILE COMPREHENSIVE LOD METADATA FILE
  const lodMetadata = {
    metadataVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    corridorName: 'The Grand Bharat Highway (NH44)',
    officialMoRTHCorridorLengthKm: 3810,
    authoritativeGeometryType: 'MultiLineString',
    osmProvenance: {
      masterRelationId: 11568320,
      masterRelationName: 'National Highway 44 (India)',
      childRelationsCount: 13,
      totalSourceWaysTraceable: 4024,
      attribution: 'Map data © OpenStreetMap contributors, ODbL 1.0',
      licence: 'Open Database License (ODbL)'
    },
    simplificationSummary: {
      algorithm: 'Ramer-Douglas-Peucker (RDP) on Midpoint Local Conformal Metric Projection',
      pinnedPointsPolicy: 'All section endpoints and 14 checkpoint orthogonal projection anchors are pinned and strictly excluded from RDP removal.',
      gapHandlingPolicy: 'Each of the 5 MultiLineString sections is simplified in complete isolation; no simplification or interpolation occurs across the 4 verified structural gaps.'
    },
    levels: [
      {
        lod: 0,
        filename: 'nh44-route-lod0.geojson',
        targetVertices: origTotalVertices,
        actualVertices: origTotalVertices,
        toleranceMeters: 0,
        reductionPercent: 0,
        totalLengthKm: Number(origLengthKm.toFixed(2)),
        lengthDeltaKm: 0,
        maxDeviationMeters: 0,
        avgDeviationMeters: 0,
        payloadSizes: lod0Sizes,
        sectionVertexCounts: origSections.map(s => s.length)
      },
      {
        lod: 1,
        filename: 'nh44-route-lod1.geojson',
        targetVertices: 4000,
        actualVertices: lod1TotalVertices,
        toleranceMeters: EPSILON_LOD1,
        reductionPercent: Number(lod1Reduction),
        totalLengthKm: Number(lod1LengthKm.toFixed(2)),
        lengthDeltaKm: Number((lod1LengthKm - origLengthKm).toFixed(2)),
        maxDeviationMeters: lod1MaxDev,
        avgDeviationMeters: lod1AvgDev,
        payloadSizes: lod1Sizes,
        sectionVertexCounts: lod1Sections.map(s => s.length)
      },
      {
        lod: 2,
        filename: 'nh44-route-lod2.geojson',
        targetVertices: 600,
        actualVertices: lod2TotalVertices,
        toleranceMeters: EPSILON_LOD2,
        reductionPercent: Number(lod2Reduction),
        totalLengthKm: Number(lod2LengthKm.toFixed(2)),
        lengthDeltaKm: Number((lod2LengthKm - origLengthKm).toFixed(2)),
        maxDeviationMeters: lod2MaxDev,
        avgDeviationMeters: lod2AvgDev,
        payloadSizes: lod2Sizes,
        sectionVertexCounts: lod2Sections.map(s => s.length)
      }
    ],
    structuralGapsPreserved: gapsData.gaps.map(g => ({
      gapId: g.gapId,
      name: g.name,
      distanceMeters: g.distanceMeters,
      jurisdiction: g.jurisdiction,
      preservedAsSectionBreak: true
    })),
    directionalAnomaliesPreservedInMetadata: directionData.auditSummary.counterFlowViolationsCount,
    checkpointsValidation: checkpointLodComparisons
  };

  const metadataPath = path.join(OUT_DIR, 'nh44-lod-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(lodMetadata, null, 2), 'utf8');
  console.log(`\nSaved LOD Metadata to: ${metadataPath}`);
  console.log('=== MULTI-RESOLUTION PIPELINE COMPLETED SUCCESSFULLY ===');
}

main();
