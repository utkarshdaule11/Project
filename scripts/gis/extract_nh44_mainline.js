/**
 * scripts/gis/extract_nh44_mainline.js
 * 
 * Phase 1B.2A — NH44 Direction-Aware Geometry Extraction Pipeline
 * 
 * Extracts continuous, direction-aware route geometry from Srinagar to Kanyakumari
 * based on OpenStreetMap Relation 11568320 and its 13 child relations.
 * 
 * Generates:
 * 1. data/nh44/nh44-route-candidate.geojson
 * 2. data/nh44/nh44-route-source-ways.json
 * 3. data/nh44/nh44-checkpoints-validation.json
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');
const OUT_DIR = path.join(__dirname, '..', '..', 'data', 'nh44');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Geodesic distance in kilometers (Haversine formula on WGS84 sphere)
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

function haversineMeters(lat1, lon1, lat2, lon2) {
  return haversineDistanceKm(lat1, lon1, lat2, lon2) * 1000;
}

// 14 Editorial Checkpoints from MoRTH Annexure II(d) corridor alignment
const CHECKPOINTS = [
  { id: 'srinagar', name: 'Srinagar', jurisdiction: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973 },
  { id: 'jalandhar', name: 'Jalandhar', jurisdiction: 'Punjab', lat: 31.3260, lng: 75.5762 },
  { id: 'ludhiana', name: 'Ludhiana', jurisdiction: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { id: 'ambala', name: 'Ambala', jurisdiction: 'Haryana', lat: 30.3782, lng: 76.7767 },
  { id: 'delhi', name: 'Delhi', jurisdiction: 'NCT of Delhi', lat: 28.6139, lng: 77.2090 },
  { id: 'gwalior', name: 'Gwalior', jurisdiction: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { id: 'jhansi', name: 'Jhansi', jurisdiction: 'Uttar Pradesh', lat: 25.4484, lng: 78.5685 },
  { id: 'nagpur', name: 'Nagpur', jurisdiction: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { id: 'hyderabad', name: 'Hyderabad', jurisdiction: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { id: 'bangalore', name: 'Bangalore', jurisdiction: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { id: 'salem', name: 'Salem', jurisdiction: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
  { id: 'namakkal', name: 'Namakkal', jurisdiction: 'Tamil Nadu', lat: 11.2189, lng: 78.1674 },
  { id: 'madurai', name: 'Madurai', jurisdiction: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { id: 'kanyakumari', name: 'Kanyakumari', jurisdiction: 'Tamil Nadu', lat: 8.0883, lng: 77.5385 },
];

// Documented structural gap omissions in OpenStreetMap relation data
const DOCUMENTED_GAPS = [
  {
    name: 'Banihal_Tunnel_portal_JK',
    description: 'Transition between historic alignment approach and Navyug Tunnel portal',
    u: 5459979257,
    v: 2389831547,
    latU: 33.6111429,
    lonU: 75.1486038,
    latV: 33.6099321,
    lonV: 75.1490820,
    distKm: 0.14173,
    distMeters: 141.73,
    jurisdiction: 'Jammu & Kashmir'
  },
  {
    name: 'Ramban_Chenab_omission_JK',
    description: 'Chenab Valley four-laning realignment gap where OSM relation omitted under-construction sector',
    u: 14093730923,
    v: 2477285466,
    latU: 33.1577771,
    lonU: 75.3080757,
    latV: 33.1515903,
    lonV: 75.3059317,
    distKm: 0.71631,
    distMeters: 716.31,
    jurisdiction: 'Jammu & Kashmir'
  },
  {
    name: 'Farah_Mathura_split_UP',
    description: 'Dual carriageway grade-separated culvert transition near Farah',
    u: 6297315853,
    v: 9003040356,
    latU: 27.2758870,
    lonU: 77.8037002,
    latV: 27.2733669,
    lonV: 77.8058258,
    distKm: 0.35023,
    distMeters: 350.23,
    jurisdiction: 'Uttar Pradesh'
  },
  {
    name: 'Agra_Bypass_Rohta_split_UP',
    description: 'Agra Inner Ring Road interchange ramp gap connecting back to NH44 mainline',
    u: 4389191166,
    v: 4235553521,
    latU: 27.0659797,
    lonU: 77.9707714,
    latV: 27.0663689,
    lonV: 77.9772272,
    distKm: 0.64070,
    distMeters: 640.70,
    jurisdiction: 'Uttar Pradesh'
  },
  {
    name: 'Electronic_City_toll_ramp_KA',
    description: 'Bangalore Electronic City elevated tollway interchange ramp junction',
    u: 11383273877,
    v: 9869643728,
    latU: 12.8408935,
    lonU: 77.6764023,
    latV: 12.8399814,
    lonV: 77.6770412,
    distKm: 0.12312,
    distMeters: 123.12,
    jurisdiction: 'Karnataka'
  }
];

function loadData() {
  console.log('Loading raw OpenStreetMap data...');
  const masterFile = path.join(RAW_DIR, 'relation_11568320.json');
  const master = JSON.parse(fs.readFileSync(masterFile, 'utf8')).elements[0];
  const childRels = master.members.filter(m => m.type === 'relation');

  const allNodes = new Map();
  const allWays = new Map();

  for (const child of childRels) {
    const file = path.join(RAW_DIR, `relation_${child.ref}_full.json`);
    if (!fs.existsSync(file)) {
      console.warn(`Warning: missing child relation file: ${file}`);
      continue;
    }
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

  console.log(`Loaded ${allNodes.size} unique nodes and ${allWays.size} unique ways.`);
  return { allNodes, allWays, masterRel: master };
}

function buildGraph(allNodes, allWays) {
  console.log('Constructing direction-aware topological corridor graph...');
  const graph = new Map();

  function addEdge(u, v, wayId, distKm, isForward, edgeType = 'osm_way') {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push({
      to: v,
      wayId,
      weight: isForward ? distKm : distKm * 2.0, // Discourage traveling counter to oneway traffic
      realDistKm: distKm,
      isForward,
      edgeType
    });
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
        addEdge(u, v, wayId, d, true, 'osm_way');
        addEdge(v, u, wayId, d, false, 'osm_way');
      } else if (oneway === '-1') {
        addEdge(v, u, wayId, d, true, 'osm_way');
        addEdge(u, v, wayId, d, false, 'osm_way');
      } else {
        // bidirectional
        addEdge(u, v, wayId, d, true, 'osm_way');
        addEdge(v, u, wayId, d, true, 'osm_way');
      }
    }
  }

  // Add documented structural gap edges
  for (const g of DOCUMENTED_GAPS) {
    addEdge(g.u, g.v, `GAP_${g.name}`, g.distKm, true, 'structural_gap');
    addEdge(g.v, g.u, `GAP_${g.name}`, g.distKm, true, 'structural_gap');
  }

  // Auto-bridge sub-25m endpoint splits (dual-carriageway median crossovers and ramp nodes)
  console.log('Indexing nodes for sub-25m split auto-bridging...');
  const bins = new Map();
  function getBinKey(lat, lon) {
    return `${Math.floor(lat * 50)},${Math.floor(lon * 50)}`; // ~2.2 km grid
  }

  for (const [nid, n] of allNodes.entries()) {
    const k = getBinKey(n.lat, n.lon);
    if (!bins.has(k)) bins.set(k, []);
    bins.get(k).push(nid);
  }

  let autoBridgeCount = 0;
  for (const [nid, edges] of graph.entries()) {
    // Only check endpoints/dead-ends (degree <= 2 half-edges)
    if (edges.length <= 2) {
      const nu = allNodes.get(nid);
      if (!nu) continue;
      const bLat = Math.floor(nu.lat * 50);
      const bLon = Math.floor(nu.lon * 50);

      for (let dLat = -1; dLat <= 1; dLat++) {
        for (let dLon = -1; dLon <= 1; dLon++) {
          const k = `${bLat + dLat},${bLon + dLon}`;
          const candidates = bins.get(k);
          if (!candidates) continue;

          for (const vid of candidates) {
            if (vid === nid) continue;
            const nv = allNodes.get(vid);
            if (Math.abs(nu.lat - nv.lat) > 0.00025 || Math.abs(nu.lon - nv.lon) > 0.00025) continue;
            const d = haversineDistanceKm(nu.lat, nu.lon, nv.lat, nv.lon);
            if (d < 0.025) { // < 25 meters
              addEdge(nid, vid, `BRIDGE_${(d * 1000).toFixed(0)}m`, d, true, 'auto_bridge');
              addEdge(vid, nid, `BRIDGE_${(d * 1000).toFixed(0)}m`, d, true, 'auto_bridge');
              autoBridgeCount++;
            }
          }
        }
      }
    }
  }
  console.log(`Added ${autoBridgeCount} sub-25m auto-bridge edges.`);

  return graph;
}

function matchCheckpointsToRoad(allNodes, allWays) {
  console.log('Matching 14 editorial checkpoints to nearest NH44 highway centerline nodes...');
  return CHECKPOINTS.map((cp, idx) => {
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

    const matchedNode = allNodes.get(bestNode);
    const wayObj = allWays.get(bestWayId);
    const offsetM = Math.round(bestDist * 1000);

    return {
      index: idx + 1,
      checkpointId: cp.id,
      name: cp.name,
      jurisdiction: cp.jurisdiction,
      cityCentroid: {
        latitude: cp.lat,
        longitude: cp.lng
      },
      matchedRoadPoint: {
        nodeId: bestNode,
        latitude: matchedNode.lat,
        longitude: matchedNode.lon
      },
      offsetMeters: offsetM,
      offsetKm: (bestDist).toFixed(2),
      matchedWayId: bestWayId,
      relationId: wayObj ? wayObj.relId : null,
      classification: offsetM < 100 ? 'terminal-anchor (<100m)' : (offsetM < 5000 ? 'corridor-bypass (1-5km)' : 'urban-outer-ring (>5km)'),
      calculationCRS: 'WGS84 Geodesic (EPSG:4326) / Metric Orthogonal Projection',
      calculationAlgorithm: 'Nearest Highway Node Distance with Great-Circle Haversine Transformation'
    };
  });
}

function dijkstraPath(startNode, endNode, graph) {
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
      const pathEdges = [];
      let step = endNode;
      while (prev.has(step)) {
        pathNodes.unshift(step);
        const p = prev.get(step);
        pathEdges.unshift({
          from: p.from,
          to: step,
          wayId: p.wayId,
          edgeType: p.edgeType,
          distKm: p.distKm
        });
        step = p.from;
      }
      pathNodes.unshift(startNode);
      return {
        weightedDistKm: dist.get(endNode),
        realDistKm: realDist.get(endNode),
        nodes: pathNodes,
        edges: pathEdges
      };
    }

    if (visited.has(u)) continue;
    visited.add(u);

    const edges = graph.get(u) || [];
    for (const edge of edges) {
      const v = edge.to;
      if (visited.has(v)) continue;
      const newDist = curr.d + edge.weight;
      if (!dist.has(v) || newDist < dist.get(v)) {
        dist.set(v, newDist);
        realDist.set(v, (realDist.get(u) || 0) + edge.realDistKm);
        prev.set(v, {
          from: u,
          wayId: edge.wayId,
          edgeType: edge.edgeType,
          distKm: edge.realDistKm
        });
        pq.push({ node: v, d: newDist });
      }
    }
  }
  return null;
}

function main() {
  console.log('=== PHASE 1B.2A: DIRECTION-AWARE NH44 GEOMETRY EXTRACTION ===\n');

  const { allNodes, allWays } = loadData();
  const graph = buildGraph(allNodes, allWays);
  const cpMatches = matchCheckpointsToRoad(allNodes, allWays);

  console.log('\n--- CHECKPOINT ALIGNMENT SUMMARY ---');
  cpMatches.forEach(c => {
    console.log(`${c.index.toString().padStart(2, ' ')}. ${c.name.padEnd(12, ' ')} -> Way ${c.matchedWayId.toString().padEnd(11, ' ')} Node ${c.matchedRoadPoint.nodeId.toString().padEnd(11, ' ')} | Offset: ${c.offsetKm.padStart(6, ' ')} km (${c.classification})`);
  });

  console.log('\n--- TRACING 13 HIGHWAY CORRIDOR LEGS ---');
  const legResults = [];
  let cumulativeKm = 0;
  const completeEdges = [];

  for (let i = 0; i < cpMatches.length - 1; i++) {
    const c1 = cpMatches[i];
    const c2 = cpMatches[i + 1];
    process.stdout.write(`Leg ${(i + 1).toString().padStart(2, ' ')}/13: ${c1.name.padEnd(12, ' ')} -> ${c2.name.padEnd(12, ' ')} ... `);

    const res = dijkstraPath(c1.matchedRoadPoint.nodeId, c2.matchedRoadPoint.nodeId, graph);
    if (!res) {
      console.error('FAILED! Graph disconnected.');
      process.exit(1);
    }

    cumulativeKm += res.realDistKm;
    console.log(`SUCCESS! Length: ${res.realDistKm.toFixed(1).padStart(6, ' ')} km | Nodes: ${res.nodes.length.toString().padStart(5, ' ')}`);

    legResults.push({
      legNumber: i + 1,
      from: c1.name,
      to: c2.name,
      fromNode: c1.matchedRoadPoint.nodeId,
      toNode: c2.matchedRoadPoint.nodeId,
      lengthKm: Number(res.realDistKm.toFixed(3)),
      cumulativeKm: Number(cumulativeKm.toFixed(3)),
      nodeCount: res.nodes.length,
      edgeCount: res.edges.length
    });

    // Append edges (avoid duplicating nodes at leg junctions)
    completeEdges.push(...res.edges);
  }

  console.log(`\n========================================`);
  console.log(`TOTAL PHYSICAL CENTERLINE DISTANCE: ${cumulativeKm.toFixed(2)} KM`);
  console.log(`TOTAL CORRIDOR EDGES: ${completeEdges.length}`);
  console.log(`========================================\n`);

  // Build continuous coordinates list
  // Identify where documented structural gaps occur to partition into discrete LineString sections for MultiLineString
  const sections = [];
  let currentSectionCoords = [];
  const usedWayIds = new Set();

  for (let i = 0; i < completeEdges.length; i++) {
    const edge = completeEdges[i];
    const uNode = allNodes.get(edge.from);
    const vNode = allNodes.get(edge.to);

    if (typeof edge.wayId === 'number') {
      usedWayIds.add(edge.wayId);
    }

    if (edge.edgeType === 'structural_gap') {
      // End current section before the gap
      if (currentSectionCoords.length > 0) {
        sections.push(currentSectionCoords);
        currentSectionCoords = [];
      }
      // Start new section after the gap
      currentSectionCoords.push([vNode.lon, vNode.lat]);
    } else {
      if (currentSectionCoords.length === 0) {
        currentSectionCoords.push([uNode.lon, uNode.lat]);
      }
      currentSectionCoords.push([vNode.lon, vNode.lat]);
    }
  }

  if (currentSectionCoords.length > 0) {
    sections.push(currentSectionCoords);
  }

  console.log(`Partitioned route into ${sections.length} continuous LineString sections bounded by ${DOCUMENTED_GAPS.length} structural gaps.`);

  // Also build single continuous composite coordinates list for ease of downstream rendering
  const compositeCoords = [];
  for (let i = 0; i < completeEdges.length; i++) {
    const edge = completeEdges[i];
    const uNode = allNodes.get(edge.from);
    const vNode = allNodes.get(edge.to);
    if (compositeCoords.length === 0) {
      compositeCoords.push([uNode.lon, uNode.lat]);
    }
    compositeCoords.push([vNode.lon, vNode.lat]);
  }

  // 1. Output GeoJSON Candidate
  const geojsonCandidate = {
    type: 'FeatureCollection',
    name: 'NH44_Grand_Bharat_Highway_Candidate_Geometry',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    metadata: {
      extractionDate: new Date().toISOString(),
      sourceOsmRelation: 11568320,
      sourceOsmRelationName: 'National Highway 44 (India)',
      officialCorridorLengthKm: 3810,
      officialCorridorSource: 'MoRTH Annexure II(d)',
      extractedPhysicalCenterlineKm: Number(cumulativeKm.toFixed(2)),
      coordinateSystem: 'EPSG:4326 (WGS84)',
      coordinateOrder: '[longitude, latitude]',
      totalVertices: compositeCoords.length,
      uniqueSourceWaysCount: usedWayIds.size,
      totalStructuralGapsCount: DOCUMENTED_GAPS.length,
      totalSectionsCount: sections.length,
      origin: {
        name: 'Srinagar, Jammu & Kashmir',
        nodeId: cpMatches[0].matchedRoadPoint.nodeId,
        coordinates: [compositeCoords[0][0], compositeCoords[0][1]]
      },
      terminus: {
        name: 'Kanyakumari, Tamil Nadu',
        nodeId: cpMatches[cpMatches.length - 1].matchedRoadPoint.nodeId,
        coordinates: [compositeCoords[compositeCoords.length - 1][0], compositeCoords[compositeCoords.length - 1][1]]
      }
    },
    features: [
      {
        type: 'Feature',
        id: 'nh44-mainline-multilinestring',
        properties: {
          corridor: 'NH44',
          name: 'The Grand Bharat Highway (Mainline Corridor)',
          geometryType: 'MultiLineString',
          description: 'Direction-aware continuous NH44 southbound mainline partitioned at verified structural gaps',
          totalLengthKm: Number(cumulativeKm.toFixed(2)),
          sectionCount: sections.length,
          structuralGaps: DOCUMENTED_GAPS
        },
        geometry: {
          type: 'MultiLineString',
          coordinates: sections
        }
      },
      {
        type: 'Feature',
        id: 'nh44-mainline-continuous-composite',
        properties: {
          corridor: 'NH44',
          name: 'The Grand Bharat Highway (Composite LineString)',
          geometryType: 'LineString',
          description: 'Single continuous composite LineString bridging documented gaps for continuous spatial interpolation',
          totalLengthKm: Number(cumulativeKm.toFixed(2)),
          vertexCount: compositeCoords.length
        },
        geometry: {
          type: 'LineString',
          coordinates: compositeCoords
        }
      }
    ]
  };

  const geojsonPath = path.join(OUT_DIR, 'nh44-route-candidate.geojson');
  fs.writeFileSync(geojsonPath, JSON.stringify(geojsonCandidate, null, 2), 'utf8');
  console.log(`Saved GeoJSON candidate: ${geojsonPath} (${(fs.statSync(geojsonPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // 2. Output Source Ways JSON
  const sourceWaysInventory = {
    metadata: {
      generatedAt: new Date().toISOString(),
      masterRelationId: 11568320,
      totalSourceWaysInExtractedPath: usedWayIds.size,
      totalPhysicalCenterlineKm: Number(cumulativeKm.toFixed(2))
    },
    ways: Array.from(usedWayIds).map(wayId => {
      const w = allWays.get(wayId);
      const tags = w ? (w.tags || {}) : {};
      return {
        wayId,
        relationId: w ? w.relId : null,
        highway: tags.highway || null,
        name: tags.name || null,
        ref: tags.ref || null,
        oneway: tags.oneway || 'no',
        lanes: tags.lanes || null,
        maxspeed: tags.maxspeed || null,
        surface: tags.surface || null,
        nodeCount: w ? (w.nodes || []).length : 0
      };
    })
  };

  const sourceWaysPath = path.join(OUT_DIR, 'nh44-route-source-ways.json');
  fs.writeFileSync(sourceWaysPath, JSON.stringify(sourceWaysInventory, null, 2), 'utf8');
  console.log(`Saved source ways inventory: ${sourceWaysPath} (${sourceWaysInventory.ways.length} ways)`);

  // 3. Output Checkpoints Validation JSON
  let cumulativeDist = 0;
  const validationResults = cpMatches.map((cp, idx) => {
    if (idx > 0) {
      cumulativeDist += legResults[idx - 1].lengthKm;
    }
    return {
      ...cp,
      cumulativeHighwayKm: Number(cumulativeDist.toFixed(2))
    };
  });

  const checkpointValidationOutput = {
    validationDate: new Date().toISOString(),
    crs: 'WGS84 Geodesic (EPSG:4326) / Metric Orthogonal Projection',
    totalCheckpoints: validationResults.length,
    officialCorridorBenchmarkKm: 3810,
    extractedPhysicalHighwayKm: Number(cumulativeKm.toFixed(2)),
    results: validationResults,
    legs: legResults,
    documentedGaps: DOCUMENTED_GAPS
  };

  const cpPath = path.join(OUT_DIR, 'nh44-checkpoints-validation.json');
  fs.writeFileSync(cpPath, JSON.stringify(checkpointValidationOutput, null, 2), 'utf8');
  console.log(`Saved checkpoints validation: ${cpPath}`);

  console.log('\n=== EXTRACTION PIPELINE COMPLETED SUCCESSFULLY ===');
}

main();
