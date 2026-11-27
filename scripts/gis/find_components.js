/**
 * scripts/gis/find_components.js
 * 
 * Lists all connected components in a relation and finds gaps between them.
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

function analyzeRelation(relId, relName) {
  const file = path.join(RAW_DIR, `relation_${relId}_full.json`);
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const nodes = new Map();
  const ways = data.elements.filter(e => e.type === 'way');
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));

  // Build undirected graph
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

  // Find components
  const visited = new Set();
  const components = [];

  for (const nid of nodes.keys()) {
    if (visited.has(nid) || !adj.has(nid)) continue;
    const comp = [];
    const q = [nid];
    visited.add(nid);
    while (q.length > 0) {
      const u = q.pop();
      comp.push(u);
      for (const v of (adj.get(u) || [])) {
        if (!visited.has(v)) {
          visited.add(v);
          q.push(v);
        }
      }
    }
    // Calculate mean lat
    const avgLat = comp.reduce((sum, id) => sum + nodes.get(id).lat, 0) / comp.length;
    const maxLat = Math.max(...comp.map(id => nodes.get(id).lat));
    const minLat = Math.min(...comp.map(id => nodes.get(id).lat));
    components.push({ comp, avgLat, maxLat, minLat, size: comp.length });
  }

  // Sort components north to south by maxLat descending
  components.sort((a, b) => b.maxLat - a.maxLat);

  console.log(`\n=== Relation ${relId} (${relName}) ===`);
  console.log(`Total components: ${components.length}`);
  const mainComps = components.filter(c => c.size > 10);
  console.log(`Major components (> 10 nodes): ${mainComps.length}`);

  for (let i = 0; i < mainComps.length - 1; i++) {
    const c1 = mainComps[i];
    const c2 = mainComps[i + 1];
    // Find min distance between c1 and c2
    let minD = Infinity;
    let best = null;
    for (const u of c1.comp) {
      const nu = nodes.get(u);
      for (const v of c2.comp) {
        const nv = nodes.get(v);
        if (Math.abs(nu.lat - nv.lat) > 0.1 || Math.abs(nu.lon - nv.lon) > 0.1) continue;
        const d = haversineMeters(nu.lat, nu.lon, nv.lat, nv.lon);
        if (d < minD) {
          minD = d;
          best = { u: { id: u, ...nu }, v: { id: v, ...nv }, d };
        }
      }
    }
    console.log(`Gap ${i + 1}: c1(${c1.size} nodes, lat ${c1.minLat.toFixed(2)}-${c1.maxLat.toFixed(2)}) -> c2(${c2.size} nodes, lat ${c2.minLat.toFixed(2)}-${c2.maxLat.toFixed(2)}): ${minD.toFixed(2)} meters`);
    if (best && minD < 1000) {
      console.log(`   Between ${best.u.id} (${best.u.lat}, ${best.u.lon}) and ${best.v.id} (${best.v.lat}, ${best.v.lon})`);
    }
  }
}

analyzeRelation(5794209, 'Jammu & Kashmir');
analyzeRelation(5803022, 'Uttar Pradesh');
