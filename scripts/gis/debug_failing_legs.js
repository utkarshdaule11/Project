/**
 * scripts/gis/debug_failing_legs.js
 * 
 * Pinpoints the exact disconnect in the 4 failing legs:
 * 1. Srinagar -> Jalandhar
 * 2. Delhi -> Gwalior
 * 3. Nagpur -> Hyderabad
 * 4. Bangalore -> Salem
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

function buildUndirectedGraph(ways, nodes) {
  const adj = new Map();
  function add(u, v, wayId) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push({ to: v, wayId });
  }
  for (const w of ways) {
    for (let i = 0; i < (w.nodes || []).length - 1; i++) {
      add(w.nodes[i], w.nodes[i+1], w.id);
      add(w.nodes[i+1], w.nodes[i], w.id);
    }
  }
  return adj;
}

function getReachable(startNode, graph) {
  const visited = new Set([startNode]);
  const q = [startNode];
  while (q.length > 0) {
    const u = q.pop();
    for (const edge of (graph.get(u) || [])) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        q.push(edge.to);
      }
    }
  }
  return visited;
}

function main() {
  console.log('=== DEBUGGING 4 FAILING LEGS ===\n');

  // Test 1: MH (Nagpur) -> TG (Hyderabad)
  console.log('--- TEST 1: NAGPUR -> HYDERABAD ---');
  const mh = loadRel(5803131);
  const tg = loadRel(5803164);
  const allMhTgNodes = new Map([...mh.nodes, ...tg.nodes]);
  const mhTgWays = [...mh.ways, ...tg.ways];
  const graphMhTg = buildUndirectedGraph(mhTgWays, allMhTgNodes);

  // Nagpur node: 2241091385
  // Hyderabad node: 3215426731
  const reachableFromNagpur = getReachable(2241091385, graphMhTg);
  console.log(`Nagpur node 2241091385 can reach ${reachableFromNagpur.size} nodes.`);
  console.log(`Can reach Hyderabad node 3215426731? ${reachableFromNagpur.has(3215426731)}`);

  if (!reachableFromNagpur.has(3215426731)) {
    // Find closest node in TG from reachable set
    let minD = Infinity;
    let bestU = null;
    let bestV = null;
    for (const u of reachableFromNagpur) {
      const nu = allMhTgNodes.get(u);
      for (const [v, nv] of tg.nodes.entries()) {
        if (reachableFromNagpur.has(v)) continue;
        if (Math.abs(nu.lat - nv.lat) > 0.05 || Math.abs(nu.lon - nv.lon) > 0.05) continue;
        const d = haversineMeters(nu.lat, nu.lon, nv.lat, nv.lon);
        if (d < minD) {
          minD = d;
          bestU = { id: u, ...nu };
          bestV = { id: v, ...nv };
        }
      }
    }
    console.log(`Gap between Nagpur reachable component and TG: ${minD.toFixed(2)} meters`);
    if (bestU) console.log(`Between ${bestU.id} (${bestU.lat}, ${bestU.lon}) and ${bestV.id} (${bestV.lat}, ${bestV.lon})`);
  }

  // Test 2: KA (Bangalore) -> TN (Salem)
  console.log('\n--- TEST 2: BANGALORE -> SALEM ---');
  const ka = loadRel(5878728);
  const tn = loadRel(5803261);
  const allKaTnNodes = new Map([...ka.nodes, ...tn.nodes]);
  const kaTnWays = [...ka.ways, ...tn.ways];
  const graphKaTn = buildUndirectedGraph(kaTnWays, allKaTnNodes);

  // Bangalore node: 3805003790
  // Salem node: 1752686792
  const reachableFromBlr = getReachable(3805003790, graphKaTn);
  console.log(`Bangalore node 3805003790 can reach ${reachableFromBlr.size} nodes.`);
  console.log(`Can reach Salem node 1752686792? ${reachableFromBlr.has(1752686792)}`);

  if (!reachableFromBlr.has(1752686792)) {
    let minD = Infinity;
    let bestU = null;
    let bestV = null;
    for (const u of reachableFromBlr) {
      const nu = allKaTnNodes.get(u);
      for (const [v, nv] of allKaTnNodes.entries()) {
        if (reachableFromBlr.has(v)) continue;
        if (Math.abs(nu.lat - nv.lat) > 0.05 || Math.abs(nu.lon - nv.lon) > 0.05) continue;
        const d = haversineMeters(nu.lat, nu.lon, nv.lat, nv.lon);
        if (d < minD) {
          minD = d;
          bestU = { id: u, ...nu };
          bestV = { id: v, ...nv };
        }
      }
    }
    console.log(`Gap between Bangalore reachable component and Salem component: ${minD.toFixed(2)} meters`);
    if (bestU) console.log(`Between ${bestU.id} (${bestU.lat}, ${bestU.lon}) and ${bestV.id} (${bestV.lat}, ${bestV.lon})`);
  }

  // Test 3: Delhi -> Gwalior
  console.log('\n--- TEST 3: DELHI -> GWALIOR ---');
  const dl = loadRel(5795969);
  const hr = loadRel(5794309);
  const up = loadRel(5803022);
  const rj = loadRel(5802963);
  const mp = loadRel(5802971);
  const allDlGwlNodes = new Map([...dl.nodes, ...hr.nodes, ...up.nodes, ...rj.nodes, ...mp.nodes]);
  const dlGwlWays = [...dl.ways, ...hr.ways, ...up.ways, ...rj.ways, ...mp.ways];
  const graphDlGwl = buildUndirectedGraph(dlGwlWays, allDlGwlNodes);

  // Delhi node: 1665802579
  // Gwalior node: 3842215977
  const reachableFromDelhi = getReachable(1665802579, graphDlGwl);
  console.log(`Delhi node 1665802579 can reach ${reachableFromDelhi.size} nodes.`);
  console.log(`Can reach Gwalior node 3842215977? ${reachableFromDelhi.has(3842215977)}`);

  if (!reachableFromDelhi.has(3842215977)) {
    let minD = Infinity;
    let bestU = null;
    let bestV = null;
    for (const u of reachableFromDelhi) {
      const nu = allDlGwlNodes.get(u);
      for (const [v, nv] of allDlGwlNodes.entries()) {
        if (reachableFromDelhi.has(v)) continue;
        if (Math.abs(nu.lat - nv.lat) > 0.05 || Math.abs(nu.lon - nv.lon) > 0.05) continue;
        const d = haversineMeters(nu.lat, nu.lon, nv.lat, nv.lon);
        if (d < minD) {
          minD = d;
          bestU = { id: u, ...nu };
          bestV = { id: v, ...nv };
        }
      }
    }
    console.log(`Gap between Delhi reachable component and Gwalior component: ${minD.toFixed(2)} meters`);
    if (bestU) console.log(`Between ${bestU.id} (${bestU.lat}, ${bestU.lon}) and ${bestV.id} (${bestV.lat}, ${bestV.lon})`);
  }
}

main();
