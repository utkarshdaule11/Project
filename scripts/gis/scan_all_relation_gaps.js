/**
 * scripts/gis/scan_all_relation_gaps.js
 * 
 * Scans all 13 child relations and lists all internal gaps > 25m.
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

const master = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'relation_11568320.json'), 'utf8')).elements[0];
const childRels = master.members.filter(m => m.type === 'relation');

const allGaps = [];

for (const child of childRels) {
  const file = path.join(RAW_DIR, `relation_${child.ref}_full.json`);
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  const nodes = new Map();
  const ways = data.elements.filter(e => e.type === 'way');
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));

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
  const comps = [];
  for (const nid of nodes.keys()) {
    if (visited.has(nid) || !adj.has(nid)) continue;
    const c = [];
    const q = [nid];
    visited.add(nid);
    while (q.length > 0) {
      const u = q.pop();
      c.push(u);
      for (const v of (adj.get(u) || [])) {
        if (!visited.has(v)) {
          visited.add(v);
          q.push(v);
        }
      }
    }
    const maxLat = Math.max(...c.map(id => nodes.get(id).lat));
    const minLat = Math.min(...c.map(id => nodes.get(id).lat));
    comps.push({ c, maxLat, minLat, size: c.length });
  }

  // Filter significant components
  const sig = comps.filter(c => c.size >= 10);
  sig.sort((a, b) => b.maxLat - a.maxLat);

  for (let i = 0; i < sig.length - 1; i++) {
    const c1 = sig[i];
    const c2 = sig[i + 1];
    let minD = Infinity;
    let best = null;
    for (const u of c1.c) {
      const nu = nodes.get(u);
      for (const v of c2.c) {
        const nv = nodes.get(v);
        if (Math.abs(nu.lat - nv.lat) > 0.1 || Math.abs(nu.lon - nv.lon) > 0.1) continue;
        const d = haversineMeters(nu.lat, nu.lon, nv.lat, nv.lon);
        if (d < minD) {
          minD = d;
          best = { u, nu, v, nv, d };
        }
      }
    }
    if (minD > 25 && minD < 5000) {
      allGaps.push({
        relId: child.ref,
        fromComp: i,
        toComp: i + 1,
        distMeters: minD,
        u: best.u,
        v: best.v,
        nu: best.nu,
        nv: best.nv
      });
    }
  }
}

console.log(`\n=== ALL INTERNAL RELATION GAPS (25m < d < 5000m) ===`);
allGaps.forEach(g => {
  console.log(`Rel ${g.relId}: ${g.distMeters.toFixed(2)} m between node ${g.u} (${g.nu.lat.toFixed(5)}, ${g.nu.lon.toFixed(5)}) and node ${g.v} (${g.nv.lat.toFixed(5)}, ${g.nv.lon.toFixed(5)})`);
});
console.log(`Total gaps found: ${allGaps.length}`);
