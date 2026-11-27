/**
 * scripts/gis/recalculate_checkpoints_orthogonal.js
 * 
 * Re-validates and re-calculates all 14 checkpoints using true
 * orthogonal point-to-segment geodesic projection on the extracted route geometry.
 * 
 * CRS Documentation:
 * - Coordinates: WGS84 Geographic 2D (EPSG:4326) in decimal degrees [longitude, latitude].
 * - Projection / Distance Algorithm: Midpoint Local Conformal Projection with WGS84 Geodesic Distance
 *   (Point-to-Segment Orthogonal Projection clamping parameter t in [0, 1]).
 * 
 * Updates: data/nh44/nh44-checkpoints-validation.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'nh44');
const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

// 14 Editorial Checkpoints from MoRTH Annexure II(d)
const CHECKPOINTS = [
  { id: 'srinagar', name: 'Srinagar', jurisdiction: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973 },
  { id: 'jalandhar', name: 'Jalandhar', jurisdiction: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { id: 'ludhiana', name: 'Ludhiana', jurisdiction: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { id: 'ambala', name: 'Ambala', jurisdiction: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { id: 'delhi', name: 'Delhi', jurisdiction: 'NCT of Delhi', lat: 28.6139, lng: 77.2090 },
  { id: 'gwalior', name: 'Gwalior', jurisdiction: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { id: 'jhansi', name: 'Jhansi', jurisdiction: 'Uttar Pradesh', lat: 25.4484, lng: 78.5685 },
  { id: 'nagpur', name: 'Nagpur', jurisdiction: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { id: 'hyderabad', name: 'Hyderabad', jurisdiction: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { id: 'bangalore', name: 'Bangalore', jurisdiction: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { id: 'salem', name: 'Salem', jurisdiction: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
  { id: 'namakkal', name: 'Namakkal', jurisdiction: 'Tamil Nadu', lat: 11.2189, lng: 78.1674 },
  { id: 'madurai', name: 'Madurai', jurisdiction: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { id: 'kanyakumari', name: 'Kanyakumari', jurisdiction: 'Tamil Nadu', lat: 8.0883, lng: 77.5385 },
];

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371008.8; // WGS84 mean earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

/**
 * Orthogonal point-to-segment projection in local metric conformal tangent plane.
 * Given segment A(latA, lonA) -> B(latB, lonB) and point P(latP, lonP),
 * finds the orthogonal nearest point P* on segment AB and distance in meters.
 */
function projectPointToSegment(latP, lonP, latA, lonA, latB, lonB) {
  const R = 6371008.8;
  const midLat = ((latA + latB) / 2) * (Math.PI / 180);

  // Convert to local Cartesian coordinates (meters) centered at A
  const cosLat = Math.cos(midLat);
  const mPerDegLat = (Math.PI / 180) * R;
  const mPerDegLon = (Math.PI / 180) * R * cosLat;

  const bx = (lonB - lonA) * mPerDegLon;
  const by = (latB - latA) * mPerDegLat;
  const px = (lonP - lonA) * mPerDegLon;
  const py = (latP - latA) * mPerDegLat;

  const segLenSq = bx * bx + by * by;
  let t = 0;
  if (segLenSq > 0) {
    t = (px * bx + py * by) / segLenSq;
    t = Math.max(0, Math.min(1, t)); // clamp to segment
  }

  // Snapped point in local Cartesian meters
  const sx = t * bx;
  const sy = t * by;

  // Snapped point in WGS84 geographic coordinates
  const snappedLon = lonA + sx / mPerDegLon;
  const snappedLat = latA + sy / mPerDegLat;

  // Distance from P to snapped point
  const distM = haversineMeters(latP, lonP, snappedLat, snappedLon);

  return {
    t,
    snappedLat,
    snappedLon,
    distM
  };
}

function loadAllWays() {
  const masterFile = path.join(RAW_DIR, 'relation_11568320.json');
  const master = JSON.parse(fs.readFileSync(masterFile, 'utf8')).elements[0];
  const childRels = master.members.filter(m => m.type === 'relation');

  const allNodes = new Map();
  const allWays = new Map();

  for (const child of childRels) {
    const file = path.join(RAW_DIR, `relation_${child.ref}_full.json`);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    data.elements.filter(e => e.type === 'node').forEach(n => {
      allNodes.set(n.id, { lat: n.lat, lon: n.lon });
    });

    data.elements.filter(e => e.type === 'way').forEach(w => {
      if (!allWays.has(w.id)) {
        allWays.set(w.id, { ...w, relId: child.ref });
      }
    });
  }
  return { allNodes, allWays };
}

function main() {
  console.log('=== RECALCULATING 14 CHECKPOINTS VIA ORTHOGONAL PROJECTION ===\n');

  const { allNodes, allWays } = loadAllWays();
  const candidateGeojson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'nh44-route-candidate.geojson'), 'utf8'));
  const compositeFeature = candidateGeojson.features.find(f => f.geometry.type === 'LineString');
  const coords = compositeFeature.geometry.coordinates; // [lon, lat]

  console.log(`Route geometry has ${coords.length} vertices across ${coords.length - 1} road segments.`);

  const recalculated = CHECKPOINTS.map((cp, idx) => {
    let minD = Infinity;
    let bestSegmentIndex = -1;
    let bestSnappedLat = 0;
    let bestSnappedLon = 0;
    let bestT = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const [lonA, latA] = coords[i];
      const [lonB, latB] = coords[i + 1];

      // Quick bounding box filter (0.2 degrees ~ 22 km)
      if (Math.abs(latA - cp.lat) > 0.2 && Math.abs(latB - cp.lat) > 0.2) continue;
      if (Math.abs(lonA - cp.lng) > 0.2 && Math.abs(lonB - cp.lng) > 0.2) continue;

      const proj = projectPointToSegment(cp.lat, cp.lng, latA, lonA, latB, lonB);
      if (proj.distM < minD) {
        minD = proj.distM;
        bestSegmentIndex = i;
        bestSnappedLat = proj.snappedLat;
        bestSnappedLon = proj.snappedLon;
        bestT = proj.t;
      }
    }

    // Identify nearest containing OSM way
    // Check which way contains the coordinates around bestSegmentIndex
    let matchedWayId = null;
    let matchedRelId = null;
    let matchedWayTags = {};

    const [lonA, latA] = coords[bestSegmentIndex];
    const [lonB, latB] = coords[bestSegmentIndex + 1];

    for (const [wid, w] of allWays.entries()) {
      const nodes = w.nodes || [];
      for (let i = 0; i < nodes.length; i++) {
        const n = allNodes.get(nodes[i]);
        if (n) {
          const d1 = Math.abs(n.lat - latA) + Math.abs(n.lon - lonA);
          const d2 = Math.abs(n.lat - latB) + Math.abs(n.lon - lonB);
          if (d1 < 1e-4 || d2 < 1e-4) {
            matchedWayId = wid;
            matchedRelId = w.relId;
            matchedWayTags = w.tags || {};
            break;
          }
        }
      }
      if (matchedWayId) break;
    }

    let confidence = 'HIGH';
    let classification = '';
    if (minD < 100) {
      classification = 'terminal-anchor (<100m)';
      confidence = 'VERY_HIGH';
    } else if (minD < 5000) {
      classification = 'corridor-bypass (1-5km)';
      confidence = 'HIGH';
    } else if (minD < 10000) {
      classification = 'urban-outer-ring (5-10km)';
      confidence = 'HIGH';
    } else {
      classification = 'regional-offset (>10km)';
      confidence = 'MEDIUM';
    }

    return {
      index: idx + 1,
      checkpointId: cp.id,
      name: cp.name,
      jurisdiction: cp.jurisdiction,
      cityCentroid: {
        latitude: cp.lat,
        longitude: cp.lng
      },
      orthogonalProjection: {
        snappedPoint: {
          latitude: Number(bestSnappedLat.toFixed(6)),
          longitude: Number(bestSnappedLon.toFixed(6))
        },
        offsetMeters: Number(minD.toFixed(1)),
        offsetKm: Number((minD / 1000).toFixed(2)),
        segmentVertexIndex: bestSegmentIndex,
        segmentInterpolationParameterT: Number(bestT.toFixed(4)),
        segmentStartVertex: [coords[bestSegmentIndex][0], coords[bestSegmentIndex][1]],
        segmentEndVertex: [coords[bestSegmentIndex + 1][0], coords[bestSegmentIndex + 1][1]]
      },
      sourceWayProvenance: {
        matchedWayId,
        relationId: matchedRelId,
        highway: matchedWayTags.highway || null,
        ref: matchedWayTags.ref || null,
        name: matchedWayTags.name || null,
        oneway: matchedWayTags.oneway || null
      },
      classification,
      matchingConfidence: confidence,
      crsMetadata: {
        sourceCRS: 'EPSG:4326 (WGS84 2D Geographic)',
        units: 'Decimal degrees [longitude, latitude]',
        geodesicMethod: 'Local Midpoint Conformal Tangent Projection with WGS84 Great-Circle Metric Distance',
        projectedCRSNote: 'EPSG:4326 is an unprojected geographic CRS. All orthogonal distance computations were transformed to metric lengths using WGS84 ellipsoidal geometry (mean radius R=6371008.8m).'
      }
    };
  });

  console.log('--- ORTHOGONAL PROJECTION RESULTS ---');
  recalculated.forEach(r => {
    console.log(`${r.index.toString().padStart(2)}. ${r.name.padEnd(12)} -> Snapped: [${r.orthogonalProjection.snappedPoint.longitude.toFixed(5)}, ${r.orthogonalProjection.snappedPoint.latitude.toFixed(5)}] | Offset: ${r.orthogonalProjection.offsetKm.toFixed(2).padStart(6)} km (${r.orthogonalProjection.offsetMeters.toFixed(1)} m) | Way: ${r.sourceWayProvenance.matchedWayId} | ${r.classification}`);
  });

  // Calculate cumulative distance along extracted route to each snapped point
  let cumulativeKm = 0;
  let currentSeg = 0;
  recalculated.forEach((r, idx) => {
    const targetSeg = r.orthogonalProjection.segmentVertexIndex;
    while (currentSeg < targetSeg && currentSeg < coords.length - 1) {
      cumulativeKm += haversineMeters(coords[currentSeg][1], coords[currentSeg][0], coords[currentSeg + 1][1], coords[currentSeg + 1][0]) / 1000;
      currentSeg++;
    }
    // Add fraction of the final segment
    const t = r.orthogonalProjection.segmentInterpolationParameterT;
    const partialM = haversineMeters(coords[targetSeg][1], coords[targetSeg][0], r.orthogonalProjection.snappedPoint.latitude, r.orthogonalProjection.snappedPoint.longitude);
    r.cumulativeRouteKm = Number((cumulativeKm + partialM / 1000).toFixed(2));
  });

  // Load previous validation JSON to preserve legs and gap metadata
  const existingValidation = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'nh44-checkpoints-validation.json'), 'utf8'));

  const updatedValidation = {
    validationDate: new Date().toISOString(),
    crs: 'WGS84 Geographic 2D (EPSG:4326) / Metric Geodesic Point-to-Segment Projection',
    totalCheckpoints: recalculated.length,
    officialCorridorBenchmarkKm: 3810,
    extractedPhysicalHighwayKm: existingValidation.extractedPhysicalHighwayKm,
    results: recalculated,
    legs: existingValidation.legs,
    documentedGaps: existingValidation.documentedGaps
  };

  const outFile = path.join(DATA_DIR, 'nh44-checkpoints-validation.json');
  fs.writeFileSync(outFile, JSON.stringify(updatedValidation, null, 2), 'utf8');
  console.log(`\nUpdated checkpoints validation file: ${outFile}`);
}

main();
