/**
 * scripts/gis/inspect_2_remaining.js
 * 
 * Inspecting the exact geometry and connectivity for:
 * 1. Srinagar -> Jalandhar (nodes 5459979447 and 7826821873)
 * 2. Delhi -> Gwalior (why it fails to go south from Delhi)
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function loadRel(relId) {
  const file = path.join(RAW_DIR, `relation_${relId}_full.json`);
  if (!fs.existsSync(file)) return { nodes: new Map(), ways: new Map() };
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const nodes = new Map();
  const ways = new Map();
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
  data.elements.filter(e => e.type === 'way').forEach(w => ways.set(w.id, w));
  return { nodes, ways };
}

// 1. Inspect JK nodes 5459979447 and 7826821873
console.log('=== INSPECTING JK GAP ===');
const jk = loadRel(5794209);
console.log('Node 5459979447:', jk.nodes.get(5459979447));
console.log('Node 7826821873:', jk.nodes.get(7826821873));

for (const [wid, w] of jk.ways.entries()) {
  const idx1 = (w.nodes || []).indexOf(5459979447);
  const idx2 = (w.nodes || []).indexOf(7826821873);
  if (idx1 !== -1) console.log(`Node 5459979447 in way ${wid} (index ${idx1} of ${w.nodes.length}), tags:`, w.tags);
  if (idx2 !== -1) console.log(`Node 7826821873 in way ${wid} (index ${idx2} of ${w.nodes.length}), tags:`, w.tags);
}

// 2. Inspect Delhi -> Gwalior
console.log('\n=== INSPECTING DELHI TO GWALIOR CONNECTIVITY ===');
const dl = loadRel(5795969); // Delhi
const hr = loadRel(5794309); // Haryana
const up = loadRel(5803022); // UP
const rj = loadRel(5802963); // Rajasthan
const mp = loadRel(5802971); // MP

console.log(`Delhi rel has ${dl.ways.size} ways, ${dl.nodes.size} nodes`);
console.log(`Haryana rel has ${hr.ways.size} ways, ${hr.nodes.size} nodes`);
console.log(`UP rel has ${up.ways.size} ways, ${up.nodes.size} nodes`);
console.log(`MP rel has ${mp.ways.size} ways, ${mp.nodes.size} nodes`);

// Check DL node 1665802579
console.log('Delhi CP node 1665802579 in DL?', dl.nodes.has(1665802579), dl.nodes.get(1665802579));

// Check where DL connects southward to HR (Faridabad)
// In DL, NH44 runs from north (Singhu border) through Ring Road/Ashram to south (Badarpur border into Faridabad, Haryana)
// Then Faridabad (HR) -> Palwal (HR) -> Mathura (UP) -> Agra (UP) -> Dholpur (RJ) -> Morena (MP) -> Gwalior (MP).
// Let's check border nodes between DL and HR south:
let dlHrSouthShared = [];
for (const [nid, n] of dl.nodes.entries()) {
  if (hr.nodes.has(nid) && n.lat < 28.55) {
    dlHrSouthShared.push({ nid, ...n });
  }
}
console.log('Shared nodes between DL and HR in south (lat < 28.55):', dlHrSouthShared);

if (dlHrSouthShared.length === 0) {
  // Find minimum distance between DL and HR in the south
  let minD = Infinity;
  let best = null;
  for (const [nid1, n1] of dl.nodes.entries()) {
    if (n1.lat > 28.55 || n1.lat < 28.4) continue;
    for (const [nid2, n2] of hr.nodes.entries()) {
      if (n2.lat > 28.55 || n2.lat < 28.4) continue;
      const dLat = n1.lat - n2.lat;
      const dLon = n1.lon - n2.lon;
      const d = Math.sqrt(dLat*dLat + dLon*dLon) * 111000;
      if (d < minD) {
        minD = d;
        best = { n1: { nid: nid1, ...n1 }, n2: { nid: nid2, ...n2 } };
      }
    }
  }
  console.log(`Closest distance DL to HR in south: ${minD.toFixed(2)} meters`);
  console.log('Best match:', best);
}
