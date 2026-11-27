const https = require('https');
const fs = require('fs');
const path = require('path');

const MASTER_RELATION_ID = 11568320;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GrandBharatHighway-GIS-Audit/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}\nRaw preview: ${data.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`[GIS-AUDIT] Inspecting Master Relation ${MASTER_RELATION_ID}...`);
  const masterData = await fetchJson(`https://api.openstreetmap.org/api/0.6/relation/${MASTER_RELATION_ID}.json`);
  const master = masterData.elements[0];

  console.log('\n--- MASTER RELATION TAGS & METADATA ---');
  console.log('ID:', master.id);
  console.log('Version:', master.version);
  console.log('Timestamp:', master.timestamp);
  console.log('Tags:', JSON.stringify(master.tags, null, 2));

  const directWays = master.members.filter(m => m.type === 'way');
  const childRelations = master.members.filter(m => m.type === 'relation');

  console.log(`\nDirect Ways: ${directWays.length}`);
  directWays.forEach(w => console.log(`  - Way ID: ${w.ref}, Role: "${w.role}"`));

  console.log(`\nChild Relations: ${childRelations.length}`);
  const childIds = childRelations.map(r => r.ref).join(',');

  console.log(`Fetching metadata for child relations: ${childIds}...`);
  const childrenData = await fetchJson(`https://api.openstreetmap.org/api/0.6/relations.json?relations=${childIds}`);

  console.log('\n--- CHILD RELATIONS INVENTORY ---');
  const summary = childrenData.elements.map(rel => {
    const state = rel.tags['is_in:state'] || rel.tags['state'] || rel.tags['name'] || rel.tags['note'] || 'Unknown';
    return {
      id: rel.id,
      state: state,
      ref: rel.tags.ref || rel.tags['name:en'] || rel.tags.name,
      waysCount: (rel.members || []).filter(m => m.type === 'way').length,
      childRelCount: (rel.members || []).filter(m => m.type === 'relation').length,
      version: rel.version,
      timestamp: rel.timestamp,
      tags: rel.tags
    };
  });

  console.table(summary.map(s => ({
    ID: s.id,
    State: s.state,
    Ref: s.ref,
    Ways: s.waysCount,
    Version: s.version,
    Modified: s.timestamp.slice(0, 10)
  })));

  // Save raw data to scratch / cache
  const outDir = path.join(__dirname, '..', '..', 'data', 'raw_osm');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `relation_${MASTER_RELATION_ID}.json`), JSON.stringify(masterData, null, 2));
  fs.writeFileSync(path.join(outDir, `children_${MASTER_RELATION_ID}.json`), JSON.stringify(childrenData, null, 2));
  console.log(`\nRaw OSM relation data saved to: ${outDir}`);
}

main().catch(err => {
  console.error('[GIS-AUDIT FAIL]', err);
  process.exit(1);
});
