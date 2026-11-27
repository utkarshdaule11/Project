const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw_osm');

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371008.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ORDERED_RELS = [
  { id: 5794209, state: 'JK' },
  { id: 5794229, state: 'PB' },
  { id: 15623357, state: 'HP' },
  { id: 5794309, state: 'HR' },
  { id: 5795969, state: 'DL' },
  { id: 5803022, state: 'UP' },
  { id: 5802963, state: 'RJ' },
  { id: 5802971, state: 'MP' },
  { id: 5803131, state: 'MH' },
  { id: 5803164, state: 'TG' },
  { id: 5803176, state: 'AP' },
  { id: 5878728, state: 'KA' },
  { id: 5803261, state: 'TN' },
];

function main() {
  const relNodes = new Map();

  for (const r of ORDERED_RELS) {
    const file = path.join(RAW_DIR, `relation_${r.id}_full.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const nodes = new Map();
    data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
    relNodes.set(r.id, nodes);
  }

  console.log('=== CHECKING INTER-RELATION NODE DISTANCES ===');
  for (let i = 0; i < ORDERED_RELS.length - 1; i++) {
    const r1 = ORDERED_RELS[i];
    const r2 = ORDERED_RELS[i + 1];
    const nodes1 = relNodes.get(r1.id);
    const nodes2 = relNodes.get(r2.id);

    // Find shared nodes first
    let shared = 0;
    for (const id of nodes1.keys()) {
      if (nodes2.has(id)) shared++;
    }

    // Find minimum distance between any node in r1 and any node in r2
    let minDistMeters = Infinity;
    let closestN1 = null;
    let closestN2 = null;

    // To optimize search, find bounding box of nodes2 and only compare nearby nodes in nodes1
    let minLat2 = Infinity, maxLat2 = -Infinity;
    for (const n of nodes2.values()) {
      if (n.lat < minLat2) minLat2 = n.lat;
      if (n.lat > maxLat2) maxLat2 = n.lat;
    }

    for (const [id1, n1] of nodes1.entries()) {
      if (Math.abs(n1.lat - maxLat2) > 0.5 && Math.abs(n1.lat - minLat2) > 0.5) continue;
      for (const [id2, n2] of nodes2.entries()) {
        const d = haversineMeters(n1.lat, n1.lon, n2.lat, n2.lon);
        if (d < minDistMeters) {
          minDistMeters = d;
          closestN1 = { id: id1, ...n1 };
          closestN2 = { id: id2, ...n2 };
        }
      }
    }

    console.log(`Transition ${r1.state} (${r1.id}) -> ${r2.state} (${r2.id}):`);
    console.log(`  Shared nodes: ${shared}`);
    console.log(`  Min distance between nodes: ${minDistMeters.toFixed(2)} meters`);
    if (minDistMeters > 0) {
      console.log(`  Closest N1 (${r1.state}): ${closestN1.id} at ${closestN1.lat}, ${closestN1.lon}`);
      console.log(`  Closest N2 (${r2.state}): ${closestN2.id} at ${closestN2.lat}, ${closestN2.lon}`);
    }
  }
}

main();
