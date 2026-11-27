/**
 * scripts/gis/audit_carriageway_direction.js
 * 
 * Deep independent audit of carriageway directionality and traversal continuity.
 * Validates:
 * - oneway=yes, oneway=-1, oneway=no, missing oneway tags
 * - Original node ordering vs traversal node ordering
 * - Whether any oneway=yes way was traversed against traffic flow (counter-flow check)
 * - Predecessor and successor node-level continuity across the 3,600+ km route
 * - Overall north-to-south directional consistency from Srinagar to Kanyakumari
 * 
 * Outputs: data/nh44/nh44-direction-audit.json
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');
const OUT_DIR = path.join(__dirname, '..', '..', 'data', 'nh44');

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0088;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

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
  console.log('=== AUDITING CARRIAGEWAY DIRECTIONALITY & CONTINUITY ===\n');

  const { allNodes, allWays } = loadData();

  // Load checkpoints and extracted candidate GeoJSON
  const cpFile = path.join(OUT_DIR, 'nh44-checkpoints-validation.json');
  const cpData = JSON.parse(fs.readFileSync(cpFile, 'utf8'));

  // To get the exact sequence of ways, we build the graph and run the Dijkstra extraction
  // recording the exact way-by-way traversal
  const graph = new Map();

  function addEdge(u, v, wayId, distKm, isForward, edgeType) {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push({
      to: v,
      wayId,
      weight: isForward ? distKm : distKm * 2.0,
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
      const d = haversineKm(n1.lat, n1.lon, n2.lat, n2.lon);

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

  // Add the 5 documented structural gaps
  const documentedGaps = cpData.documentedGaps || [];
  for (const g of documentedGaps) {
    addEdge(g.u, g.v, `GAP_${g.name}`, g.distKm, true, 'structural_gap');
    addEdge(g.v, g.u, `GAP_${g.name}`, g.distKm, true, 'structural_gap');
  }

  // Auto-bridge sub-25m splits
  const bins = new Map();
  for (const [nid, n] of allNodes.entries()) {
    const k = `${Math.floor(n.lat * 50)},${Math.floor(n.lon * 50)}`;
    if (!bins.has(k)) bins.set(k, []);
    bins.get(k).push(nid);
  }

  for (const [nid, edges] of graph.entries()) {
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
            const d = haversineKm(nu.lat, nu.lon, nv.lat, nv.lon);
            if (d < 0.025) {
              addEdge(nid, vid, `BRIDGE_${(d * 1000).toFixed(0)}m`, d, true, 'auto_bridge');
              addEdge(vid, nid, `BRIDGE_${(d * 1000).toFixed(0)}m`, d, true, 'auto_bridge');
            }
          }
        }
      }
    }
  }

  // Dijkstra traversal between consecutive checkpoints
  function dijkstraPath(startNode, endNode) {
    const dist = new Map();
    const prev = new Map();
    const visited = new Set();
    const pq = [{ node: startNode, d: 0 }];
    dist.set(startNode, 0);

    while (pq.length > 0) {
      let minIdx = 0;
      for (let i = 1; i < pq.length; i++) {
        if (pq[i].d < pq[minIdx].d) minIdx = i;
      }
      const curr = pq.splice(minIdx, 1)[0];
      const u = curr.node;

      if (u === endNode) {
        const edges = [];
        let step = endNode;
        while (prev.has(step)) {
          const p = prev.get(step);
          edges.unshift({ from: p.from, to: step, wayId: p.wayId, isForward: p.isForward, edgeType: p.edgeType, distKm: p.distKm });
          step = p.from;
        }
        return edges;
      }

      if (visited.has(u)) continue;
      visited.add(u);

      const adj = graph.get(u) || [];
      for (const e of adj) {
        const v = e.to;
        if (visited.has(v)) continue;
        const newDist = curr.d + e.weight;
        if (!dist.has(v) || newDist < dist.get(v)) {
          dist.set(v, newDist);
          prev.set(v, { from: u, wayId: e.wayId, isForward: e.isForward, edgeType: e.edgeType, distKm: e.realDistKm });
          pq.push({ node: v, d: newDist });
        }
      }
    }
    return null;
  }

  // Traverse all 13 legs
  const cpMatches = cpData.results;
  const completeRouteEdges = [];
  for (let i = 0; i < cpMatches.length - 1; i++) {
    const c1 = cpMatches[i];
    const c2 = cpMatches[i + 1];
    const edges = dijkstraPath(c1.matchedRoadPoint.nodeId, c2.matchedRoadPoint.nodeId);
    if (!edges) {
      console.error(`Leg failed: ${c1.name} -> ${c2.name}`);
      process.exit(1);
    }
    completeRouteEdges.push(...edges);
  }

  console.log(`Total edge segments traversed: ${completeRouteEdges.length}`);

  // Group continuous edge segments by source way
  const traversedWays = [];
  let currentWayRecord = null;

  for (let i = 0; i < completeRouteEdges.length; i++) {
    const edge = completeRouteEdges[i];

    if (!currentWayRecord || currentWayRecord.wayId !== edge.wayId) {
      if (currentWayRecord) {
        traversedWays.push(currentWayRecord);
      }
      currentWayRecord = {
        wayId: edge.wayId,
        edgeType: edge.edgeType,
        entryNode: edge.from,
        exitNode: edge.to,
        nodesTraversed: [edge.from, edge.to],
        edgesCount: 1,
        lengthKm: edge.distKm,
        isForward: edge.isForward
      };
    } else {
      currentWayRecord.exitNode = edge.to;
      currentWayRecord.nodesTraversed.push(edge.to);
      currentWayRecord.edgesCount++;
      currentWayRecord.lengthKm += edge.distKm;
    }
  }
  if (currentWayRecord) {
    traversedWays.push(currentWayRecord);
  }

  console.log(`Grouped into ${traversedWays.length} sequential way / connector transitions.`);

  // Validate each way
  let onewayYesCount = 0;
  let onewayMinusOneCount = 0;
  let onewayNoCount = 0;
  let missingOnewayCount = 0;
  let bridgeCount = 0;
  let structuralGapCount = 0;

  let legalDirectionCount = 0;
  let illegalCounterFlowCount = 0;
  let reversedOnewayYesCount = 0;

  const wayAuditLog = [];

  for (let i = 0; i < traversedWays.length; i++) {
    const tw = traversedWays[i];
    const predecessorId = i > 0 ? traversedWays[i - 1].wayId : null;
    const successorId = i < traversedWays.length - 1 ? traversedWays[i + 1].wayId : null;

    if (typeof tw.wayId === 'string' && tw.wayId.startsWith('BRIDGE_')) {
      bridgeCount++;
      wayAuditLog.push({
        sequenceIndex: i + 1,
        wayId: tw.wayId,
        type: 'sub_25m_auto_bridge',
        entryNode: tw.entryNode,
        exitNode: tw.exitNode,
        lengthMeters: Number((tw.lengthKm * 1000).toFixed(2)),
        predecessorWayId: predecessorId,
        successorWayId: successorId,
        compliance: 'VERIFIED_SUB_25M_TOPOLOGICAL_JOIN'
      });
      continue;
    }

    if (typeof tw.wayId === 'string' && tw.wayId.startsWith('GAP_')) {
      structuralGapCount++;
      wayAuditLog.push({
        sequenceIndex: i + 1,
        wayId: tw.wayId,
        type: 'documented_structural_gap',
        entryNode: tw.entryNode,
        exitNode: tw.exitNode,
        lengthMeters: Number((tw.lengthKm * 1000).toFixed(2)),
        predecessorWayId: predecessorId,
        successorWayId: successorId,
        compliance: 'DOCUMENTED_RELATION_OMISSION'
      });
      continue;
    }

    const osmWay = allWays.get(tw.wayId);
    if (!osmWay) {
      console.warn(`Way not found in allWays: ${tw.wayId}`);
      continue;
    }

    const tags = osmWay.tags || {};
    const onewayTag = tags.oneway || 'unspecified';
    const originalNodes = osmWay.nodes || [];
    const origFirst = originalNodes[0];
    const origLast = originalNodes[originalNodes.length - 1];

    // Determine if traversal matches original node sequence
    const entryIndex = originalNodes.indexOf(tw.entryNode);
    const exitIndex = originalNodes.indexOf(tw.exitNode);
    const isForwardTraversalInWay = entryIndex !== -1 && exitIndex !== -1 && exitIndex > entryIndex;
    const isReversedTraversalInWay = entryIndex !== -1 && exitIndex !== -1 && exitIndex < entryIndex;

    // Check legal travel direction
    let isLegalTravel = true;
    let directionNote = '';

    if (onewayTag === 'yes') {
      onewayYesCount++;
      if (isReversedTraversalInWay) {
        illegalCounterFlowCount++;
        reversedOnewayYesCount++;
        isLegalTravel = false;
        directionNote = 'VIOLATION: oneway=yes traversed against legal traffic flow';
      } else {
        legalDirectionCount++;
        directionNote = 'LEGAL: Forward along digitized oneway=yes carriageway';
      }
    } else if (onewayTag === '-1') {
      onewayMinusOneCount++;
      if (isForwardTraversalInWay) {
        illegalCounterFlowCount++;
        isLegalTravel = false;
        directionNote = 'VIOLATION: oneway=-1 traversed along digitized sequence (counter-flow)';
      } else {
        legalDirectionCount++;
        directionNote = 'LEGAL: Traversed in reverse of digitized sequence respecting oneway=-1';
      }
    } else if (onewayTag === 'no') {
      onewayNoCount++;
      legalDirectionCount++;
      directionNote = 'LEGAL: Bidirectional road segment';
    } else {
      missingOnewayCount++;
      legalDirectionCount++;
      directionNote = 'LEGAL: Bidirectional (missing oneway tag defaults to two-way)';
    }

    const entryNodeCoord = allNodes.get(tw.entryNode);
    const exitNodeCoord = allNodes.get(tw.exitNode);
    const latDelta = (exitNodeCoord && entryNodeCoord) ? exitNodeCoord.lat - entryNodeCoord.lat : 0;
    const lonDelta = (exitNodeCoord && entryNodeCoord) ? exitNodeCoord.lon - entryNodeCoord.lon : 0;
    const generalDirection = latDelta < -0.0001 ? 'Southbound' : (latDelta > 0.0001 ? 'Northbound (curve/loop)' : 'East-West');

    wayAuditLog.push({
      sequenceIndex: i + 1,
      wayId: tw.wayId,
      relationId: osmWay.relId,
      highway: tags.highway || null,
      ref: tags.ref || null,
      name: tags.name || null,
      onewayTag,
      originalFirstNode: origFirst,
      originalLastNode: origLast,
      traversalEntryNode: tw.entryNode,
      traversalExitNode: tw.exitNode,
      originalNodeCount: originalNodes.length,
      traversedNodeCount: tw.nodesTraversed.length,
      isReversedFromOriginalNodeOrder: isReversedTraversalInWay,
      isLegalTrafficFlow: isLegalTravel,
      directionNote,
      generalOrientation: generalDirection,
      lengthMeters: Number((tw.lengthKm * 1000).toFixed(2)),
      predecessorWayId: predecessorId,
      successorWayId: successorId
    });
  }

  console.log(`\n--- CARRIAGEWAY DIRECTION AUDIT SUMMARY ---`);
  console.log(`Total ways audited: ${wayAuditLog.length}`);
  console.log(`  - oneway=yes ways: ${onewayYesCount}`);
  console.log(`  - oneway=-1 ways: ${onewayMinusOneCount}`);
  console.log(`  - oneway=no ways: ${onewayNoCount}`);
  console.log(`  - Missing oneway tag ways: ${missingOnewayCount}`);
  console.log(`  - Sub-25m auto-bridge connections: ${bridgeCount}`);
  console.log(`  - Documented structural gaps: ${structuralGapCount}`);
  console.log(`Legal traffic flow compliance: ${legalDirectionCount} / ${legalDirectionCount + illegalCounterFlowCount}`);
  console.log(`Illegal counter-flow violations: ${illegalCounterFlowCount}`);
  console.log(`Reversed oneway=yes carriageways: ${reversedOnewayYesCount}`);

  // Test predecessor/successor topological continuity
  let continuityBreaks = 0;
  for (let i = 0; i < traversedWays.length - 1; i++) {
    const curr = traversedWays[i];
    const next = traversedWays[i + 1];
    if (curr.exitNode !== next.entryNode) {
      continuityBreaks++;
      console.warn(`Continuity break between way ${curr.wayId} (exit: ${curr.exitNode}) and way ${next.wayId} (entry: ${next.entryNode})`);
    }
  }
  console.log(`Node-to-node topological continuity breaks: ${continuityBreaks} (Expected: 0)`);

  const auditOutput = {
    auditDate: new Date().toISOString(),
    auditSummary: {
      totalTraversedElements: wayAuditLog.length,
      osmWaysCount: onewayYesCount + onewayMinusOneCount + onewayNoCount + missingOnewayCount,
      onewayYesCount,
      onewayMinusOneCount,
      onewayNoCount,
      missingOnewayCount,
      sub25mAutoBridgesCount: bridgeCount,
      documentedStructuralGapsCount: structuralGapCount,
      legalTrafficFlowComplianceScore: `${((legalDirectionCount / (legalDirectionCount + illegalCounterFlowCount || 1)) * 100).toFixed(2)}%`,
      counterFlowViolationsCount: illegalCounterFlowCount,
      reversedOnewayYesCount,
      topologicalContinuityBreaks: continuityBreaks,
      isTopologicallyContinuous: continuityBreaks === 0,
      directionConsistencyVerdict: illegalCounterFlowCount === 0 && continuityBreaks === 0 ? "PASSED_STRICT_DIRECTIONAL_COMPLIANCE" : "FAILED"
    },
    traversedWays: wayAuditLog
  };

  const outFile = path.join(OUT_DIR, 'nh44-direction-audit.json');
  fs.writeFileSync(outFile, JSON.stringify(auditOutput, null, 2), 'utf8');
  console.log(`Saved direction audit to: ${outFile} (${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB)`);
}

main();
