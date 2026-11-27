/**
 * scripts/gis/trace_delhi_gwalior.js
 */

const fs = require('fs');
const path = require('path');
const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function loadRel(relId) {
  const file = path.join(RAW_DIR, `relation_${relId}_full.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const nodes = new Map();
  const ways = data.elements.filter(e => e.type === 'way');
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
  return { nodes, ways };
}

function buildUndirected(ways, nodes) {
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

function canReach(u, v, adj) {
  const visited = new Set([u]);
  const q = [u];
  while (q.length > 0) {
    const curr = q.pop();
    if (curr === v) return true;
    for (const nxt of (adj.get(curr) || [])) {
      if (!visited.has(nxt)) {
        visited.add(nxt);
        q.push(nxt);
      }
    }
  }
  return false;
}

const dl = loadRel(5795969);
const hr = loadRel(5794309);
const up = loadRel(5803022);
const rj = loadRel(5802963);
const mp = loadRel(5802971);

const allNodes = new Map([...dl.nodes, ...hr.nodes, ...up.nodes, ...rj.nodes, ...mp.nodes]);
const allWays = [...dl.ways, ...hr.ways, ...up.ways, ...rj.ways, ...mp.ways];
const adj = buildUndirected(allWays, allNodes);

const delhiNode = 1665802579;
const badarpurNode = 3909271455;
const hrUpNode = 2275932756;
const upRjNode = 7865484188;
const rjMpNode = 1863323699;
const gwaliorNode = 3842215977;

console.log('Delhi CP -> Badarpur border (DL-HR):', canReach(delhiNode, badarpurNode, adj));
console.log('Badarpur border -> HR-UP border (Kosi Kalan):', canReach(badarpurNode, hrUpNode, adj));
console.log('HR-UP border -> UP-RJ border (Dholpur):', canReach(hrUpNode, upRjNode, adj));
console.log('UP-RJ border -> RJ-MP border (Chambal):', canReach(upRjNode, rjMpNode, adj));
console.log('RJ-MP border -> Gwalior CP:', canReach(rjMpNode, gwaliorNode, adj));
