/**
 * scripts/gis/audit_raw_lengths.js
 * 
 * Inspects all raw OSM member ways across relation 11568320 and its 13 child relations
 * to explain exact way composition, duplicate memberships, dual-carriageway vs single-carriageway,
 * and reconcile the 7,236.1 km raw length vs 3,635.2 km OSM length vs 3,810 km MoRTH listed length.
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

function main() {
  const masterFile = path.join(RAW_DIR, 'relation_11568320.json');
  const master = JSON.parse(fs.readFileSync(masterFile, 'utf8')).elements[0];
  const childRels = master.members.filter(m => m.type === 'relation');

  const allNodes = new Map();
  const rawWayOccurrences = []; // each time a way appears in a child relation
  const uniqueWayMap = new Map(); // wayId -> way object with deduplicated relation membership

  for (const child of childRels) {
    const file = path.join(RAW_DIR, `relation_${child.ref}_full.json`);
    if (!fs.existsSync(file)) {
      console.warn(`File missing: ${file}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const nodes = data.elements.filter(e => e.type === 'node');
    const ways = data.elements.filter(e => e.type === 'way');

    nodes.forEach(n => allNodes.set(n.id, { lat: n.lat, lon: n.lon }));

    ways.forEach(w => {
      rawWayOccurrences.push({ ...w, childRelId: child.ref });
      if (!uniqueWayMap.has(w.id)) {
        uniqueWayMap.set(w.id, {
          ...w,
          relations: [child.ref],
          lengthKm: 0
        });
      } else {
        uniqueWayMap.get(w.id).relations.push(child.ref);
      }
    });
  }

  // Calculate length for unique ways
  let totalUniqueWayLengthKm = 0;
  let onewayYesLengthKm = 0;
  let onewayNoLengthKm = 0;
  let onewayMinusOneLengthKm = 0;
  let linkRoadsLengthKm = 0;
  let roundaboutLengthKm = 0;

  for (const [wayId, way] of uniqueWayMap.entries()) {
    let len = 0;
    const nodes = way.nodes || [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = allNodes.get(nodes[i]);
      const n2 = allNodes.get(nodes[i + 1]);
      if (n1 && n2) {
        len += haversineDistanceKm(n1.lat, n1.lon, n2.lat, n2.lon);
      }
    }
    way.lengthKm = len;
    totalUniqueWayLengthKm += len;

    const tags = way.tags || {};
    const oneway = tags.oneway;
    const hw = tags.highway || '';
    const junction = tags.junction || '';

    if (hw.endsWith('_link')) {
      linkRoadsLengthKm += len;
    }
    if (junction === 'roundabout') {
      roundaboutLengthKm += len;
    }

    if (oneway === 'yes') {
      onewayYesLengthKm += len;
    } else if (oneway === '-1') {
      onewayMinusOneLengthKm += len;
    } else {
      onewayNoLengthKm += len;
    }
  }

  // Calculate raw total (with duplicate occurrences across child relations)
  let totalRawOccurrencesLengthKm = 0;
  for (const occ of rawWayOccurrences) {
    const unique = uniqueWayMap.get(occ.id);
    totalRawOccurrencesLengthKm += unique ? unique.lengthKm : 0;
  }

  // Find shared ways across multiple child relations
  const sharedWays = Array.from(uniqueWayMap.values()).filter(w => w.relations.length > 1);
  let sharedWaysLengthKm = sharedWays.reduce((sum, w) => sum + w.lengthKm, 0);

  console.log('=== RAW WAY METRICS AUDIT ===');
  console.log(`Total raw way occurrences in child relations: ${rawWayOccurrences.length}`);
  console.log(`Total unique ways: ${uniqueWayMap.size}`);
  console.log(`Ways appearing in multiple child relations: ${sharedWays.length} (length: ${sharedWaysLengthKm.toFixed(2)} km)`);
  console.log('\n--- LENGTH BREAKDOWN ---');
  console.log(`Total Raw Occurrences Length: ${totalRawOccurrencesLengthKm.toFixed(2)} km`);
  console.log(`Total Unique Ways Length: ${totalUniqueWayLengthKm.toFixed(2)} km`);
  console.log(`  - oneway=yes length: ${onewayYesLengthKm.toFixed(2)} km (${((onewayYesLengthKm/totalUniqueWayLengthKm)*100).toFixed(1)}%)`);
  console.log(`  - oneway=no (bidirectional) length: ${onewayNoLengthKm.toFixed(2)} km (${((onewayNoLengthKm/totalUniqueWayLengthKm)*100).toFixed(1)}%)`);
  console.log(`  - oneway=-1 length: ${onewayMinusOneLengthKm.toFixed(2)} km`);
  console.log(`  - Link roads (*_link) length: ${linkRoadsLengthKm.toFixed(2)} km`);
  console.log(`  - Roundabouts length: ${roundaboutLengthKm.toFixed(2)} km`);

  console.log('\n--- DISCREPANCY RECONCILIATION ---');
  console.log(`If oneway=yes represents dual carriageways:`);
  console.log(`Dual carriageway one-way equivalent = (onewayYesLength / 2) = ${(onewayYesLengthKm / 2).toFixed(2)} km`);
  console.log(`Adding bidirectional (oneway=no) = ${onewayNoLengthKm.toFixed(2)} km`);
  console.log(`Deduplicated estimated mainline physical length = ${((onewayYesLengthKm / 2) + onewayNoLengthKm).toFixed(2)} km`);
  console.log(`Difference from 3,635.2 km OSM mapped length: ${(((onewayYesLengthKm / 2) + onewayNoLengthKm) - 3635.2).toFixed(2)} km`);
  console.log(`Difference from 3,810.0 km MoRTH listed length: ${(3810.0 - ((onewayYesLengthKm / 2) + onewayNoLengthKm)).toFixed(2)} km`);
}

main();
