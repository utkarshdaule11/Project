/**
 * scripts/gis/find_delhi_gaps.js
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
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const nodes = new Map();
  const ways = data.elements.filter(e => e.type === 'way');
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
  return { nodes, ways };
}

function buildUndirected(ways) {
  const adj = new Map();
  function add(u, v) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push(v);
  }
  for (const w of ways) {
    for (let i = 0; i < (w.nodes || []).length - 1; i++) {
      add(w.nodes[i], w.nodes[i+1]);
      add(w.nodes[i+1], w.nodes[i]);
    }
  }
  return adj;
}

function getReachable(startNode, adj) {
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

function findGapBetweenSets(setA, setB, allNodes) {
  let minD = Infinity;
  let best = null;
  for (const u of setA) {
    const nu = allNodes.get(u);
    if (!nu) continue;
    for (const v of setB) {
      const nv = allNodes.get(v);
      if (!nv) continue;
      if (Math.abs(nu.lat - nv.lat) > 0.05 || Math.abs(nu.lon - nv.lon) > 0.05) continue;
      const d = haversineMeters(nu.lat, nu.lon, nv.lat, nv.lon);
      if (d < minD) {
        minD = d;
        best = { u: { id: u, ...nu }, v: { id: v, ...nv }, d };
      }
    }
  }
  return best;
}

const dl = loadRel(5795969);
const hr = loadRel(5794309);
const up = loadRel(5803022);

const allNodes = new Map([...dl.nodes, ...hr.nodes, ...up.nodes]);

// 1. Delhi inside DL
console.log('--- 1. Inside Delhi (Delhi CP -> Badarpur) ---');
const adjDl = buildUndirected(dl.ways);
const reachDl = getReachable(1665802579, adjDl);
const reachBadarpur = getReachable(3909271455, adjDl);
console.log(`Delhi CP reachable nodes: ${reachDl.size}`);
console.log(`Badarpur reachable nodes: ${reachBadarpur.size}`);
const gapDl = findGapBetweenSets(reachDl, reachBadarpur, allNodes);
console.log(`Gap inside DL: ${gapDl?.d.toFixed(2)} m between ${gapDl?.u.id} and ${gapDl?.v.id}`);

// 2. Inside Haryana (Badarpur -> HR-UP border)
console.log('\n--- 2. Inside Haryana (Badarpur -> HR-UP) ---');
const adjHr = buildUndirected(hr.ways);
const reachHrNorth = getReachable(3909271455, adjHr);
const reachHrSouth = getReachable(2275932756, adjHr);
console.log(`Badarpur in HR reachable nodes: ${reachHrNorth.size}`);
console.log(`HR-UP border reachable nodes: ${reachHrSouth.size}`);
const gapHr = findGapBetweenSets(reachHrNorth, reachHrSouth, allNodes);
console.log(`Gap inside HR: ${gapHr?.d.toFixed(2)} m between ${gapHr?.u.id} and ${gapHr?.v.id}`);

// 3. Inside UP (HR-UP -> UP-RJ)
console.log('\n--- 3. Inside UP (HR-UP -> UP-RJ) ---');
const adjUp = buildUndirected(up.ways);
const reachUpNorth = getReachable(2275932756, adjUp);
const reachUpSouth = getReachable(7865484188, adjUp);
console.log(`HR-UP in UP reachable: ${reachUpNorth.size}`);
console.log(`UP-RJ in UP reachable: ${reachUpSouth.size}`);
const gapUp = findGapBetweenSets(reachUpNorth, reachUpSouth, allNodes);
console.log(`Gap inside UP: ${gapUp?.d.toFixed(2)} m between ${gapUp?.u.id} and ${gapUp?.v.id}`);
