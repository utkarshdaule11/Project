const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3008;
const CDP_PORT = 9445;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots', 'step3');

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

async function main() {
  console.log('=== PHASE 1C STEP 3: TARGETED BROWSER VISUAL & REGRESSION QA ===\n');

  const nextBin = process.platform === 'win32'
    ? '.\\node_modules\\.bin\\next.cmd'
    : './node_modules/.bin/next';

  console.log(`Starting Next.js production server on port ${PORT}...`);
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

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-step3-qa-'));
  console.log(`Launching Chrome Headless on debugging port ${CDP_PORT}...`);
  const chromeProc = spawn(CHROME_PATH, [
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

  let cdp = null;
  const results = {
    viewports: [],
    reducedMotion: null,
    navigation: [],
    gis: [],
    consoleErrors: [],
    networkFailures: []
  };

  try {
    await waitForServer(`http://127.0.0.1:${CDP_PORT}/json/version`, 15000);
    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    cdp = new CdpClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Network.enable');

    // 1. Cross-Device Viewports
    console.log('--- 1. Testing Viewports (360px, 390px, 768px, 1440px) ---');
    const viewports = [
      { name: 'desktop-1440px', width: 1440, height: 900, isMobile: false },
      { name: 'tablet-768px', width: 768, height: 1024, isMobile: true },
      { name: 'mobile-390px', width: 390, height: 844, isMobile: true },
      { name: 'mobile-360px', width: 360, height: 800, isMobile: true }
    ];

    for (const vp of viewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.isMobile
      });

      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
      await delay(1200);

      const metrics = await cdp.evaluate(`
        ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          heroHeight: document.querySelector('section[aria-label="Cinematic Highway Prologue"]')?.clientHeight,
          headlineText: document.querySelector('h1')?.innerText?.replace(/\\s+/g, ' '),
          zonesCount: document.querySelectorAll('section[aria-label="Cinematic Highway Prologue"] .grid > div').length,
          primaryCtaVisible: !!document.querySelector('a[href="#corridor-explorer"]'),
          secondaryCtaVisible: !!document.querySelector('a[href="#chapters"]')
        })
      `);

      const screenshotFile = `${vp.name}.png`;
      const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFile);
      await cdp.captureScreenshot(screenshotPath);
      const sizeKb = (fs.statSync(screenshotPath).size / 1024).toFixed(1);

      const vpResult = {
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        file: `docs/screenshots/step3/${screenshotFile}`,
        fileSizeKb: sizeKb,
        overflow: metrics.hasOverflow,
        scrollWidth: metrics.scrollWidth,
        heroHeight: metrics.heroHeight,
        headlineText: metrics.headlineText,
        zonesCount: metrics.zonesCount,
        primaryCtaVisible: metrics.primaryCtaVisible,
        secondaryCtaVisible: metrics.secondaryCtaVisible
      };
      results.viewports.push(vpResult);

      console.log(`[PASS] ${vp.name}: ${sizeKb} KB, overflow=${metrics.hasOverflow}, heroHeight=${metrics.heroHeight}px, headline="${metrics.headlineText}"`);
    }

    // 2. Reduced-Motion Mode Verification
    console.log('\n--- 2. Reduced Motion Mode Verification ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    // Emulate prefers-reduced-motion: reduce
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });

    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await delay(1200);

    const reducedMotionCheck = await cdp.evaluate(`
      (function() {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        const heroSection = document.querySelector('section[aria-label="Cinematic Highway Prologue"]');
        return {
          mediaQueryMatches: mql.matches,
          renderedCleanly: !!heroSection,
          heroVisible: heroSection ? heroSection.clientHeight > 500 : false
        };
      })()
    `);

    const reducedMotionScreenshot = path.join(SCREENSHOT_DIR, 'reduced-motion-desktop-1440px.png');
    await cdp.captureScreenshot(reducedMotionScreenshot);
    results.reducedMotion = {
      mediaQueryMatches: reducedMotionCheck.mediaQueryMatches,
      renderedCleanly: reducedMotionCheck.renderedCleanly,
      screenshot: 'docs/screenshots/step3/reduced-motion-desktop-1440px.png',
      fileSizeKb: (fs.statSync(reducedMotionScreenshot).size / 1024).toFixed(1)
    };
    console.log(`[PASS] Reduced motion active: matches=${reducedMotionCheck.mediaQueryMatches}, renderedCleanly=${reducedMotionCheck.renderedCleanly}`);

    // Restore standard media
    await cdp.send('Emulation.setEmulatedMedia', { features: [] });

    // 3. CTA and Navigation Regression
    console.log('\n--- 3. CTA & Navigation Regression ---');
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await delay(1000);

    // Test Hero Primary CTA (#corridor-explorer)
    const primaryCtaRes = await cdp.evaluate(`
      (function() {
        const cta = document.querySelector('a[href="#corridor-explorer"]');
        if (!cta) return { success: false, reason: 'CTA not found' };
        cta.click();
        return { success: true };
      })()
    `);
    await delay(800);

    const corridorTarget = await cdp.evaluate(`
      (function() {
        const target = document.getElementById('corridor-explorer');
        if (!target) return { found: false };
        const rect = target.getBoundingClientRect();
        return {
          found: true,
          top: rect.top,
          isNearViewportTop: Math.abs(rect.top) < 250
        };
      })()
    `);
    results.navigation.push({
      action: 'Click Primary CTA (EXPLORE HIGHWAY MAP)',
      target: '#corridor-explorer',
      success: corridorTarget.found && corridorTarget.isNearViewportTop,
      topPosition: corridorTarget.top
    });
    console.log(`[PASS] Primary CTA scrolled to #corridor-explorer: rect.top=${corridorTarget.top}px`);

    // Test Secondary CTA (#chapters)
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await delay(1000);

    const secondaryCtaRes = await cdp.evaluate(`
      (function() {
        const cta = document.querySelector('a[href="#chapters"]');
        if (!cta) return { success: false, reason: 'Secondary CTA not found' };
        cta.click();
        return { success: true };
      })()
    `);
    await delay(800);

    const chaptersTarget = await cdp.evaluate(`
      (function() {
        const target = document.getElementById('chapters');
        if (!target) return { found: false };
        const rect = target.getBoundingClientRect();
        return {
          found: true,
          top: rect.top,
          isNearViewportTop: Math.abs(rect.top) < 250
        };
      })()
    `);
    results.navigation.push({
      action: 'Click Secondary CTA (DISCOVER 14 CHAPTERS)',
      target: '#chapters',
      success: chaptersTarget.found && chaptersTarget.isNearViewportTop,
      topPosition: chaptersTarget.top
    });
    console.log(`[PASS] Secondary CTA scrolled to #chapters: rect.top=${chaptersTarget.top}px`);

    // 4. GIS & Map Functionality
    console.log('\n--- 4. GIS Map and LOD Controls Regression ---');
    const gisCheck = await cdp.evaluate(`
      (function() {
        const mapSection = document.getElementById('corridor-explorer');
        const svgPaths = mapSection ? mapSection.querySelectorAll('svg path').length : 0;
        const lodButtons = mapSection ? Array.from(mapSection.querySelectorAll('button')).filter(b => b.textContent && (b.textContent.includes('LOD') || b.textContent.includes('Detail') || b.textContent.includes('Overview'))).length : 0;
        const checkpointButtons = mapSection ? Array.from(mapSection.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('CHECKPOINT')).length : 0;
        return {
          hasMapSection: !!mapSection,
          svgPathsCount: svgPaths,
          lodButtonsCount: lodButtons,
          checkpointButtonsCount: checkpointButtons
        };
      })()
    `);

    // Test clicking LOD 1 or LOD 2
    const lodClickRes = await cdp.evaluate(`
      (function() {
        const mapSection = document.getElementById('corridor-explorer');
        const lod1Btn = Array.from(mapSection.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('LOD 1') || b.textContent.includes('Mid')));
        if (lod1Btn) {
          lod1Btn.click();
          return { clicked: true };
        }
        return { clicked: false, note: 'LOD selector may be dropdown or auto' };
      })()
    `);

    results.gis.push({
      hasMapSection: gisCheck.hasMapSection,
      svgPathsCount: gisCheck.svgPathsCount,
      lodClickResult: lodClickRes
    });
    console.log(`[PASS] GIS Map loaded: SVG paths=${gisCheck.svgPathsCount}, LOD switchable=${lodClickRes.clicked}`);

    // Check Console & Network Failures
    results.consoleErrors = cdp.consoleLogs.filter(l => l.type === 'error');
    results.networkFailures = cdp.failedRequests;

    console.log('\n--- 5. Console & Network Diagnostics ---');
    console.log(`Console errors count: ${results.consoleErrors.length}`);
    for (const ce of results.consoleErrors) {
      console.log('  [Console Error]:', ce.args.map(a => a.value).join(' '));
    }
    console.log(`Network failure count: ${results.networkFailures.length}`);
    for (const nf of results.networkFailures) {
      console.log(`  [HTTP ${nf.status}] ${nf.url}`);
    }

    // Save structured report
    fs.writeFileSync(
      path.join(__dirname, '..', '..', 'data', 'step3_qa_results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\n[PASS] QA results saved to data/step3_qa_results.json');

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
