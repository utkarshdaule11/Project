/**
 * scripts/gis/calibrate_rdp_tolerances.js
 * 
 * Calibrates metric Ramer-Douglas-Peucker (RDP) tolerance values (in meters)
 * across the 5 sections of the authoritative MultiLineString to hit:
 * - LOD 1: ~4,000 vertices
 * - LOD 2: ~600 vertices
 * 
 * Pins all 14 checkpoints and section endpoints.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'nh44');

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371008.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
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

// Standard RDP on a single sub-segment
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

// Simplify polyline with pinned indices
function simplifyWithPinned(points, pinnedIndices, epsilonMeters) {
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

function main() {
  console.log('=== CALIBRATING RDP TOLERANCES ===\n');

  const candidateFile = path.join(DATA_DIR, 'nh44-route-candidate.geojson');
  const candidateGeojson = JSON.parse(fs.readFileSync(candidateFile, 'utf8'));
  const multiFeature = candidateGeojson.features.find(f => f.geometry.type === 'MultiLineString');
  const sections = multiFeature.geometry.coordinates;

  const cpFile = path.join(DATA_DIR, 'nh44-checkpoints-validation.json');
  const cpData = JSON.parse(fs.readFileSync(cpFile, 'utf8'));
  const checkpoints = cpData.results;

  // Map each checkpoint to its section and nearest vertex index in that section
  const sectionPins = sections.map(() => []);

  checkpoints.forEach(cp => {
    const snap = cp.orthogonalProjection.snappedPoint;
    let bestDist = Infinity;
    let bestSec = -1;
    let bestIdx = -1;

    sections.forEach((sec, sIdx) => {
      sec.forEach((pt, pIdx) => {
        const d = haversineMeters(snap.latitude, snap.longitude, pt[1], pt[0]);
        if (d < bestDist) {
          bestDist = d;
          bestSec = sIdx;
          bestIdx = pIdx;
        }
      });
    });

    console.log(`CP: ${cp.name.padEnd(12)} -> Section ${bestSec}, Vertex ${bestIdx.toString().padStart(5)} (dist to vertex: ${bestDist.toFixed(1)} m)`);
    sectionPins[bestSec].push(bestIdx);
  });

  const totalOrigVertices = sections.reduce((sum, s) => sum + s.length, 0);
  console.log(`\nAuthoritative LOD 0 total vertices: ${totalOrigVertices}`);

  // Test various epsilon tolerances
  const tolerances = [
    5, 10, 15, 20, 25, 30, 40, 50,
    75, 100, 120, 150, 180, 200, 250, 300, 400, 500
  ];

  console.log('\n--- TOLERANCE SWEEP ---');
  console.log('Tolerance (m) | Total Vertices | Reduction % | Sec 0 | Sec 1 | Sec 2 | Sec 3 | Sec 4');
  console.log('----------------------------------------------------------------------------------');

  tolerances.forEach(eps => {
    let totalSimplified = 0;
    const secCounts = [];
    sections.forEach((sec, sIdx) => {
      const pins = sectionPins[sIdx];
      const simp = simplifyWithPinned(sec, pins, eps);
      secCounts.push(simp.length);
      totalSimplified += simp.length;
    });
    const red = ((1 - totalSimplified / totalOrigVertices) * 100).toFixed(1);
    console.log(`${eps.toString().padStart(13)} | ${totalSimplified.toString().padStart(14)} | ${red.padStart(10)}% | ${secCounts.map(c => c.toString().padStart(5)).join(' | ')}`);
  });
}

main();
