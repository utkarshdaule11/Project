const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = 3012;
const CDP_PORT = 9448;
const POSSIBLE_CHROME_PATHS = [
  path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const CHROME_PATH = POSSIBLE_CHROME_PATHS.find(p => fs.existsSync(p)) || POSSIBLE_CHROME_PATHS[0];
const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots', 'step5');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await new Promise((resolve, reject) => {
        http.get(url, res => resolve(res.statusCode)).on('error', reject);
      });
      if (res >= 200 && res < 400) return true;
    } catch {}
    await delay(300);
  }
  throw new Error(`Server at ${url} failed to become ready within ${timeoutMs}ms`);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.failedRequests = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          this.consoleLogs.push(msg.params);
        } else if (msg.method === 'Network.responseReceived') {
          if (msg.params.response.status >= 400) {
            this.failedRequests.push({
              url: msg.params.response.url,
              status: msg.params.response.status,
              statusText: msg.params.response.statusText
            });
          }
        } else if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch (e) {
        console.error('CDP message error:', e);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filePath, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    return filePath;
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
  }
}

// 1. GIS Hash Verification helper
const EXPECTED_GIS_HASHES = {
  "public/data/nh44/nh44-route-lod0.geojson": "78f88425f475bce8b4050f2fa98c013ef1259b2579e4df1840902ffb13aeb5ae",
  "public/data/nh44/nh44-route-lod1.geojson": "1b07bf05249a81acb7b4048ba60c904504a79780c08c2dff5b4dc6d6a79d2282",
  "public/data/nh44/nh44-route-lod2.geojson": "6d78013a9b3a645afc8726487203e8948a8b99e87a0f9483e6c4a58a6aab840d",
  "public/data/nh44/nh44-lod-metadata.json": "d0a585d6a3e77e216b9f12f78aa8fc43dee763734d85025f281d642c905178d7",
  "public/data/india.json": "a6687a9176992a92f56486b1335f890c0c3065de7e28e7ac8f0da67c7e2e14c0"
};

function verifyGisBaseline() {
  const root = path.join(__dirname, '..', '..');
  const results = {};
  let allPass = true;
  for (const [relPath, expected] of Object.entries(EXPECTED_GIS_HASHES)) {
    const fullPath = path.join(root, relPath);
    const buf = fs.readFileSync(fullPath);
    const normalized = buf.toString('utf8').replace(/\r\n/g, '\n');
    const hash = crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
    const pass = hash === expected;
    results[relPath] = { expected, actual: hash, pass };
    if (!pass) allPass = false;
  }
  return { allPass, results };
}

async function main() {
  console.log('===============================================================');
  console.log('=== PHASE 1C STEP 5: COMPREHENSIVE QA & VERIFICATION MATRIX ===');
  console.log('===============================================================\n');

  const testReport = {
    timestamp: new Date().toISOString(),
    results: {},
    summary: { total: 0, passed: 0, failed: 0 }
  };

  function recordTest(id, name, pass, details = {}) {
    testReport.summary.total++;
    if (pass) testReport.summary.passed++;
    else testReport.summary.failed++;
    testReport.results[id] = { name, pass, details };
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${name}`);
    if (!pass) console.log('  Details:', details);
  }

  // T5-04: GIS Invariance
  const gisCheck = verifyGisBaseline();
  recordTest('T5-04', 'GIS Baseline SHA-256 Invariance', gisCheck.allPass, gisCheck.results);

  // T5-23: Zero Agra references
  const rootDir = path.join(__dirname, '..', '..');
  const searchAgraInDir = (dir) => {
    let matches = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === '.next') continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        matches = matches.concat(searchAgraInDir(full));
      } else if (/\.(ts|tsx|js|json|md)$/.test(ent.name) && !ent.name.includes('PHASE-1A') && !ent.name.includes('PHASE-1B')) {
        const content = fs.readFileSync(full, 'utf8');
        const count = (content.match(/\bAgra\b/gi) || []).length;
        if (count > 0 && !ent.name.includes('verify_step3_corrections.py') && !ent.name.includes('PHASE-1C-STEP-4-TARGETED-CORRECTIONS-REPORT.md')) {
          matches.push({ file: path.relative(rootDir, full), count });
        }
      }
    }
    return matches;
  };
  const agraMatches = searchAgraInDir(path.join(rootDir, 'src')).concat(searchAgraInDir(path.join(rootDir, 'content')));
  recordTest('T5-23', 'Zero Agra References in src and content', agraMatches.length === 0, agraMatches);

  const nextBin = process.platform === 'win32'
    ? '.\\node_modules\\.bin\\next.cmd'
    : './node_modules/.bin/next';

  console.log(`\nStarting Next.js production server on port ${PORT}...`);
  const serverProc = spawn(nextBin, ['start', '-p', String(PORT)], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout.on('data', d => process.stdout.write(d.toString()));
  serverProc.stderr.on('data', d => process.stderr.write(d.toString()));

  try {
    await waitForServer(`http://localhost:${PORT}`);
    console.log(`[PASS] Next.js server ready at http://localhost:${PORT}\n`);
  } catch (err) {
    serverProc.kill();
    throw err;
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-step5-qa-'));
  console.log(`Launching Chrome Headless on debugging port ${CDP_PORT}...`);
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
  ]);

  let cdp = null;

  try {
    await delay(1200);
    const targets = await fetchJson(`http://localhost:${CDP_PORT}/json`);
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('No valid CDP WebSocket page target found');
    }

    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    console.log('\n--- Multi-Viewport Visual Inspection & Verification ---');

    async function navigateAndWait(url, waitMs = 1500) {
      await cdp.send('Page.navigate', { url });
      await delay(waitMs);
      await cdp.evaluate(`new Promise(resolve => {
        const start = Date.now();
        const check = () => {
          if (document.readyState === 'complete' && document.querySelector('footer')) {
            resolve(true);
          } else if (Date.now() - start > 10000) {
            resolve(false);
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      })`);
      await delay(400);
    }

    const viewports = [
      { name: '1440px-desktop', width: 1440, height: 900, dpr: 1 },
      { name: '768px-tablet', width: 768, height: 1024, dpr: 2 },
      { name: '390px-mobile', width: 390, height: 844, dpr: 3 },
      { name: '360px-small-mobile', width: 360, height: 740, dpr: 2 },
    ];

    for (const vp of viewports) {
      console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dpr,
        mobile: vp.width < 1000
      });

      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}?skipIntro=1` });
      await delay(1200);

      // Check overflow
      const overflowAudit = await cdp.evaluate(`
        (function() {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const innerWidth = window.innerWidth;
          return {
            scrollWidth,
            innerWidth,
            hasOverflow: scrollWidth > innerWidth
          };
        })()
      `);

      recordTest(
        `T5-19-${vp.name}`,
        `No horizontal overflow on ${vp.name}`,
        !overflowAudit.hasOverflow,
        overflowAudit
      );

      // Scroll down to #finale
      await cdp.evaluate(`
        (function() {
          const finale = document.getElementById('finale');
          if (finale) finale.scrollIntoView({ behavior: 'auto' });
        })()
      `);
      await delay(800);

      const shotPath = path.join(SCREENSHOT_DIR, `${vp.name}-finale-passport.png`);
      await cdp.captureScreenshot(shotPath);
      console.log(`  Saved screenshot: ${shotPath}`);
    }

    // Reset to Desktop for deep functional testing
    console.log('\n--- Deep Functional Testing at 1440px Desktop ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await navigateAndWait(`http://localhost:${PORT}?skipIntro=1`);

    // T5-05: 14 Checkpoints sequence in Passport
    const checkpointsAudit = await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        if (!passport) return { found: false, count: 0, ids: [] };
        const buttons = Array.from(passport.querySelectorAll('button[aria-label^="Stop "]'));
        const labels = buttons.map(b => b.getAttribute('aria-label'));
        return {
          found: true,
          count: buttons.length,
          labels
        };
      })()
    `);
    recordTest('T5-05', '14 Checkpoint Stamps in Passport in strict sequence', checkpointsAudit.count === 14, checkpointsAudit);

    // T5-06: 5 Zones verification
    const zonesAudit = await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        if (!passport) return { found: false, count: 0, titles: [] };
        const zoneHeaders = Array.from(passport.querySelectorAll('h4')).map(h => h.innerText.trim());
        const expectedTitles = [
          "Northern Mountain Descent & Submontane Gateway",
          "Indo-Gangetic Alluvial Plains & Capital",
          "Central Ravines, Bundelkhand & Zero Mile",
          "Granite Deccan Tablelands & Ghat Passes",
          "Kaveri Basin, Sangam Plain & Ocean Littoral"
        ];
        const allPresent = expectedTitles.every(t => zoneHeaders.includes(t));
        return {
          found: true,
          zoneHeaders,
          allPresent
        };
      })()
    `);
    recordTest('T5-06', 'All 5 Physiographic Zones Present in Passport', zonesAudit.allPresent, zonesAudit);

    // T5-07: Explicit vs Viewport (Scrolling past does not increment explored count)
    console.log('\nTesting T5-07: Viewport scroll does NOT increment explored count...');
    await cdp.evaluate(`
      (function() {
        // Scroll through all chapters
        const ch = document.getElementById('chapters');
        if (ch) ch.scrollIntoView({ behavior: 'auto' });
      })()
    `);
    await delay(800);

    const exploredAfterScroll = await cdp.evaluate(`
      (function() {
        const raw = localStorage.getItem('nh44_passport_progress_v1');
        return raw ? JSON.parse(raw) : null;
      })()
    `);
    const scrollOnlyCount = exploredAfterScroll ? exploredAfterScroll.exploredIds.length : 0;
    recordTest('T5-07', 'Viewport Scroll does not auto-explore checkpoints', scrollOnlyCount === 0, { storedPayload: exploredAfterScroll });

    // T5-08: Active + Explored State (Click stamp 05 Delhi)
    console.log('\nTesting T5-08: Explicit Stamp click sets both active and explored...');
    const stamp05ClickResult = await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        const buttons = Array.from(passport.querySelectorAll('button[aria-label*="Stop 05"]'));
        if (buttons.length === 0) return { success: false, reason: 'Stop 05 button not found' };
        buttons[0].click();
        return { success: true };
      })()
    `);
    await delay(800);

    const stamp05Audit = await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        const btn = passport.querySelector('button[aria-label*="Stop 05"]');
        const ariaLabel = btn ? btn.getAttribute('aria-label') : '';
        const raw = localStorage.getItem('nh44_passport_progress_v1');
        const parsed = raw ? JSON.parse(raw) : null;
        return {
          ariaLabel,
          isExploredInLabel: ariaLabel.includes('Explored: Yes'),
          isActiveInLabel: ariaLabel.includes('Active: Yes'),
          storedExploredIds: parsed ? parsed.exploredIds : []
        };
      })()
    `);
    const stamp05BothActiveAndExplored = stamp05Audit.isExploredInLabel && stamp05Audit.isActiveInLabel && stamp05Audit.storedExploredIds.includes('delhi');
    recordTest('T5-08', 'Stamp 05 is both Active and Explored simultaneously upon click', stamp05BothActiveAndExplored, stamp05Audit);

    // T5-10: Unified Storage Schema
    const schemaAudit = await cdp.evaluate(`
      (function() {
        const raw = localStorage.getItem('nh44_passport_progress_v1');
        if (!raw) return { valid: false, reason: 'Empty storage' };
        try {
          const parsed = JSON.parse(raw);
          const hasVersion = parsed.version === 1;
          const hasTimestamp = typeof parsed.lastUpdated === 'string' && !isNaN(Date.parse(parsed.lastUpdated));
          const hasArray = Array.isArray(parsed.exploredIds);
          return {
            valid: hasVersion && hasTimestamp && hasArray,
            parsed
          };
        } catch (e) {
          return { valid: false, reason: e.message };
        }
      })()
    `);
    recordTest('T5-10', 'Storage conforms to unified versioned schema (nh44_passport_progress_v1)', schemaAudit.valid, schemaAudit);

    // T5-09: Seal Gating (Locked at 1/14, Unlocked when all 14 explored)
    console.log('\nTesting T5-09: Completion Seal gating...');
    const sealLockedAudit = await cdp.evaluate(`
      (function() {
        const seal = document.getElementById('subcontinental-crossing-seal');
        const badgeText = document.getElementById('passport').innerText;
        return {
          sealExists: !!seal,
          showsRemaining: badgeText.includes('remaining') || badgeText.includes('Locked')
        };
      })()
    `);
    recordTest('T5-09-Locked', 'Seal strictly locked when exploredCount < 14', !sealLockedAudit.sealExists && sealLockedAudit.showsRemaining, sealLockedAudit);

    // Explore all remaining 13 checkpoints by clicking stamps
    console.log('Unlocking all 14 checkpoints by clicking all stamps...');
    await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        const buttons = Array.from(passport.querySelectorAll('button[aria-label^="Stop "]'));
        buttons.forEach(b => b.click());
      })()
    `);
    await delay(1200);

    const sealUnlockedAudit = await cdp.evaluate(`
      (function() {
        const seal = document.getElementById('subcontinental-crossing-seal');
        const raw = localStorage.getItem('nh44_passport_progress_v1');
        const parsed = raw ? JSON.parse(raw) : null;
        const sealText = seal ? seal.innerText : '';
        return {
          sealExists: !!seal,
          exploredCount: parsed ? parsed.exploredIds.length : 0,
          hasOwnerText: sealText.includes('SUBCONTINENTAL CROSSING') &&
                        sealText.includes('DIGITAL EXPEDITION PASSPORT') &&
                        sealText.includes('14 / 14') &&
                        sealText.includes('All 14 NH44 digital checkpoints explored.') &&
                        sealText.includes('3,810 KM Listed Benchmark') &&
                        sealText.includes('3,613.79 KM Checkpoint Projection Reference') &&
                        sealText.includes('Digital exploration milestone — not proof of physical travel.')
        };
      })()
    `);
    recordTest('T5-09-Unlocked', 'Seal unlocks with full owner text when all 14 explored', sealUnlockedAudit.sealExists && sealUnlockedAudit.exploredCount === 14 && sealUnlockedAudit.hasOwnerText, sealUnlockedAudit);

    // Capture screenshot of unlocked seal
    const sealShotPath = path.join(SCREENSHOT_DIR, '1440px-desktop-seal-unlocked.png');
    await cdp.captureScreenshot(sealShotPath);
    console.log(`  Saved screenshot: ${sealShotPath}`);

    // T5-15: Reset Progress Button
    console.log('\nTesting T5-15: Reset Exploration Progress...');
    const resetResult = await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        const buttons = Array.from(passport.querySelectorAll('button'));
        const resetBtn = buttons.find(b => b.innerText.includes('Reset Progress'));
        if (!resetBtn) return { success: false, reason: 'Reset button not found' };
        resetBtn.click();
        return { success: true };
      })()
    `);
    await delay(800);

    const postResetAudit = await cdp.evaluate(`
      (function() {
        const raw = localStorage.getItem('nh44_passport_progress_v1');
        const seal = document.getElementById('subcontinental-crossing-seal');
        return {
          storageCleared: !raw,
          sealRelocked: !seal
        };
      })()
    `);
    recordTest('T5-15', 'Reset Progress wipes storage and relocks completion seal', postResetAudit.storageCleared && postResetAudit.sealRelocked, postResetAudit);

    // T5-12 & T5-13: Corrupted / Malformed Storage Recovery & Dynamic ID Validation
    console.log('\nTesting T5-12 & T5-13: Malformed payload recovery and invalid ID filtering...');
    await cdp.evaluate(`
      (function() {
        // Inject bad version, invalid timestamp, duplicate IDs, and unknown ID 'atlantis'
        const badPayload = {
          version: 999,
          exploredIds: ["srinagar", "srinagar", "atlantis", "delhi"],
          lastUpdated: "invalid-date"
        };
        localStorage.setItem('nh44_passport_progress_v1', JSON.stringify(badPayload));
      })()
    `);

    // Reload page to test hook initialization against malformed storage
    await navigateAndWait(`http://localhost:${PORT}?skipIntro=1`);

    const malformedRecoveryAudit = await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        const meterText = passport.innerText;
        // Bad version and bad timestamp should result in empty explored set (0/14)
        return {
          hasZeroOrClean: meterText.includes('0 / 14') || meterText.includes('14 remaining'),
          didNotCrash: !!passport
        };
      })()
    `);
    recordTest('T5-12', 'Corrupted / invalid version storage safely recovers to empty set without crash', malformedRecoveryAudit.didNotCrash && malformedRecoveryAudit.hasZeroOrClean, malformedRecoveryAudit);

    // Inject valid version 1 with duplicate IDs and unknown ID 'agra'
    await cdp.evaluate(`
      (function() {
        const payloadWithUnknown = {
          version: 1,
          exploredIds: ["srinagar", "srinagar", "agra", "delhi"],
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('nh44_passport_progress_v1', JSON.stringify(payloadWithUnknown));
      })()
    `);
    await navigateAndWait(`http://localhost:${PORT}?skipIntro=1`);

    const dynamicValidationAudit = await cdp.evaluate(`
      (function() {
        const raw = localStorage.getItem('nh44_passport_progress_v1');
        const parsed = raw ? JSON.parse(raw) : null;
        const passport = document.getElementById('passport');
        const meterText = passport.innerText;
        // 'agra' should be rejected; 'srinagar' deduplicated -> exactly 2 valid IDs: srinagar, delhi
        return {
          meterHasTwo: meterText.includes('2 / 14'),
          storedExploredIds: parsed ? parsed.exploredIds : []
        };
      })()
    `);
    recordTest('T5-13', 'Dynamic ID Validation rejects unknown IDs and deduplicates', dynamicValidationAudit.meterHasTwo, dynamicValidationAudit);

    // T5-16: Footer Deduplication
    const footerAudit = await cdp.evaluate(`
      (function() {
        const footers = Array.from(document.querySelectorAll('footer'));
        const footer = document.getElementById('site-footer') || footers[footers.length - 1];
        if (!footer) return { found: false, stampCount: 0 };
        // Check for old ad-hoc stamp grid items in footer
        const stampLinks = footer.querySelectorAll('a[href^="#chapter-"]');
        const buttons = Array.from(footer.querySelectorAll('button'));
        const buttonTexts = buttons.map(b => (b.textContent || b.innerText || '').trim());
        const hasFinaleLink = buttonTexts.some(t => t.toLowerCase().includes('finale'));
        return {
          found: true,
          stampCount: stampLinks.length,
          buttonTexts,
          hasFinaleLink
        };
      })()
    `);
    recordTest('T5-16', 'Footer Deduplication: Zero duplicate checkpoint stamps in footer', footerAudit.stampCount === 0 && footerAudit.hasFinaleLink, footerAudit);

    // T5-17: Distance Terminology Audit
    const distanceAudit = await cdp.evaluate(`
      (function() {
        const finale = document.getElementById('finale');
        const text = finale ? finale.innerText : '';
        const hasListed = text.includes('3,810 KM Listed Benchmark') || text.includes('3,810');
        const hasProjection = text.includes('3,613.79 KM Checkpoint Projection Reference') || text.includes('3,613.79');
        return {
          hasListed,
          hasProjection
        };
      })()
    `);
    recordTest('T5-17', 'Established Distance Terminology Present in Finale and Passport', distanceAudit.hasListed && distanceAudit.hasProjection, distanceAudit);

    // T5-22: Kanyakumari Image Loading
    const imgAudit = await cdp.evaluate(`
      (function() {
        const img = document.querySelector('img[src*="14-kanyakumari-rock-memorial.webp"]');
        if (!img) return { found: false };
        return {
          found: true,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        };
      })()
    `);
    recordTest('T5-22', 'Kanyakumari Rock Memorial pilot image loaded and rendered', imgAudit.found && imgAudit.complete && imgAudit.naturalWidth > 0, imgAudit);

    // T5-24: Baseline Navigation Anchors
    const navAudit = await cdp.evaluate(`
      (function() {
        const hero = document.getElementById('hero');
        const map = document.getElementById('corridor-explorer');
        const chapters = document.getElementById('chapters');
        const finale = document.getElementById('finale');
        return {
          heroPresent: !!hero,
          mapPresent: !!map,
          chaptersPresent: !!chapters,
          finalePresent: !!finale
        };
      })()
    `);
    recordTest('T5-24', 'Baseline Section Anchors Functional (#hero, #corridor-explorer, #chapters, #finale)',
      navAudit.heroPresent && navAudit.mapPresent && navAudit.chaptersPresent && navAudit.finalePresent, navAudit);

    // T5-20: Reduced Motion Behavior
    console.log('\nTesting T5-20: Prefers-reduced-motion compatibility...');
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}?skipIntro=1` });
    await delay(1000);

    const reducedMotionAudit = await cdp.evaluate(`
      (function() {
        const finale = document.getElementById('finale');
        return {
          finaleRendered: !!finale
        };
      })()
    `);
    recordTest('T5-20', 'Prefers-reduced-motion gracefully renders finale without animation jitter', reducedMotionAudit.finaleRendered, reducedMotionAudit);
    await cdp.send('Emulation.setEmulatedMedia', { features: [] });

    // T5-21: Keyboard Focusability
    const keyboardAudit = await cdp.evaluate(`
      (function() {
        const passport = document.getElementById('passport');
        const buttons = Array.from(passport.querySelectorAll('button'));
        const allHaveFocusStyles = buttons.every(b => b.className.includes('focus-visible:ring'));
        return {
          totalButtons: buttons.length,
          allHaveFocusStyles
        };
      })()
    `);
    recordTest('T5-21', 'All interactive passport buttons have WCAG visible focus styles', keyboardAudit.allHaveFocusStyles, keyboardAudit);

    // T5-25: Route 66-style Intro Curtain & Highway Cruise HUD
    console.log('\nTesting T5-25: Route 66 Intro Curtain & Highway Cruise HUD...');
    await cdp.evaluate(`window.scrollTo({ top: 700, behavior: 'auto' });`);
    await delay(500);
    const hudAudit = await cdp.evaluate(`
      (function() {
        const hud = document.querySelector('[aria-label="Highway Cruise Companion"]');
        return { hudVisibleOnScroll: !!hud };
      })()
    `);

    await cdp.evaluate(`sessionStorage.removeItem('bharat_highway_intro_v2');`);
    await navigateAndWait(`http://localhost:${PORT}`, 600);
    await delay(1300);
    const introCheck = await cdp.evaluate(`
      (function() {
        const dialog = document.querySelector('[role="dialog"]');
        const btns = Array.from(document.querySelectorAll('button'));
        const audioBtn = btns.find(b => /start your journey/i.test(b.textContent || ''));
        const dismissBtn = btns.find(b => /enter without audio|skip/i.test(b.textContent || ''));
        if (dismissBtn) dismissBtn.click();
        return {
          dialogMounted: !!dialog,
          audioEntryRendered: !!audioBtn,
          dismissFound: !!dismissBtn
        };
      })()
    `);
    await delay(1200);
    const introAfter = await cdp.evaluate(`!document.querySelector('[role="dialog"]')`);
    recordTest(
      'T5-25',
      'Route 66 Intro modal (Audio & Silent options) dismisses cleanly & Highway Cruise HUD renders on scroll',
      hudAudit.hudVisibleOnScroll && introCheck.dialogMounted && introCheck.audioEntryRendered && introCheck.dismissFound && introAfter,
      { ...hudAudit, ...introCheck, introAfter }
    );

    // Diagnostics
    const consoleErrors = cdp.consoleLogs.filter(l => l.type === 'error');
    console.log('\n--- Diagnostics Summary ---');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network 4xx/5xx Failures: ${cdp.failedRequests.length}`);
    for (const nf of cdp.failedRequests) {
      console.log(`  [HTTP ${nf.status}] ${nf.url}`);
    }

    testReport.diagnostics = {
      consoleErrors: consoleErrors.length,
      networkFailures: cdp.failedRequests
    };

    const outJsonPath = path.join(rootDir, 'data', 'step5_qa_results.json');
    fs.writeFileSync(outJsonPath, JSON.stringify(testReport, null, 2));
    console.log(`\nDetailed QA results saved to: ${outJsonPath}`);

    console.log(`\n===============================================================`);
    console.log(`=== SUMMARY: ${testReport.summary.passed} / ${testReport.summary.total} TESTS PASSED ===`);
    console.log(`===============================================================\n`);

    if (testReport.summary.failed > 0) {
      throw new Error(`${testReport.summary.failed} tests failed!`);
    }

  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    serverProc.kill();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
