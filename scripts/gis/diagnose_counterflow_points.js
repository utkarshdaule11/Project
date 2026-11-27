/**
 * scripts/gis/diagnose_counterflow_points.js
 * 
 * Inspecting the exact geometry of the 12 counterflow points:
 * 1. Peerah Chanderkot Tunnel (J&K)
 * 2. Nizamabad Road (Telangana)
 * 3. Hosur Road (Bangalore)
 */

const fs = require('fs');
const path = require('path');
const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function loadRel(relId) {
  const file = path.join(RAW_DIR, `relation_${relId}_full.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const nodes = new Map();
  const ways = new Map();
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
  data.elements.filter(e => e.type === 'way').forEach(w => ways.set(w.id, w));
  return { nodes, ways };
}

// 1. Inspect J&K Peerah tunnel: Way 1270692111
console.log('=== 1. J&K PEERAH TUNNEL (Way 1270692111) ===');
const jk = loadRel(5794209);
const wTunnel = jk.ways.get(1270692111);
console.log('Way 1270692111 tags:', wTunnel?.tags);
const tunnelNodes = (wTunnel?.nodes || []).map(id => jk.nodes.get(id)).filter(Boolean);
console.log(`First node: lat ${tunnelNodes[0]?.lat}, lon ${tunnelNodes[0]?.lon}`);
console.log(`Last node: lat ${tunnelNodes[tunnelNodes.length - 1]?.lat}, lon ${tunnelNodes[tunnelNodes.length - 1]?.lon}`);
console.log(`Lat delta (last - first): ${tunnelNodes[tunnelNodes.length - 1]?.lat - tunnelNodes[0]?.lat} (positive means digitized north!)`);

// Check if there is another way near Peerah tunnel
for (const [wid, w] of jk.ways.entries()) {
  if (wid === 1270692111) continue;
  const n0 = jk.nodes.get((w.nodes || [])[0]);
  if (n0 && Math.abs(n0.lat - tunnelNodes[0]?.lat) < 0.02 && Math.abs(n0.lon - tunnelNodes[0]?.lon) < 0.02) {
    console.log(`Nearby way in JK: ${wid} (${w.tags?.name || 'unnamed'}, ref: ${w.tags?.ref}, oneway: ${w.tags?.oneway})`);
  }
}

// 2. Inspect Bangalore Silk Board / Hosur Road: Way 377132617 & 1155963376
console.log('\n=== 2. BANGALORE HOSUR ROAD (Way 377132617 & 1155963376) ===');
const ka = loadRel(5878728);
const blrNode = ka.nodes.get(3805003790);
console.log('Current Bangalore CP Node 3805003790:', blrNode);
// Find all ways passing through or near this node
for (const [wid, w] of ka.ways.entries()) {
  const idx = (w.nodes || []).indexOf(3805003790);
  if (idx !== -1) {
    const first = ka.nodes.get(w.nodes[0]);
    const last = ka.nodes.get(w.nodes[w.nodes.length - 1]);
    console.log(`Node 3805003790 in way ${wid} (${w.tags?.name}, oneway: ${w.tags?.oneway}, ref: ${w.tags?.ref})`);
    console.log(`  Way direction: first lat ${first?.lat} -> last lat ${last?.lat} (delta: ${last?.lat - first?.lat})`);
  }
}

// Check if there is a parallel southbound way right at Bangalore CP
for (const [wid, w] of ka.ways.entries()) {
  const nodes = w.nodes || [];
  for (const nid of nodes) {
    const n = ka.nodes.get(nid);
    if (n && Math.abs(n.lat - blrNode.lat) < 0.005 && Math.abs(n.lon - blrNode.lon) < 0.005) {
      const first = ka.nodes.get(nodes[0]);
      const last = ka.nodes.get(nodes[nodes.length - 1]);
      const delta = (last?.lat || 0) - (first?.lat || 0);
      if (delta < -0.001 && w.tags?.oneway === 'yes') {
        console.log(`Found candidate SOUTHBOUND way near Bangalore CP: ${wid} (${w.tags?.name}, delta: ${delta.toFixed(4)}) node ${nid}`);
        break;
      }
    }
  }
}
