/**
 * scripts/gis/test_bridged_dijkstra.js
 * 
 * Tests topological route tracing connecting all 14 checkpoints in sequence
 * using directed graph edges and explicit gap detection for documented gaps.
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0088;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

function loadData() {
  const masterFile = path.join(RAW_DIR, 'relation_11568320.json');
  const master = JSON.parse(fs.readFileSync(masterFile, 'utf8')).elements[0];
  const childRels = master.members.filter(m => m.type === 'relation');

  const allNodes = new Map();
  const allWays = new Map();

  for (const child of childRels) {
    const file = path.join(RAW_DIR, `relation_${child.ref}_full.json`);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    data.elements.filter(e => e.type === 'node').forEach(n => {
      allNodes.set(n.id, { lat: n.lat, lon: n.lon });
    });

    data.elements.filter(e => e.type === 'way').forEach(w => {
      if (!allWays.has(w.id)) {
        allWays.set(w.id, { ...w, relId: child.ref });
      }
    });
  }

  return { allNodes, allWays };
}

function main() {
  const { allNodes, allWays } = loadData();
  console.log(`Loaded ${allNodes.size} nodes and ${allWays.size} ways.`);

  // Build graph allowing both directed travel and cross-carriageway median links
  // In dual-carriageways, traffic moves oneway, but crossovers exist at interchanges.
  // To allow building an unbroken continuous path, we add forward directed edges with cost = dist,
  // and reverse edges with penalty cost = dist * 2.5 (to strongly prefer forward southbound travel
  // while allowing bridging across dual-carriageway crossover points when needed).
  const graph = new Map();

  function addEdge(graph, u, v, wayId, dist, isForward) {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push({ to: v, wayId, dist: isForward ? dist : dist * 2.5, realDist: dist, isForward });
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
      const d = haversineDistanceKm(n1.lat, n1.lon, n2.lat, n2.lon);

      if (oneway === 'yes') {
        addEdge(graph, u, v, wayId, d, true);
        addEdge(graph, v, u, wayId, d, false);
      } else if (oneway === '-1') {
        addEdge(graph, v, u, wayId, d, true);
        addEdge(graph, u, v, wayId, d, false);
      } else {
        // bidirectional
        addEdge(graph, u, v, wayId, d, true);
        addEdge(graph, v, u, wayId, d, true);
      }
    }
  }

  // Also bridge small gaps between nearby dead-end nodes (< 800m)
  // Find dead ends (nodes with out-degree or in-degree where no forward continuation exists)
  console.log('Finding candidate gap bridges (< 800m)...');
  const allNodeEntries = Array.from(allNodes.entries());

  // Explicit gap bridges for measured gaps
  const explicitGaps = [
    { u: 2477285501, v: 2477285466, dist: 0.65968, reason: 'Ramban_JK_structural_omission' },
    { u: 568370366, v: 568370327, dist: 0.00695, reason: 'Delhi_HR_median_split' },
    { u: 12399522952, v: 2242560568, dist: 0.01885, reason: 'Nagpur_TG_median_split' },
    { u: 3722801185, v: 1769550152, dist: 0.00831, reason: 'Bangalore_KA_median_split' },
  ];

  explicitGaps.forEach(g => {
    if (g.u !== g.v) {
      addEdge(graph, g.u, g.v, `GAP_${g.reason}`, g.dist, true);
      addEdge(graph, g.v, g.u, `GAP_${g.reason}`, g.dist, true);
    }
  });

  // Find nearest highway node for each checkpoint
  const cpNodes = CHECKPOINTS.map(cp => {
    let bestDist = Infinity;
    let bestNode = null;
    let bestWayId = null;

    for (const [wayId, way] of allWays.entries()) {
      for (const nId of (way.nodes || [])) {
        const n = allNodes.get(nId);
        if (!n) continue;
        const d = haversineDistanceKm(cp.lat, cp.lng, n.lat, n.lon);
        if (d < bestDist) {
          bestDist = d;
          bestNode = nId;
          bestWayId = wayId;
        }
      }
    }
    return { ...cp, bestNode, bestDist, bestWayId };
  });

  console.log('\n--- CHECKPOINT HIGHWAY NODES ---');
  cpNodes.forEach(c => console.log(`${c.name}: Node ${c.bestNode} (offset ${c.bestDist.toFixed(2)} km, way ${c.bestWayId})`));

  // Dijkstra between consecutive checkpoints
  function findPath(startNode, endNode) {
    const dist = new Map();
    const realDist = new Map();
    const prev = new Map();
    const visited = new Set();
    const pq = [{ node: startNode, d: 0 }];
    dist.set(startNode, 0);
    realDist.set(startNode, 0);

    while (pq.length > 0) {
      let minIdx = 0;
      for (let i = 1; i < pq.length; i++) {
        if (pq[i].d < pq[minIdx].d) minIdx = i;
      }
      const curr = pq.splice(minIdx, 1)[0];
      const u = curr.node;

      if (u === endNode) {
        const pathNodes = [];
        const pathWays = [];
        let step = endNode;
        while (prev.has(step)) {
          pathNodes.unshift(step);
          const p = prev.get(step);
          pathWays.unshift(p.wayId);
          step = p.from;
        }
        pathNodes.unshift(startNode);
        return {
          weightedDistKm: dist.get(endNode),
          realDistKm: realDist.get(endNode),
          nodes: pathNodes,
          ways: pathWays
        };
      }

      if (visited.has(u)) continue;
      visited.add(u);

      const edges = graph.get(u) || [];
      for (const edge of edges) {
        const v = edge.to;
        if (visited.has(v)) continue;
        const newDist = curr.d + edge.dist;
        if (!dist.has(v) || newDist < dist.get(v)) {
          dist.set(v, newDist);
          realDist.set(v, (realDist.get(u) || 0) + edge.realDist);
          prev.set(v, { from: u, wayId: edge.wayId });
          pq.push({ node: v, d: newDist });
        }
      }
    }
    return null;
  }

  console.log('\n--- ROUTING CONSECUTIVE CHECKPOINTS ---');
  let cumulativeRealKm = 0;
  const fullPathSegments = [];

  for (let i = 0; i < cpNodes.length - 1; i++) {
    const c1 = cpNodes[i];
    const c2 = cpNodes[i + 1];
    process.stdout.write(`Leg ${i + 1}/13: ${c1.name} -> ${c2.name}... `);

    const res = findPath(c1.bestNode, c2.bestNode);
    if (res) {
      cumulativeRealKm += res.realDistKm;
      console.log(`SUCCESS! Real Dist: ${res.realDistKm.toFixed(1)} km, Nodes: ${res.nodes.length}, Unique Ways: ${new Set(res.ways).size}`);
      fullPathSegments.push(res);
    } else {
      console.log(`FAILED! No path found.`);
    }
  }

  console.log(`\nTotal Cumulative Highway Centerline Distance: ${cumulativeRealKm.toFixed(1)} KM`);
  console.log(`Successful legs: ${fullPathSegments.length} of 13`);
}

main();
