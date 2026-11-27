/**
 * scripts/gis/inspect_reversed_ways.js
 */

const fs = require('fs');
const path = require('path');
const OUT_DIR = path.join(__dirname, '..', '..', 'data', 'nh44');

const audit = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'nh44-direction-audit.json'), 'utf8'));

const reversed = audit.traversedWays.filter(w => !w.isLegalTrafficFlow);

console.log(`Found ${reversed.length} ways with counter-flow traversal:`);
reversed.forEach(r => {
  console.log(`Way ${r.wayId} (${r.name || 'unnamed'}, ref: ${r.ref}, ${r.lengthMeters}m): entry ${r.traversalEntryNode} -> exit ${r.traversalExitNode}`);
  console.log(`  Note: ${r.directionNote}`);
});
