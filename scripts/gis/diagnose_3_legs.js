/**
 * scripts/gis/diagnose_3_legs.js
 * 
 * Detailed diagnosis of remaining disconnects for:
 * 1. Srinagar -> Jalandhar
 * 2. Delhi -> Gwalior
 * 3. Bangalore -> Salem
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371008.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

function loadRel(relId) {
  const file = path.join(RAW_DIR, `relation_${relId}_full.json`);
  if (!fs.existsSync(file)) return { nodes: new Map(), ways: [] };
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const nodes = new Map();
  const ways = data.elements.filter(e => e.type === 'way');
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
  return { nodes, ways };
}

function buildGraph(relIds, bridges = []) {
  const allNodes = new Map();
  const allWays = [];
  for (const id of relIds) {
    const { nodes, ways } = loadRel(id);
    for (const [nid, n] of nodes.entries()) allNodes.set(nid, n);
    allWays.push(...ways);
  }

  const adj = new Map();
  function add(u, v) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push(v);
  }

  for (const w of allWays) {
    const nodes = w.nodes || [];
    for (let i = 0; i < nodes.length - 1; i++) {
      add(nodes[i], nodes[i+1]);
      add(nodes[i+1], nodes[i]);
    }
  }

  for (const b of bridges) {
    add(b.u, b.v);
    add(b.v, b.u);
  }

  return { allNodes, allWays, adj };
}

function findReachable(startNode, adj) {
  const visited = new Set([startNode]);
  const q = [startNode];
  while (q.length > 0) {
    const u = q.pop();
    for (const v of (adj.get(u) || [])) {
      if (!visited.has(v)) {
        visited.add(v);
        q.push(v);
      }
    }
  }
  return visited;
}

function findSmallestGap(reachableSet, targetSet, allNodes) {
  // Use spatial binning for fast lookup
  const bins = new Map();
  function binKey(lat, lon) {
    return `${Math.floor(lat * 10)},${Math.floor(lon * 10)}`;
  }

  for (const u of reachableSet) {
    const nu = allNodes.get(u);
    if (!nu) continue;
    const k = binKey(nu.lat, nu.lon);
    if (!bins.has(k)) bins.set(k, []);
    bins.get(k).push(u);
  }

  let minD = Infinity;
  let bestU = null;
  let bestV = null;

  for (const v of targetSet) {
    const nv = allNodes.get(v);
    if (!nv) continue;
    // Check neighboring bins
    const latB = Math.floor(nv.lat * 10);
    const lonB = Math.floor(nv.lon * 10);
    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLon = -1; dLon <= 1; dLon++) {
        const k = `${latB + dLat},${lonB + dLon}`;
        const uList = bins.get(k);
        if (!uList) continue;
        for (const u of uList) {
          const nu = allNodes.get(u);
          const d = haversineMeters(nu.lat, nu.lon, nv.lat, nv.lon);
          if (d < minD) {
            minD = d;
            bestU = { id: u, ...nu };
            bestV = { id: v, ...nv };
          }
        }
      }
    }
  }

  return { minD, bestU, bestV };
}

// 1. Srinagar -> Jalandhar (JK: 5794209, PB: 5794254, HP: 5794270)
console.log('=== TEST 1: SRINAGAR -> JALANDHAR ===');
const jkBridge = [{ u: 2477285501, v: 2477285466 }];
const g1 = buildGraph([5794209, 5794270, 5794254], jkBridge);
const srinagarNode = 10207059581;
const jalandharNode = 10151766274;
const reach1 = findReachable(srinagarNode, g1.adj);
console.log(`Reachable from Srinagar: ${reach1.size} / ${g1.allNodes.size}`);
console.log(`Can reach Jalandhar? ${reach1.has(jalandharNode)}`);
if (!reach1.has(jalandharNode)) {
  const unreached = new Set();
  for (const nid of g1.allNodes.keys()) {
    if (!reach1.has(nid)) unreached.add(nid);
  }
  const gap = findSmallestGap(reach1, unreached, g1.allNodes);
  console.log(`Smallest gap: ${gap.minD.toFixed(2)} meters`);
  console.log(`Between ${gap.bestU?.id} (${gap.bestU?.lat}, ${gap.bestU?.lon}) and ${gap.bestV?.id} (${gap.bestV?.lat}, ${gap.bestV?.lon})`);
}

// 2. Delhi -> Gwalior (DL: 5795969, HR: 5794309, UP: 5803022, RJ: 5802963, MP: 5802971)
console.log('\n=== TEST 2: DELHI -> GWALIOR ===');
const dlBridge = [{ u: 568370366, v: 568370327 }];
const g2 = buildGraph([5795969, 5794309, 5803022, 5802963, 5802971], dlBridge);
const delhiNode = 1665802579;
const gwaliorNode = 3842215977;
const reach2 = findReachable(delhiNode, g2.adj);
console.log(`Reachable from Delhi: ${reach2.size} / ${g2.allNodes.size}`);
console.log(`Can reach Gwalior? ${reach2.has(gwaliorNode)}`);
if (!reach2.has(gwaliorNode)) {
  const unreached = new Set();
  for (const nid of g2.allNodes.keys()) {
    if (!reach2.has(nid)) unreached.add(nid);
  }
  const gap = findSmallestGap(reach2, unreached, g2.allNodes);
  console.log(`Smallest gap: ${gap.minD.toFixed(2)} meters`);
  console.log(`Between ${gap.bestU?.id} (${gap.bestU?.lat}, ${gap.bestU?.lon}) and ${gap.bestV?.id} (${gap.bestV?.lat}, ${gap.bestV?.lon})`);
}

// 3. Bangalore -> Salem (KA: 5878728, TN: 5803261)
console.log('\n=== TEST 3: BANGALORE -> SALEM ===');
const blrBridge = [{ u: 3722801185, v: 1769550152 }];
const g3 = buildGraph([5878728, 5803261], blrBridge);
const blrNode = 3805003790;
const salemNode = 1752686792;
const reach3 = findReachable(blrNode, g3.adj);
console.log(`Reachable from Bangalore: ${reach3.size} / ${g3.allNodes.size}`);
console.log(`Can reach Salem? ${reach3.has(salemNode)}`);
if (!reach3.has(salemNode)) {
  const unreached = new Set();
  for (const nid of g3.allNodes.keys()) {
    if (!reach3.has(nid)) unreached.add(nid);
  }
  const gap = findSmallestGap(reach3, unreached, g3.allNodes);
  console.log(`Smallest gap: ${gap.minD.toFixed(2)} meters`);
  console.log(`Between ${gap.bestU?.id} (${gap.bestU?.lat}, ${gap.bestU?.lon}) and ${gap.bestV?.id} (${gap.bestV?.lat}, ${gap.bestV?.lon})`);
}
