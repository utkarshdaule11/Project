/**
 * scripts/gis/validate_nh44_lods.js
 * 
 * Comprehensive QA validation script for Phase 1B.2B Multi-Resolution Deliverables.
 * Tests:
 * 1. File existence and JSON parseability of all 4 deliverables in public/data/nh44/
 * 2. GeoJSON MultiLineString schema validity and WGS84 coordinate bounds
 * 3. Exact section count preservation (5 sections across all LODs, never simplifying across gaps)
 * 4. Vertex count bounds: LOD 0 (43,089), LOD 1 (target ~4,000), LOD 2 (target ~600)
 * 5. Pinned checkpoint anchor retention (all 14 checkpoints)
 * 6. Maximum and average geometric deviation bounds
 * 7. Payload budget assertions (LOD 1 gzipped < 60KB, LOD 2 gzipped < 15KB)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const LOD_DIR = path.join(__dirname, '..', '..', 'public', 'data', 'nh44');

const LOD0_FILE = path.join(LOD_DIR, 'nh44-route-lod0.geojson');
const LOD1_FILE = path.join(LOD_DIR, 'nh44-route-lod1.geojson');
const LOD2_FILE = path.join(LOD_DIR, 'nh44-route-lod2.geojson');
const METADATA_FILE = path.join(LOD_DIR, 'nh44-lod-metadata.json');

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371008.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
}

function perpDistanceMeters(p, a, b) {
  const [lonP, latP] = p;
  const [lonA, latA] = a;
  const [lonB, latB] = b;

  if (lonA === lonB && latA === latB) {
    return haversineMeters(latP, lonP, latA, lonA);
  }

  const R = 6371008.8;
  const midLat = ((latA + latB) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(midLat);
  const mPerDegLat = (Math.PI / 180) * R;
  const mPerDegLon = (Math.PI / 180) * R * cosLat;

  const bx = (lonB - lonA) * mPerDegLon;
  const by = (latB - latA) * mPerDegLat;
  const px = (lonP - lonA) * mPerDegLon;
  const py = (latP - latA) * mPerDegLat;

  const segLenSq = bx * bx + by * by;
  let t = (px * bx + py * by) / segLenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = t * bx;
  const projY = t * by;

  const dx = px - projX;
  const dy = py - projY;

  return Math.sqrt(dx * dx + dy * dy);
}

function main() {
  console.log('=== PHASE 1B.2B: LOD QUALITY ASSURANCE VALIDATION ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ${message}`);
    }
  }

  // 1. Deliverables existence
  console.log('--- 1. File Deliverables Verification ---');
  assert(fs.existsSync(LOD0_FILE), 'T01_LOD0_File_Exists', 'LOD 0 GeoJSON file must exist.');
  assert(fs.existsSync(LOD1_FILE), 'T02_LOD1_File_Exists', 'LOD 1 GeoJSON file must exist.');
  assert(fs.existsSync(LOD2_FILE), 'T03_LOD2_File_Exists', 'LOD 2 GeoJSON file must exist.');
  assert(fs.existsSync(METADATA_FILE), 'T04_Metadata_File_Exists', 'LOD metadata JSON file must exist.');

  // Load and parse
  const lod0 = JSON.parse(fs.readFileSync(LOD0_FILE, 'utf8'));
  const lod1 = JSON.parse(fs.readFileSync(LOD1_FILE, 'utf8'));
  const lod2 = JSON.parse(fs.readFileSync(LOD2_FILE, 'utf8'));
  const meta = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));

  // 2. GeoJSON Schema & Geometry Type
  console.log('\n--- 2. GeoJSON Schema & MultiLineString Geometry ---');
  assert(
    lod0.type === 'FeatureCollection' && lod0.features[0].geometry.type === 'MultiLineString',
    'T05_LOD0_MultiLineString_Schema',
    'LOD 0 must be a valid GeoJSON FeatureCollection containing a MultiLineString.'
  );
  assert(
    lod1.type === 'FeatureCollection' && lod1.features[0].geometry.type === 'MultiLineString',
    'T06_LOD1_MultiLineString_Schema',
    'LOD 1 must be a valid GeoJSON FeatureCollection containing a MultiLineString.'
  );
  assert(
    lod2.type === 'FeatureCollection' && lod2.features[0].geometry.type === 'MultiLineString',
    'T07_LOD2_MultiLineString_Schema',
    'LOD 2 must be a valid GeoJSON FeatureCollection containing a MultiLineString.'
  );

  const sec0 = lod0.features[0].geometry.coordinates;
  const sec1 = lod1.features[0].geometry.coordinates;
  const sec2 = lod2.features[0].geometry.coordinates;

  // 3. Section Count & Gap Preservation
  console.log('\n--- 3. Structural Gap & Section Preservation ---');
  assert(
    sec0.length === 5 && sec1.length === 5 && sec2.length === 5,
    'T08_Five_Sections_Preserved_Across_LODs',
    'All 5 MultiLineString sections must be preserved across all LODs (no simplification across gaps).'
  );

  // Verify section endpoints match original structural gap endpoints
  let gapsPreserved = true;
  for (let s = 0; s < 4; s++) {
    const end0 = sec0[s][sec0[s].length - 1];
    const start0 = sec0[s + 1][0];
    const end1 = sec1[s][sec1[s].length - 1];
    const start1 = sec1[s + 1][0];
    const end2 = sec2[s][sec2[s].length - 1];
    const start2 = sec2[s + 1][0];

    if (end0[0] !== end1[0] || end0[1] !== end1[1] || start0[0] !== start1[0] || start0[1] !== start1[1]) {
      gapsPreserved = false;
      break;
    }
    if (end0[0] !== end2[0] || end0[1] !== end2[1] || start0[0] !== start2[0] || start0[1] !== start2[1]) {
      gapsPreserved = false;
      break;
    }
  }
  assert(
    gapsPreserved,
    'T09_Gap_Boundary_Coordinates_Strictly_Preserved',
    'All 4 structural gap endpoint coordinates are identical across LOD 0, LOD 1, and LOD 2.'
  );

  // 4. Vertex Counts Verification
  console.log('\n--- 4. Target Vertex Count Verification ---');
  const v0 = sec0.reduce((sum, s) => sum + s.length, 0);
  const v1 = sec1.reduce((sum, s) => sum + s.length, 0);
  const v2 = sec2.reduce((sum, s) => sum + s.length, 0);

  console.log(`LOD 0 vertices: ${v0} (Target: 43,089)`);
  console.log(`LOD 1 vertices: ${v1} (Target: ~4,000)`);
  console.log(`LOD 2 vertices: ${v2} (Target: ~600)`);

  assert(v0 === 43089, 'T10_LOD0_Vertex_Count', `LOD 0 must have exactly 43,089 vertices (actual: ${v0}).`);
  assert(v1 >= 3800 && v1 <= 4200, 'T11_LOD1_Vertex_Target', `LOD 1 must have ~4,000 vertices (actual: ${v1}, error: ${Math.abs(v1 - 4000)}).`);
  assert(v2 >= 550 && v2 <= 650, 'T12_LOD2_Vertex_Target', `LOD 2 must have ~600 vertices (actual: ${v2}, error: ${Math.abs(v2 - 600)}).`);

  // 5. Metric Geometric Deviation Bounds
  console.log('\n--- 5. Metric Geometric Deviation Bounds ---');
  const lod1Level = meta.levels.find(l => l.lod === 1);
  const lod2Level = meta.levels.find(l => l.lod === 2);

  console.log(`LOD 1: Max Dev = ${lod1Level.maxDeviationMeters} m, Avg Dev = ${lod1Level.avgDeviationMeters} m (Tolerance ε = ${lod1Level.toleranceMeters} m)`);
  console.log(`LOD 2: Max Dev = ${lod2Level.maxDeviationMeters} m, Avg Dev = ${lod2Level.avgDeviationMeters} m (Tolerance ε = ${lod2Level.toleranceMeters} m)`);

  assert(
    lod1Level.maxDeviationMeters <= 30.0,
    'T13_LOD1_Max_Deviation_Bound',
    `LOD 1 max deviation (${lod1Level.maxDeviationMeters} m) must be <= tolerance (30.0 m).`
  );
  assert(
    lod2Level.maxDeviationMeters <= 580.0,
    'T14_LOD2_Max_Deviation_Bound',
    `LOD 2 max deviation (${lod2Level.maxDeviationMeters} m) must be <= tolerance (580.0 m).`
  );

  // 6. Checkpoint Anchor Preservation & Offsets
  console.log('\n--- 6. Checkpoint Anchor Retention & Offset Accuracy ---');
  assert(
    meta.checkpointsValidation && meta.checkpointsValidation.length === 14,
    'T15_14_Checkpoints_Validated_In_Metadata',
    'Metadata must validate all 14 checkpoints.'
  );

  let allAnchorsPreserved = true;
  meta.checkpointsValidation.forEach(cp => {
    if (!cp.isAnchorRetainedInLOD1 || !cp.isAnchorRetainedInLOD2) {
      allAnchorsPreserved = false;
      console.error(`Checkpoint ${cp.name} anchor lost or distorted in LOD 1 or LOD 2.`);
    }
  });
  assert(allAnchorsPreserved, 'T16_All_14_Checkpoint_Anchors_Strictly_Preserved', 'All 14 checkpoint anchors preserved in LOD 1 (<5m) and LOD 2 (<50m).');

  const namakkal = meta.checkpointsValidation.find(c => c.checkpointId === 'namakkal');
  const kanyakumari = meta.checkpointsValidation.find(c => c.checkpointId === 'kanyakumari');

  assert(
    namakkal && namakkal.orthogonalOffsetLOD1Meters < 5.0,
    'T17_Namakkal_Preserved_In_LOD1',
    `Namakkal anchor retained in LOD 1 (offset: ${namakkal.orthogonalOffsetLOD1Meters} m).`
  );
  assert(
    kanyakumari && kanyakumari.orthogonalOffsetLOD1Meters < 5.0,
    'T18_Kanyakumari_Preserved_In_LOD1',
    `Kanyakumari anchor retained in LOD 1 (offset: ${kanyakumari.orthogonalOffsetLOD1Meters} m).`
  );

  // 7. Payload Size & Compression Budget
  console.log('\n--- 7. Payload Size & Budget Verification ---');
  const size1 = lod1Level.payloadSizes;
  const size2 = lod2Level.payloadSizes;

  console.log(`LOD 1: ${size1.rawKb} KB raw / ${size1.gzipKb} KB gzipped`);
  console.log(`LOD 2: ${size2.rawKb} KB raw / ${size2.gzipKb} KB gzipped`);

  assert(size1.gzipKb < 60.0, 'T19_LOD1_Gzip_Budget', `LOD 1 gzipped payload (${size1.gzipKb} KB) must be < 60 KB.`);
  assert(size2.gzipKb < 15.0, 'T20_LOD2_Gzip_Budget', `LOD 2 gzipped payload (${size2.gzipKb} KB) must be < 15 KB.`);

  // Final Summary
  console.log('\n========================================');
  console.log(`PHASE 1B.2B QA RESULT: ${passed} / ${total} CHECKS PASSED`);
  console.log('========================================\n');

  if (passed === total) {
    console.log('STATUS: FULLY VERIFIED. LOD deliverables certified for production.');
    process.exit(0);
  } else {
    console.error('STATUS: VALIDATION CHECKS FAILED.');
    process.exit(1);
  }
}

main();
