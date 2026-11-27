/**
 * scripts/gis/test_graph_connectivity.js
 * 
 * Builds a directed graph of all OSM ways in relation 11568320 and evaluates
 * pathfinding from Srinagar to Kanyakumari along the southbound carriageway.
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

function loadAllData() {
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
  const { allNodes, allWays } = loadAllData();
  console.log(`Loaded ${allNodes.size} nodes and ${allWays.size} ways.`);

  // Build node adjacency graph
  // For each directed edge: fromNode -> [{ toNode, wayId, distanceKm, isOnewayForward }]
  const adj = new Map(); // nodeId -> array of edges
  const reverseAdj = new Map(); // nodeId -> array of incoming edges
  const undirectedAdj = new Map(); // nodeId -> array of edges (bidirectional)

  function addEdge(map, u, v, wayId, distKm) {
    if (!map.has(u)) map.set(u, []);
    map.get(u).push({ to: v, wayId, distKm });
  }

  for (const [wayId, way] of allWays.entries()) {
    const nodes = way.nodes || [];
    if (nodes.length < 2) continue;

    const tags = way.tags || {};
    const oneway = tags.oneway;
    const isForwardOneway = oneway === 'yes';
    const isReverseOneway = oneway === '-1';
    const isBidirectional = !isForwardOneway && !isReverseOneway;

    for (let i = 0; i < nodes.length - 1; i++) {
      const u = nodes[i];
      const v = nodes[i + 1];
      const n1 = allNodes.get(u);
      const n2 = allNodes.get(v);
      if (!n1 || !n2) continue;
      const d = haversineDistanceKm(n1.lat, n1.lon, n2.lat, n2.lon);

      addEdge(undirectedAdj, u, v, wayId, d);
      addEdge(undirectedAdj, v, u, wayId, d);

      if (isForwardOneway || isBidirectional) {
        addEdge(adj, u, v, wayId, d);
        addEdge(reverseAdj, v, u, wayId, d);
      }
      if (isReverseOneway || isBidirectional) {
        addEdge(adj, v, u, wayId, d);
        addEdge(reverseAdj, u, v, wayId, d);
      }
    }
  }

  console.log(`Directed graph has ${adj.size} active source nodes.`);

  // Test origin & terminus nodes
  // Srinagar checkpoint: 34.0837, 74.7973
  // Matched way in 1B.1 was 633887287
  const srinagarWay = allWays.get(633887287);
  console.log('\nSrinagar way 633887287:', {
    tags: srinagarWay ? srinagarWay.tags : null,
    firstNode: srinagarWay ? srinagarWay.nodes[0] : null,
    lastNode: srinagarWay ? srinagarWay.nodes[srinagarWay.nodes.length - 1] : null
  });

  // Kanyakumari checkpoint: 8.0883, 77.5385
  // Matched way in 1B.1 was 157804920
  const kanyakumariWay = allWays.get(157804920);
  console.log('Kanyakumari way 157804920:', {
    tags: kanyakumariWay ? kanyakumariWay.tags : null,
    firstNode: kanyakumariWay ? kanyakumariWay.nodes[0] : null,
    lastNode: kanyakumariWay ? kanyakumariWay.nodes[kanyakumariWay.nodes.length - 1] : null
  });

  // Check northernmost node in JK relation (5794209)
  let northNode = null;
  let maxLat = -Infinity;
  let southNode = null;
  let minLat = Infinity;

  for (const [nodeId, n] of allNodes.entries()) {
    if (n.lat > maxLat) {
      maxLat = n.lat;
      northNode = nodeId;
    }
    if (n.lat < minLat) {
      minLat = n.lat;
      southNode = nodeId;
    }
  }

  console.log(`\nNorthernmost node in entire dataset: Node ${northNode} at ${maxLat.toFixed(4)}°N`);
  console.log(`Southernmost node in entire dataset: Node ${southNode} at ${minLat.toFixed(4)}°N`);

  // Connected components analysis in undirected graph
  const visited = new Set();
  const components = [];

  for (const startNode of undirectedAdj.keys()) {
    if (visited.has(startNode)) continue;
    const comp = [];
    const queue = [startNode];
    visited.add(startNode);

    while (queue.length > 0) {
      const curr = queue.pop();
      comp.push(curr);
      const neighbors = undirectedAdj.get(curr) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push(edge.to);
        }
      }
    }
    components.push(comp);
  }

  components.sort((a, b) => b.length - a.length);
  console.log(`\nTotal connected components in undirected graph: ${components.length}`);
  console.log(`Largest component has ${components[0].length} nodes (${((components[0].length / allNodes.size) * 100).toFixed(1)}% of all nodes)`);
  if (components.length > 1) {
    console.log(`Second largest component has ${components[1].length} nodes`);
    console.log(`Third largest component has ${components[2].length} nodes`);
  }

  const northInMain = components[0].includes(northNode);
  const southInMain = components[0].includes(southNode);
  console.log(`Northernmost node in main component? ${northInMain}`);
  console.log(`Southernmost node in main component? ${southInMain}`);
}

main();
