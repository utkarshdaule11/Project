/**
 * scripts/gis/acquire_nh44.js
 * 
 * Acquires, caches, and validates OpenStreetMap Master Relation 11568320 (NH 44 India)
 * and its 13 child relations across all jurisdictions from Srinagar to Kanyakumari.
 * 
 * Usage:
 *   node scripts/gis/acquire_nh44.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MASTER_RELATION_ID = 11568320;
const RAW_DATA_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

// Checkpoints from content/states.ts
const CHECKPOINTS = [
  { id: 'srinagar', name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973 },
  { id: 'jalandhar', name: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { id: 'ludhiana', name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { id: 'ambala', name: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { id: 'delhi', name: 'Delhi', state: 'NCT of Delhi', lat: 28.6139, lng: 77.2090 },
  { id: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { id: 'jhansi', name: 'Jhansi', state: 'Uttar Pradesh', lat: 25.4484, lng: 78.5685 },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { id: 'salem', name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
  { id: 'namakkal', name: 'Namakkal', state: 'Tamil Nadu', lat: 11.2189, lng: 78.1674 },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { id: 'kanyakumari', name: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.0883, lng: 77.5385 },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GrandBharatHighway-GIS-Audit/1.0 (academic/infrastructure-audit)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0088; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance from point P to line segment AB
function distanceToSegmentKm(pLat, pLng, aLat, aLng, bLat, bLng) {
  const dAB = haversineDistanceKm(aLat, aLng, bLat, bLng);
  if (dAB === 0) return haversineDistanceKm(pLat, pLng, aLat, aLng);

  // Project point onto segment in spherical coordinates approximation
  const dAP = haversineDistanceKm(aLat, aLng, pLat, pLng);
  const dBP = haversineDistanceKm(bLat, bLng, pLat, pLng);

  // Cosine rule projection factor
  const cosAngle = (dAP * dAP + dAB * dAB - dBP * dBP) / (2 * dAP * dAB);
  const projectionDist = dAP * cosAngle;

  if (projectionDist <= 0) {
    return { distKm: dAP, nearestLat: aLat, nearestLng: aLng };
  }
  if (projectionDist >= dAB) {
    return { distKm: dBP, nearestLat: bLat, nearestLng: bLng };
  }

  const fraction = projectionDist / dAB;
  const nearestLat = aLat + (bLat - aLat) * fraction;
  const nearestLng = aLng + (bLng - aLng) * fraction;
  const distKm = haversineDistanceKm(pLat, pLng, nearestLat, nearestLng);

  return { distKm, nearestLat, nearestLng };
}

async function getOrFetchRelation(relId, isFull = false) {
  const fileName = isFull ? `relation_${relId}_full.json` : `relation_${relId}.json`;
  const filePath = path.join(RAW_DATA_DIR, fileName);

  if (fs.existsSync(filePath)) {
    console.log(`[CACHE HIT] Loaded ${fileName}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  const url = isFull
    ? `https://api.openstreetmap.org/api/0.6/relation/${relId}/full.json`
    : `https://api.openstreetmap.org/api/0.6/relation/${relId}.json`;

  console.log(`[NETWORK FETCH] Downloading ${url}...`);
  const data = await fetchJson(url);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`[CACHED] Saved to ${filePath}`);
  await sleep(1500); // Polite rate limit
  return data;
}

async function main() {
  fs.mkdirSync(RAW_DATA_DIR, { recursive: true });

  console.log('=== PHASE 1B.1: NH44 GIS ACQUISITION & VALIDATION ===');
  console.log(`Auditing Master Relation ID: ${MASTER_RELATION_ID}`);

  const masterData = await getOrFetchRelation(MASTER_RELATION_ID, false);
  const master = masterData.elements[0];

  const childRelations = master.members.filter(m => m.type === 'relation');
  console.log(`Master relation has ${childRelations.length} child relations.\n`);

  const stateDataList = [];
  const allNodes = new Map();
  const allWays = [];
  const highwayTagStats = {};
  const onewayStats = {};

  for (const child of childRelations) {
    const relId = child.ref;
    console.log(`Processing child relation ${relId}...`);
    const fullData = await getOrFetchRelation(relId, true);

    const relElement = fullData.elements.find(e => e.type === 'relation' && e.id === relId);
    const nodes = fullData.elements.filter(e => e.type === 'node');
    const ways = fullData.elements.filter(e => e.type === 'way');

    nodes.forEach(n => allNodes.set(n.id, { lat: n.lat, lon: n.lon }));

    let relLengthKm = 0;
    ways.forEach(w => {
      const hw = w.tags && w.tags.highway ? w.tags.highway : 'unclassified';
      highwayTagStats[hw] = (highwayTagStats[hw] || 0) + 1;

      const ow = w.tags && w.tags.oneway ? w.tags.oneway : 'no';
      onewayStats[ow] = (onewayStats[ow] || 0) + 1;

      // Calculate length
      let wayLen = 0;
      for (let i = 0; i < (w.nodes || []).length - 1; i++) {
        const n1 = allNodes.get(w.nodes[i]);
        const n2 = allNodes.get(w.nodes[i + 1]);
        if (n1 && n2) {
          wayLen += haversineDistanceKm(n1.lat, n1.lon, n2.lat, n2.lon);
        }
      }
      relLengthKm += wayLen;
      allWays.push({ ...w, relId, lengthKm: wayLen });
    });

    const stateCode = relElement && relElement.tags && (relElement.tags['is_in:state'] || relElement.tags.name) || 'Unknown';
    stateDataList.push({
      relId,
      state: stateCode,
      waysCount: ways.length,
      nodesCount: nodes.length,
      lengthKm: relLengthKm,
      tags: relElement ? relElement.tags : {}
    });
  }

  console.log('\n--- 1. CHILD RELATIONS METRICS ---');
  console.table(stateDataList.map(s => ({
    RelID: s.relId,
    State: s.state,
    Ways: s.waysCount,
    Nodes: s.nodesCount,
    RawWaysLengthKM: s.lengthKm.toFixed(1)
  })));

  const totalRawWaysLengthKm = stateDataList.reduce((sum, s) => sum + s.lengthKm, 0);
  console.log(`Total Raw Sum of Way Segments: ${totalRawWaysLengthKm.toFixed(1)} KM (includes dual carriageways)`);

  console.log('\n--- 2. ROAD CLASSIFICATION DISTRIBUTION ---');
  console.table(Object.entries(highwayTagStats).map(([tag, count]) => ({ HighwayTag: tag, Count: count })));

  console.log('\n--- 3. ONEWAY DISTRIBUTION ---');
  console.table(Object.entries(onewayStats).map(([tag, count]) => ({ OnewayTag: tag, Count: count })));

  // 4. CHECKPOINT MATCHING EVALUATION
  console.log('\n--- 4. CHECKPOINT MATCHING EVALUATION ---');
  const checkpointMatches = [];

  for (const cp of CHECKPOINTS) {
    let bestDistKm = Infinity;
    let bestNearestLat = null;
    let bestNearestLng = null;
    let bestWayId = null;
    let bestRelId = null;

    // Search all ways
    for (const way of allWays) {
      if (!way.nodes || way.nodes.length < 2) continue;
      for (let i = 0; i < way.nodes.length - 1; i++) {
        const n1 = allNodes.get(way.nodes[i]);
        const n2 = allNodes.get(way.nodes[i + 1]);
        if (!n1 || !n2) continue;

        const res = distanceToSegmentKm(cp.lat, cp.lng, n1.lat, n1.lon, n2.lat, n2.lon);
        if (res.distKm < bestDistKm) {
          bestDistKm = res.distKm;
          bestNearestLat = res.nearestLat;
          bestNearestLng = res.nearestLng;
          bestWayId = way.id;
          bestRelId = way.relId;
        }
      }
    }

    const confidence = bestDistKm < 1.0 ? 'Direct On-Road (<1km)' :
                       bestDistKm < 10.0 ? 'Near Bypass (1-10km)' : 'Urban Centroid Offset (>10km)';

    checkpointMatches.push({
      Checkpoint: cp.name,
      Jurisdiction: cp.state,
      CityCoords: `${cp.lat.toFixed(4)}, ${cp.lng.toFixed(4)}`,
      RoadCoords: `${bestNearestLat.toFixed(4)}, ${bestNearestLng.toFixed(4)}`,
      OffsetKm: bestDistKm.toFixed(2),
      MatchedWay: bestWayId,
      ChildRel: bestRelId,
      Confidence: confidence
    });
  }

  console.table(checkpointMatches);

  // 5. NAMAKKAL & NH381B INVESTIGATION
  console.log('\n--- 5. NAMAKKAL & NH381B INVESTIGATION ---');
  const namakkalCP = CHECKPOINTS.find(c => c.id === 'namakkal');
  const namakkalWays = allWays.filter(w => {
    if (!w.nodes) return false;
    return w.nodes.some(nId => {
      const node = allNodes.get(nId);
      return node && haversineDistanceKm(namakkalCP.lat, namakkalCP.lng, node.lat, node.lon) < 15;
    });
  });
  console.log(`Ways in relation 11568320 within 15km of Namakkal centroid: ${namakkalWays.length}`);
  namakkalWays.slice(0, 5).forEach(w => {
    console.log(`  Way ${w.id}: highway=${w.tags.highway}, name=${w.tags.name || 'none'}, ref=${w.tags.ref || 'none'}`);
  });

  // 6. HIMACHAL PRADESH INVESTIGATION
  console.log('\n--- 6. HIMACHAL PRADESH (RELATION 15623357) INVESTIGATION ---');
  const hpData = stateDataList.find(s => s.relId === 15623357);
  console.log('HP Relation Info:', hpData);

  // Save full audit report json
  const reportPath = path.join(__dirname, '..', '..', 'data', 'nh44_osm_validation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    masterRelation: master,
    childRelations: stateDataList,
    checkpointMatches,
    highwayTagStats,
    onewayStats,
    totalRawWaysLengthKm
  }, null, 2));
  console.log(`\nDetailed JSON validation data saved to: ${reportPath}`);
}

main().catch(err => {
  console.error('[ACQUISITION FAILED]', err);
  process.exit(1);
});
