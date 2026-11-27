const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function main() {
  const file = path.join(RAW_DIR, 'relation_5794209_full.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ways = data.elements.filter(e => e.type === 'way');
  const nodes = new Map();
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));

  const adj = new Map();
  function addEdge(u, v, way) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push({ to: v, way });
  }

  ways.forEach(w => {
    const wn = w.nodes || [];
    for (let i = 0; i < wn.length - 1; i++) {
      addEdge(wn[i], wn[i+1], w);
      addEdge(wn[i+1], wn[i], w);
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
      for (const edge of (adj.get(curr) || [])) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          q.push(edge.to);
        }
      }
    }
    components.push(comp);
  }

  components.sort((a, b) => b.length - a.length);

  const comp0 = components[0];
  const comp1 = components[1];

  let minGap = Infinity;
  let bestN0 = null;
  let bestN1 = null;

  for (const n1Id of comp1) {
    const n1 = nodes.get(n1Id);
    if (!n1) continue;
    for (const n0Id of comp0) {
      const n0 = nodes.get(n0Id);
      if (!n0) continue;
      if (Math.abs(n0.lat - n1.lat) > 0.05 || Math.abs(n0.lon - n1.lon) > 0.05) continue;
      const R = 6371008.8;
      const dLat = (n1.lat - n0.lat) * Math.PI / 180;
      const dLon = (n1.lon - n0.lon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(n0.lat * Math.PI / 180) * Math.cos(n1.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
      if (d < minGap) {
        minGap = d;
        bestN0 = { id: n0Id, ...n0 };
        bestN1 = { id: n1Id, ...n1 };
      }
    }
  }

  console.log(`JK Gap between Component 0 and Component 1: ${minGap.toFixed(2)} meters`);
  console.log(`Component 0 node: ${bestN0.id} at ${bestN0.lat}, ${bestN0.lon}`);
  console.log(`Component 1 node: ${bestN1.id} at ${bestN1.lat}, ${bestN1.lon}`);

  // Find ways containing bestN0 and bestN1
  const ways0 = ways.filter(w => (w.nodes || []).includes(bestN0.id));
  const ways1 = ways.filter(w => (w.nodes || []).includes(bestN1.id));
  console.log('Ways at Component 0 boundary:', ways0.map(w => ({ id: w.id, tags: w.tags })));
  console.log('Ways at Component 1 boundary:', ways1.map(w => ({ id: w.id, tags: w.tags })));
}

main();
