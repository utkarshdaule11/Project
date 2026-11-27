/**
 * scripts/gis/test_strict_oneway.js
 * 
 * Tests strict 100% legal oneway routing where counter-flow travel is STRICTLY PROHIBITED.
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0088;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

const master = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'relation_11568320.json'), 'utf8')).elements[0];
const childRels = master.members.filter(m => m.type === 'relation');
const allNodes = new Map();
const allWays = new Map();

for (const child of childRels) {
  const file = path.join(RAW_DIR, `relation_${child.ref}_full.json`);
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.elements.filter(e => e.type === 'node').forEach(n => allNodes.set(n.id, { lat: n.lat, lon: n.lon }));
  data.elements.filter(e => e.type === 'way').forEach(w => {
    if (!allWays.has(w.id)) allWays.set(w.id, { ...w, relId: child.ref });
  });
}

// Build STRICTLY DIRECTED graph (NO reverse edges on oneway=yes or oneway=-1)
const graph = new Map();
function addEdge(u, v, wayId, distKm) {
  if (!graph.has(u)) graph.set(u, []);
  graph.get(u).push({ to: v, wayId, distKm });
}

for (const [wayId, way] of allWays.entries()) {
  const nodes = way.nodes || [];
  if (nodes.length < 2) continue;
  const tags = way.tags || {};
  const oneway = tags.oneway;

  for (let i = 0; i < nodes.length - 1; i++) {
    const u = nodes[i];
    const v = nodes[i + 1];
    const n1 = allNodes.get(u);
    const n2 = allNodes.get(v);
    if (!n1 || !n2) continue;
    const d = haversineKm(n1.lat, n1.lon, n2.lat, n2.lon);

    if (oneway === 'yes') {
      addEdge(u, v, wayId, d); // ONLY legal forward direction!
    } else if (oneway === '-1') {
      addEdge(v, u, wayId, d); // ONLY legal reverse direction!
    } else {
      // Bidirectional
      addEdge(u, v, wayId, d);
      addEdge(v, u, wayId, d);
    }
  }
}

// Add the 5 structural gaps
const documentedGaps = [
  { u: 5459979257, v: 2389831547, distKm: 0.14173 },
  { u: 14093730923, v: 2477285466, distKm: 0.71631 },
  { u: 6297315853, v: 9003040356, distKm: 0.35023 },
  { u: 4389191166, v: 4235553521, distKm: 0.64070 },
  { u: 11383273877, v: 9869643728, distKm: 0.12312 }
];
documentedGaps.forEach(g => {
  addEdge(g.u, g.v, `GAP_${g.distKm}`, g.distKm);
});

// Auto-bridge sub-25m splits (these are physical median/split joins, bidirectional)
const bins = new Map();
for (const [nid, n] of allNodes.entries()) {
  const k = `${Math.floor(n.lat * 50)},${Math.floor(n.lon * 50)}`;
  if (!bins.has(k)) bins.set(k, []);
  bins.get(k).push(nid);
}
let bridgesAdded = 0;
for (const [nid, edges] of graph.entries()) {
  if (edges.length <= 2) {
    const nu = allNodes.get(nid);
    if (!nu) continue;
    const bLat = Math.floor(nu.lat * 50);
    const bLon = Math.floor(nu.lon * 50);
    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLon = -1; dLon <= 1; dLon++) {
        const k = `${bLat + dLat},${bLon + dLon}`;
        const candidates = bins.get(k);
        if (!candidates) continue;
        for (const vid of candidates) {
          if (vid === nid) continue;
          const nv = allNodes.get(vid);
          if (Math.abs(nu.lat - nv.lat) > 0.00025 || Math.abs(nu.lon - nv.lon) > 0.00025) continue;
          const d = haversineKm(nu.lat, nu.lon, nv.lat, nv.lon);
          if (d < 0.025) {
            addEdge(nid, vid, `BRIDGE_${(d * 1000).toFixed(0)}m`, d);
            addEdge(vid, nid, `BRIDGE_${(d * 1000).toFixed(0)}m`, d);
            bridgesAdded++;
          }
        }
      }
    }
  }
}
console.log(`Strictly directed graph built. Bridges added: ${bridgesAdded}`);

// 14 Checkpoints
const CHECKPOINTS = [
  { id: 'srinagar', name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { id: 'jalandhar', name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
  { id: 'ludhiana', name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { id: 'ambala', name: 'Ambala', lat: 30.3782, lng: 76.7767 },
  { id: 'delhi', name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { id: 'gwalior', name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
  { id: 'jhansi', name: 'Jhansi', lat: 25.4484, lng: 78.5685 },
  { id: 'nagpur', name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { id: 'bangalore', name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { id: 'salem', name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { id: 'namakkal', name: 'Namakkal', lat: 11.2189, lng: 78.1674 },
  { id: 'madurai', name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { id: 'kanyakumari', name: 'Kanyakumari', lat: 8.0883, lng: 77.5385 },
];

// Dijkstra
function findStrictPath(startNode, endNode) {
  const dist = new Map();
  const visited = new Set();
  const pq = [{ node: startNode, d: 0 }];
  dist.set(startNode, 0);

  while (pq.length > 0) {
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i].d < pq[minIdx].d) minIdx = i;
    }
    const curr = pq.splice(minIdx, 1)[0];
    const u = curr.node;
    if (u === endNode) return dist.get(endNode);
    if (visited.has(u)) continue;
    visited.add(u);

    for (const e of (graph.get(u) || [])) {
      if (visited.has(e.to)) continue;
      const newD = curr.d + e.distKm;
      if (!dist.has(e.to) || newD < dist.get(e.to)) {
        dist.set(e.to, newD);
        pq.push({ node: e.to, d: newD });
      }
    }
  }
  return null;
}

// Find nearest candidate nodes for checkpoints that can actually travel SOUTH
console.log('\n--- TESTING STRICT SOUTHBOUND ROUTING ---');
// Let's test with previous checkpoint nodes
const prevNodes = [
  10207059581, 10151766274, 7214631685, 1880661435, 1665802579,
  3842215977, 2156689705, 2241091385, 3215426731, 3805003790,
  1752686792, 2074105060, 2004083448, 1700570015
];

for (let i = 0; i < CHECKPOINTS.length - 1; i++) {
  const u = prevNodes[i];
  const v = prevNodes[i + 1];
  const d = findStrictPath(u, v);
  console.log(`Leg ${i + 1}: ${CHECKPOINTS[i].name} -> ${CHECKPOINTS[i + 1].name}: ${d ? `SUCCESS (${d.toFixed(1)} km)` : 'FAILED (Disconnected under strict directionality)'}`);
}
