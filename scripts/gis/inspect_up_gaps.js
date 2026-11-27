/**
 * scripts/gis/inspect_up_gaps.js
 */

const fs = require('fs');
const path = require('path');
const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

const upData = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'relation_5803022_full.json'), 'utf8'));
const nodes = new Map();
const ways = new Map();
upData.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
upData.elements.filter(e => e.type === 'way').forEach(w => ways.set(w.id, w));

function findWaysWithNode(nid) {
  const result = [];
  for (const [wid, w] of ways.entries()) {
    if ((w.nodes || []).includes(nid)) {
      result.push({ id: wid, tags: w.tags, nodesCount: w.nodes.length });
    }
  }
  return result;
}

console.log('--- UP GAP 1: lat 27.27 (Near Farah / Mathura-Agra) ---');
console.log('Node 6297315853:', nodes.get(6297315853), findWaysWithNode(6297315853));
console.log('Node 9003040356:', nodes.get(9003040356), findWaysWithNode(9003040356));

console.log('\n--- UP GAP 2: lat 27.06 (Agra / Rohta) ---');
console.log('Node 4389191166:', nodes.get(4389191166), findWaysWithNode(4389191166));
console.log('Node 4235553521:', nodes.get(4235553521), findWaysWithNode(4235553521));
