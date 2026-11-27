/**
 * scripts/gis/test_dijkstra_route.js
 * 
 * Tests directed graph pathfinding between consecutive checkpoint pairs
 * on the OSM NH44 candidate network.
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

  // Build directed graph
  // Map: u -> [{ v, wayId, distKm }]
  const adj = new Map();
  const undirectedAdj = new Map();

  function addEdge(graph, u, v, wayId, dist) {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push({ to: v, wayId, dist });
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

      addEdge(undirectedAdj, u, v, wayId, d);
      addEdge(undirectedAdj, v, u, wayId, d);

      if (oneway === 'yes') {
        addEdge(adj, u, v, wayId, d);
      } else if (oneway === '-1') {
        addEdge(adj, v, u, wayId, d);
      } else {
        // oneway=no or missing: bidirectional
        addEdge(adj, u, v, wayId, d);
        addEdge(adj, v, u, wayId, d);
      }
    }
  }

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

  console.log('--- CHECKPOINT HIGHWAY NODES ---');
  cpNodes.forEach(c => console.log(`${c.name}: Node ${c.bestNode} (offset ${c.bestDist.toFixed(2)} km, way ${c.bestWayId})`));

  // Simple Dijkstra between source and target
  function findShortestPath(startNode, endNode, graph) {
    const dist = new Map();
    const prev = new Map();
    const visited = new Set();
    const pq = [{ node: startNode, d: 0 }];
    dist.set(startNode, 0);

    // Min priority queue using binary heap or simple insertion
    while (pq.length > 0) {
      // Find min d
      let minIdx = 0;
      for (let i = 1; i < pq.length; i++) {
        if (pq[i].d < pq[minIdx].d) minIdx = i;
      }
      const curr = pq.splice(minIdx, 1)[0];
      const u = curr.node;

      if (u === endNode) {
        // Reconstruct path
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
        return { distanceKm: dist.get(endNode), nodes: pathNodes, ways: pathWays };
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
          prev.set(v, { from: u, wayId: edge.wayId });
          pq.push({ node: v, d: newDist });
        }
      }
    }
    return null;
  }

  console.log('\n--- TESTING DIJKSTRA BETWEEN CONSECUTIVE CHECKPOINTS ---');
  for (let i = 0; i < cpNodes.length - 1; i++) {
    const c1 = cpNodes[i];
    const c2 = cpNodes[i + 1];
    process.stdout.write(`Path ${c1.name} -> ${c2.name}: `);

    // Try directed first
    let res = findShortestPath(c1.bestNode, c2.bestNode, adj);
    let mode = 'DIRECTED';
    if (!res) {
      // Try undirected
      res = findShortestPath(c1.bestNode, c2.bestNode, undirectedAdj);
      mode = 'UNDIRECTED';
    }

    if (res) {
      console.log(`FOUND (${mode})! Distance: ${res.distanceKm.toFixed(1)} km, Nodes: ${res.nodes.length}, Ways: ${new Set(res.ways).size}`);
    } else {
      console.log(`FAILED! No path found even undirected.`);
    }
  }
}

main();
