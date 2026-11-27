/**
 * scripts/gis/diagnose_border_gaps.js
 * 
 * Inspects the exact coordinates and distances between disconnected components
 * at the 4 border transition areas:
 * 1. JK -> PB (Lakhanpur)
 * 2. DL -> UP/RJ/MP (Delhi -> Gwalior)
 * 3. MH -> TG (Nagpur -> Hyderabad border)
 * 4. KA -> TN (Bangalore -> Salem border)
 */

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

function loadRelNodes(relId) {
  const file = path.join(RAW_DIR, `relation_${relId}_full.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const nodes = new Map();
  const ways = [];
  data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, { lat: n.lat, lon: n.lon }));
  data.elements.filter(e => e.type === 'way').forEach(w => ways.push(w));
  return { nodes, ways };
}

function findMinGap(relA, relB) {
  let minD = Infinity;
  let bestA = null;
  let bestB = null;

  for (const [idA, nA] of relA.nodes.entries()) {
    for (const [idB, nB] of relB.nodes.entries()) {
      if (Math.abs(nA.lat - nB.lat) > 0.1 || Math.abs(nA.lon - nB.lon) > 0.1) continue;
      const d = haversineMeters(nA.lat, nA.lon, nB.lat, nB.lon);
      if (d < minD) {
        minD = d;
        bestA = { id: idA, ...nA };
        bestB = { id: idB, ...nB };
      }
    }
  }
  return { minD, bestA, bestB };
}

function main() {
  console.log('=== DIAGNOSING BORDER TRANSITIONS ===\n');

  // 1. JK (5794209) and PB (5794229)
  console.log('1. JK -> PB:');
  const jk = loadRelNodes(5794209);
  const pb = loadRelNodes(5794229);
  const gap1 = findMinGap(jk, pb);
  console.log(`   Min distance: ${gap1.minD.toFixed(2)} meters between JK node ${gap1.bestA ? gap1.bestA.id : null} and PB node ${gap1.bestB ? gap1.bestB.id : null}`);
  if (gap1.bestA) console.log(`   Coordinates: ${gap1.bestA.lat}, ${gap1.bestA.lon}`);

  // 2. KA (5878728) and TN (5803261) (Attibele / Hosur)
  console.log('\n2. KA (Bangalore) -> TN (Salem):');
  const ka = loadRelNodes(5878728);
  const tn = loadRelNodes(5803261);
  const gap2 = findMinGap(ka, tn);
  console.log(`   Min distance: ${gap2.minD.toFixed(2)} meters between KA node ${gap2.bestA ? gap2.bestA.id : null} and TN node ${gap2.bestB ? gap2.bestB.id : null}`);
  if (gap2.bestA) console.log(`   Coordinates: ${gap2.bestA.lat}, ${gap2.bestA.lon}`);

  // 3. MH (5803131) and TG (5803164) (Nagpur -> Hyderabad)
  console.log('\n3. MH (Nagpur) -> TG (Hyderabad):');
  const mh = loadRelNodes(5803131);
  const tg = loadRelNodes(5803164);
  const gap3 = findMinGap(mh, tg);
  console.log(`   Min distance: ${gap3.minD.toFixed(2)} meters between MH node ${gap3.bestA ? gap3.bestA.id : null} and TG node ${gap3.bestB ? gap3.bestB.id : null}`);
  if (gap3.bestA) console.log(`   Coordinates: ${gap3.bestA.lat}, ${gap3.bestA.lon}`);

  // 4. DL (5795969) -> HR (5794309) -> UP (5803022) -> RJ (5802963) -> MP (5802971)
  console.log('\n4. Delhi -> Gwalior chain:');
  const dl = loadRelNodes(5795969);
  const hr = loadRelNodes(5794309);
  const up = loadRelNodes(5803022);
  const rj = loadRelNodes(5802963);
  const mp = loadRelNodes(5802971);

  const dl_hr = findMinGap(dl, hr);
  console.log(`   DL -> HR: ${dl_hr.minD.toFixed(2)} meters (DL node ${dl_hr.bestA ? dl_hr.bestA.id : null}, HR node ${dl_hr.bestB ? dl_hr.bestB.id : null})`);

  const hr_up = findMinGap(hr, up);
  console.log(`   HR -> UP: ${hr_up.minD.toFixed(2)} meters (HR node ${hr_up.bestA ? hr_up.bestA.id : null}, UP node ${hr_up.bestB ? hr_up.bestB.id : null})`);

  const up_rj = findMinGap(up, rj);
  console.log(`   UP -> RJ: ${up_rj.minD.toFixed(2)} meters (UP node ${up_rj.bestA ? up_rj.bestA.id : null}, RJ node ${up_rj.bestB ? up_rj.bestB.id : null})`);

  const rj_mp = findMinGap(rj, mp);
  console.log(`   RJ -> MP: ${rj_mp.minD.toFixed(2)} meters (RJ node ${rj_mp.bestA ? rj_mp.bestA.id : null}, MP node ${rj_mp.bestB ? rj_mp.bestB.id : null})`);
}

main();
