const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function checkRel(relId, stateName) {
  const file = path.join(RAW_DIR, `relation_${relId}_full.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ways = data.elements.filter(e => e.type === 'way');
  const nodes = new Map();
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));

  // Undirected graph of ways in this relation
  const adj = new Map();
  function addEdge(u, v) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push(v);
  }

  ways.forEach(w => {
    const wn = w.nodes || [];
    for (let i = 0; i < wn.length - 1; i++) {
      addEdge(wn[i], wn[i+1]);
      addEdge(wn[i+1], wn[i]);
    }
  });

  const visited = new Set();
  const components = [];

  for (const node of adj.keys()) {
    if (visited.has(node)) continue;
    const comp = [];
    const q = [node];
    visited.add(node);
    while (q.length > 0) {
      const curr = q.pop();
      comp.push(curr);
      for (const neighbor of (adj.get(curr) || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          q.push(neighbor);
        }
      }
    }
    components.push(comp);
  }

  components.sort((a, b) => b.length - a.length);
  console.log(`State ${stateName} (${relId}):`);
  console.log(`  Total ways: ${ways.length}, Nodes: ${nodes.size}`);
  console.log(`  Connected components: ${components.length}`);
  console.log(`  Component sizes: ${components.slice(0, 5).map(c => c.length).join(', ')}`);

  if (components.length > 1) {
    // Check distance between component 0 and component 1
    const comp0Set = new Set(components[0]);
    let minGap = Infinity;
    for (const n2Id of components[1]) {
      const n2 = nodes.get(n2Id);
      if (!n2) continue;
      for (const n1Id of components[0]) {
        const n1 = nodes.get(n1Id);
        if (!n1) continue;
        if (Math.abs(n1.lat - n2.lat) > 0.05 || Math.abs(n1.lon - n2.lon) > 0.05) continue;
        const R = 6371008.8;
        const dLat = (n2.lat - n1.lat) * Math.PI / 180;
        const dLon = (n2.lon - n1.lon) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(n1.lat * Math.PI / 180) * Math.cos(n2.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
        if (d < minGap) minGap = d;
      }
    }
    console.log(`  Gap between comp 0 and comp 1: ${minGap.toFixed(2)} meters`);
  }
}

function main() {
  checkRel(5794209, 'JK (Jammu & Kashmir)');
  checkRel(5795969, 'DL (Delhi)');
  checkRel(5803131, 'MH (Maharashtra)');
  checkRel(5878728, 'KA (Karnataka)');
}

main();
