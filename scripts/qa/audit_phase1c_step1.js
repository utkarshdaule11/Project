const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = 3015;
const CDP_PORT = 9448;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots');

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
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function probeUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${urlPath}`, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: parseInt(res.headers['content-length'] || body.length.toString(), 10),
          actualBytes: body.length
        });
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

function getSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
}

class CdpAuditClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
    this.networkRequests = [];
    this.networkResponses = [];
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
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
        if (msg.method === 'Network.requestWillBeSent') {
          this.networkRequests.push(msg.params);
        }
        if (msg.method === 'Network.responseReceived') {
          this.networkResponses.push(msg.params);
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

  async captureScreenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    return filePath;
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('  PHASE 1C STEP 1: INDEPENDENT FINAL VERIFICATION & AUDIT RUNNER');
  console.log('================================================================\n');

  let allPassed = true;

  // -------------------------------------------------------------
  // AUDIT 1: Local Image Files on Disk
  // -------------------------------------------------------------
  console.log('--- 1. AUDIT LOCAL IMAGE FILES ON DISK ---');
  const expectedImages = [
    {
      name: '01-srinagar-dal-lake.webp',
      relPath: 'public/images/nh44/01-srinagar-dal-lake.webp',
      expectedSize: 265858,
      expectedWidth: 1920,
      expectedHeight: 1440
    },
    {
      name: '05-delhi-humayuns-tomb.webp',
      relPath: 'public/images/nh44/05-delhi-humayuns-tomb.webp',
      expectedSize: 252946,
      expectedWidth: 1920,
      expectedHeight: 1064
    },
    {
      name: '14-kanyakumari-rock-memorial.webp',
      relPath: 'public/images/nh44/14-kanyakumari-rock-memorial.webp',
      expectedSize: 125978,
      expectedWidth: 1920,
      expectedHeight: 986
    }
  ];

  for (const img of expectedImages) {
    const fullPath = path.resolve(img.relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FAIL] Missing image: ${img.relPath}`);
      allPassed = false;
      continue;
    }
    const stat = fs.statSync(fullPath);
    const sizeMatch = (stat.size === img.expectedSize);
    console.log(`[PASS] ${img.name}: exists=true | size=${stat.size} bytes (matches expected ${img.expectedSize}: ${sizeMatch})`);
    if (!sizeMatch) allPassed = false;
  }

  // -------------------------------------------------------------
  // AUDIT 2: Licensing Ledger Compliance
  // -------------------------------------------------------------
  console.log('\n--- 2. AUDIT LICENSING LEDGER (docs/NH44-IMAGE-LICENSING-LEDGER.md) ---');
  const ledgerContent = fs.readFileSync('docs/NH44-IMAGE-LICENSING-LEDGER.md', 'utf8');
  const requiredLedgerFields = [
    'Source Page:',
    'Direct Source URL:',
    'Creator / Photographer:',
    'License:',
    'License Terms URL:',
    'Attribution Notice:',
    'Modification Statement:'
  ];

  for (const field of requiredLedgerFields) {
    const occurrences = (ledgerContent.match(new RegExp(field, 'g')) || []).length;
    if (occurrences >= 3) {
      console.log(`[PASS] Field "${field}" found ${occurrences} times across pilot entries`);
    } else {
      console.error(`[FAIL] Field "${field}" found only ${occurrences} times (expected >= 3)`);
      allPassed = false;
    }
  }

  // -------------------------------------------------------------
  // AUDIT 3: content/states.ts Source Integration & Preservation
  // -------------------------------------------------------------
  console.log('\n--- 3. AUDIT content/states.ts INTEGRATION ---');
  const statesContent = fs.readFileSync('content/states.ts', 'utf8');
  const srcMatches = statesContent.match(/src:\s*["']([^"']+)["']/g) || [];
  const srcUrls = srcMatches.map(m => m.replace(/src:\s*["']/, '').replace(/["']$/, ''));

  const localUrls = srcUrls.filter(u => u.startsWith('/images/nh44/'));
  const remoteUrls = srcUrls.filter(u => !u.startsWith('/images/nh44/'));

  console.log(`Total image src entries in content/states.ts: ${srcUrls.length} (expected 29)`);
  console.log(`Local pilot images: ${localUrls.length} (expected exactly 3)`);
  console.log(`Remote un-migrated images: ${remoteUrls.length} (expected exactly 26)`);

  if (localUrls.length === 3 && remoteUrls.length === 26 && srcUrls.length === 29) {
    console.log('[PASS] content/states.ts contains exactly 3 local pilot assets and 26 preserved remote assets');
  } else {
    console.error('[FAIL] Unexpected image count distribution in content/states.ts');
    allPassed = false;
  }

  for (const img of expectedImages) {
    const localPath = `/images/nh44/${img.name}`;
    if (localUrls.includes(localPath)) {
      console.log(`[PASS] Verified local path in content/states.ts: ${localPath}`);
    } else {
      console.error(`[FAIL] Missing local path in content/states.ts: ${localPath}`);
      allPassed = false;
    }
  }

  // -------------------------------------------------------------
  // AUDIT 4: Cryptographic GIS Baseline Invariance
  // -------------------------------------------------------------
  console.log('\n--- 4. AUDIT CRYPTOGRAPHIC GIS INVARIANCE ---');
  const gisFiles = [
    { path: 'public/data/nh44/nh44-route-lod0.geojson', baseline: '78F88425F475BCE8B4050F2FA98C013EF1259B2579E4DF1840902FFB13AEB5AE' },
    { path: 'public/data/nh44/nh44-route-lod1.geojson', baseline: '1B07BF05249A81ACB7B4048BA60C904504A79780C08C2DFF5B4DC6D6A79D2282' },
    { path: 'public/data/nh44/nh44-route-lod2.geojson', baseline: '6D78013A9B3A645AFC8726487203E8948A8B99E87A0F9483E6C4A58A6AAB840D' },
    { path: 'public/data/nh44/nh44-lod-metadata.json',  baseline: 'D0A585D6A3E77E216B9F12F78AA8FC43DEE763734D85025F281D642C905178D7' },
    { path: 'public/data/india.json',                  baseline: 'A6687A9176992A92F56486B1335F890C0C3065DE7E28E7AC8F0DA67C7E2E14C0' }
  ];

  for (const gf of gisFiles) {
    const currentHash = getSha256(gf.path);
    const match = (currentHash === gf.baseline);
    console.log(`[${match ? 'PASS' : 'FAIL'}] ${gf.path}: ${match ? 'MATCHES BASELINE' : 'MISMATCH'} (${currentHash.slice(0, 16)}...)`);
    if (!match) allPassed = false;
  }

  // -------------------------------------------------------------
  // AUDIT 5 & 6: Runtime HTTP Delivery & Headless Chrome CDP Network Audit
  // -------------------------------------------------------------
  console.log('\n--- 5. LAUNCH NEXT.JS PRODUCTION SERVER & PROBE HTTP DELIVERY ---');
  const nextBin = process.platform === 'win32'
    ? '.\\node_modules\\.bin\\next.cmd'
    : './node_modules/.bin/next';

  const serverProc = spawn(nextBin, ['start', '-p', String(PORT)], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProc.stdout.on('data', d => process.stdout.write(d.toString()));
  serverProc.stderr.on('data', d => process.stderr.write(d.toString()));

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-audit-'));
  let chromeProc = null;
  let cdp = null;

  try {
    await waitForServer(`http://localhost:${PORT}`);
    console.log(`[PASS] Next.js server ready on http://localhost:${PORT}`);

    // Direct HTTP endpoint probes
    for (const img of expectedImages) {
      const probeRes = await probeUrl(`/images/nh44/${img.name}`);
      const statusOk = (probeRes.statusCode === 200);
      const typeOk = (probeRes.contentType === 'image/webp');
      const sizeOk = (probeRes.actualBytes === img.expectedSize);

      console.log(`[${statusOk && typeOk && sizeOk ? 'PASS' : 'FAIL'}] Endpoint /images/nh44/${img.name}:`);
      console.log(`       Status: ${probeRes.statusCode} (expected 200)`);
      console.log(`       Content-Type: ${probeRes.contentType} (expected image/webp)`);
      console.log(`       Content-Length: ${probeRes.contentLength} bytes (expected ${img.expectedSize})`);
      console.log(`       Received Body Size: ${probeRes.actualBytes} bytes`);

      if (!statusOk || !typeOk || !sizeOk) allPassed = false;
    }

    console.log('\n--- 6. BROWSER NETWORK AUDIT VIA HEADLESS CHROME CDP ---');
    console.log(`Launching Chrome Headless on debugging port ${CDP_PORT}...`);
    chromeProc = spawn(CHROME_PATH, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-sandbox',
      '--hide-scrollbars',
      `--user-data-dir=${userDataDir}`,
      'about:blank'
    ], { stdio: 'pipe' });

    await waitForServer(`http://127.0.0.1:${CDP_PORT}/json/version`, 15000);
    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    cdp = new CdpAuditClient(wsUrl);
    await cdp.connect();
    console.log('[PASS] Connected to Headless Chrome via CDP');

    // Enable Network and Page domains
    await cdp.send('Network.enable');
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log(`Navigating to http://localhost:${PORT}/...`);
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await delay(3000);

    // Scroll through chapters so chapter images are triggered to load
    console.log('Scrolling through corridor checkpoints to trigger image loads...');
    await cdp.evaluate(`
      window.scrollTo(0, 0);
    `);
    await delay(1000);

    // Capture Srinagar card
    console.log('Scrolling to chapter-srinagar...');
    await cdp.evaluate(`(() => {
      const el = document.getElementById('chapter-srinagar');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`);
    await delay(2500);
    const srinagarShot = path.join(SCREENSHOT_DIR, 'pilot-step1-srinagar.png');
    await cdp.captureScreenshot(srinagarShot);
    console.log(`[PASS] Captured Srinagar card screenshot: ${srinagarShot}`);

    // Capture Delhi card
    console.log('Scrolling to chapter-delhi...');
    await cdp.evaluate(`(() => {
      const el = document.getElementById('chapter-delhi');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`);
    await delay(2500);
    const delhiShot = path.join(SCREENSHOT_DIR, 'pilot-step1-delhi.png');
    await cdp.captureScreenshot(delhiShot);
    console.log(`[PASS] Captured Delhi card screenshot: ${delhiShot}`);

    // Capture Kanyakumari card
    console.log('Scrolling to chapter-kanyakumari...');
    await cdp.evaluate(`(() => {
      const el = document.getElementById('chapter-kanyakumari');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`);
    await delay(2500);
    const kanyakumariShot = path.join(SCREENSHOT_DIR, 'pilot-step1-kanyakumari.png');
    await cdp.captureScreenshot(kanyakumariShot);
    console.log(`[PASS] Captured Kanyakumari card screenshot: ${kanyakumariShot}`);

    // Inspect recorded network requests
    console.log('\n--- 7. ANALYZING CAPTURED NETWORK TRAFFIC ---');
    const allReqUrls = cdp.networkRequests.map(r => r.request.url);

    // Check 1: Pilot images requested locally
    for (const img of expectedImages) {
      const rawSubstr = `/images/nh44/${img.name}`;
      const encodedSubstr = encodeURIComponent(rawSubstr);
      const matchingReqs = allReqUrls.filter(u => u.includes(rawSubstr) || u.includes(encodedSubstr));
      if (matchingReqs.length > 0) {
        console.log(`[PASS] Network request captured for ${img.name}:`);
        console.log(`       URL: ${matchingReqs[0]}`);
      } else {
        console.error(`[FAIL] No network request captured for local asset ${img.name}`);
        allPassed = false;
      }
    }

    // Check 2: Confirm NO external requests to Unsplash for these 3 landmarks
    const deprecatedUnsplashSignatures = [
      { name: 'Srinagar (Dal Lake)', sig: 'photo-1598091383021-15ddea10925d' },
      { name: 'Delhi (Humayuns Tomb)', sig: 'photo-1587474260584-136574528ed5' },
      { name: 'Kanyakumari (Vivekananda Rock)', sig: 'photo-1704019541434-550af5403e7f' }
    ];

    for (const dep of deprecatedUnsplashSignatures) {
      const foundOld = allReqUrls.filter(u => u.includes(dep.sig));
      if (foundOld.length === 0) {
        console.log(`[PASS] Zero network requests for old external Unsplash asset for ${dep.name} (${dep.sig})`);
      } else {
        console.error(`[FAIL] Found unexpected external Unsplash request for ${dep.name}: ${foundOld[0]}`);
        allPassed = false;
      }
    }

    // Check 3: Check response headers for local images in CDP
    for (const img of expectedImages) {
      const rawSubstr = `/images/nh44/${img.name}`;
      const encodedSubstr = encodeURIComponent(rawSubstr);
      const resp = cdp.networkResponses.find(r => r.response.url.includes(rawSubstr) || r.response.url.includes(encodedSubstr));
      if (resp) {
        const status = resp.response.status;
        const mime = resp.response.mimeType;
        const ok = (status === 200 && (mime === 'image/webp' || mime === 'image/jpeg' || mime.startsWith('image/')));
        console.log(`[${ok ? 'PASS' : 'FAIL'}] CDP response for ${img.name}: status=${status}, mimeType=${mime}`);
        if (!ok) allPassed = false;
      } else {
        console.error(`[FAIL] No CDP response recorded for ${img.name}`);
        allPassed = false;
      }
    }

  } finally {
    if (cdp) cdp.close();
    if (chromeProc && chromeProc.pid) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', chromeProc.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
        } else {
          chromeProc.kill('SIGTERM');
        }
      } catch {}
    }
    if (serverProc && serverProc.pid) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', serverProc.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
        } else {
          serverProc.kill('SIGTERM');
        }
      } catch {}
    }
  }

  console.log('\n================================================================');
  if (allPassed) {
    console.log('  FINAL VERIFICATION AUDIT: ALL TESTS PASSED (100% SUCCESS)');
  } else {
    console.log('  FINAL VERIFICATION AUDIT: SOME CHECKS FAILED');
  }
  console.log('================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('[FATAL ERROR IN AUDIT RUNNER]:', err);
  process.exit(1);
});
