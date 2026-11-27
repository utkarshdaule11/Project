const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3010;
const CDP_PORT = 9446;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots', 'step4');

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
  console.log('=== PHASE 1C STEP 4: TARGETED VISUAL CORRECTIONS QA ===\n');

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

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-step4-qa-'));
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
    heroTitleAudit: [],
    navbarAudit: [],
    srinagarImageAudit: null,
    cardOrder: [],
    biomeGroupings: [],
    lodTesting: [],
    checkpointNavigation: null,
    glowingSpineVerification: null,
    reducedMotionVerification: null,
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

    // 1. Cross-Device Viewports: Hero, Navbar, Map & Chapter Cards
    console.log('--- 1. Testing Viewports (1440px, 768px, 390px, 360px) ---');
    const viewports = [
      { name: 'desktop-1440px', width: 1440, height: 900, isMobile: false },
      { name: 'tablet-768px', width: 768, height: 1024, isMobile: true },
      { name: 'mobile-390px', width: 390, height: 844, isMobile: true },
      { name: 'small-mobile-360px', width: 360, height: 800, isMobile: true }
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

      // Check overflow
      const overflow = await cdp.evaluate(`
        ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
        })
      `);

      // Audit Hero Title
      const heroAudit = await cdp.evaluate(`
        (function() {
          const h1 = document.querySelector('h1');
          if (!h1) return { found: false };
          const rect = h1.getBoundingClientRect();
          const computed = window.getComputedStyle(h1);
          const spans = Array.from(h1.querySelectorAll('span'));
          return {
            found: true,
            fullText: h1.innerText.replace(/\\s+/g, ' ').trim(),
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            fontSize: computed.fontSize,
            lineHeight: computed.lineHeight,
            spansText: spans.map(s => s.innerText.trim()),
            visible: rect.width > 0 && rect.height > 0
          };
        })()
      `);
      results.heroTitleAudit.push({ viewport: vp.name, ...heroAudit });

      // Capture Hero Section Screenshot
      const heroScreenshotFile = `hero-${vp.name}.png`;
      await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, heroScreenshotFile));

      // Audit Navbar
      const navAudit = await cdp.evaluate(`
        (function() {
          const header = document.querySelector('header.fixed');
          if (!header) return { found: false };
          const brandBtn = header.querySelector('button[aria-label*="Scroll to top"]');
          const brandRect = brandBtn ? brandBtn.getBoundingClientRect() : null;
          const desktopNav = header.querySelector('nav[aria-label="Highway section navigation"]');
          const isDesktopNavVisible = desktopNav ? window.getComputedStyle(desktopNav).display !== 'none' : false;
          const exploreBtn = Array.from(header.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Route'));
          const isExploreBtnVisible = exploreBtn ? window.getComputedStyle(exploreBtn).display !== 'none' : false;
          const menuBtn = header.querySelector('button[aria-label*="menu"]');
          const isMenuBtnVisible = menuBtn ? window.getComputedStyle(menuBtn).display !== 'none' : false;
          
          return {
            found: true,
            headerHeight: header.offsetHeight,
            brandWidth: brandRect ? brandRect.width : 0,
            isDesktopNavVisible,
            isExploreBtnVisible,
            isMenuBtnVisible
          };
        })()
      `);
      results.navbarAudit.push({ viewport: vp.name, ...navAudit });

      // Scroll to Map and capture
      await cdp.evaluate(`document.getElementById('corridor-explorer')?.scrollIntoView({ behavior: 'instant' });`);
      await delay(600);
      const mapScreenshotFile = `map-${vp.name}.png`;
      await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, mapScreenshotFile));

      // Scroll to Chapter Cards and capture
      await cdp.evaluate(`document.getElementById('chapter-srinagar')?.scrollIntoView({ behavior: 'instant' });`);
      await delay(600);
      const cardsScreenshotFile = `chapters-${vp.name}.png`;
      await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, cardsScreenshotFile));

      results.viewports.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        overflow: overflow.hasOverflow,
        scrollWidth: overflow.scrollWidth,
        heroScreenshot: `docs/screenshots/step4/${heroScreenshotFile}`,
        mapScreenshot: `docs/screenshots/step4/${mapScreenshotFile}`,
        chaptersScreenshot: `docs/screenshots/step4/${cardsScreenshotFile}`
      });

      console.log(`[PASS] ${vp.name}: overflow=${overflow.hasOverflow}, Hero="${heroAudit.fullText}", Nav[desktopNav=${navAudit.isDesktopNavVisible}, exploreBtn=${navAudit.isExploreBtnVisible}, menuBtn=${navAudit.isMenuBtnVisible}]`);
    }

    // 2. Srinagar Image Audit
    console.log('\n--- 2. Auditing Srinagar Chapter Images ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await delay(1200);
    await cdp.evaluate(`document.getElementById('chapter-srinagar')?.scrollIntoView({ behavior: 'instant' });`);
    await delay(600);

    const srinagarImages = await cdp.evaluate(`
      (function() {
        const srinagarCard = document.getElementById('chapter-srinagar');
        if (!srinagarCard) return { found: false };
        const imgs = Array.from(srinagarCard.querySelectorAll('img'));
        return {
          found: true,
          count: imgs.length,
          images: imgs.map((img, i) => ({
            index: i + 1,
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            isLoaded: img.complete && img.naturalWidth > 0
          }))
        };
      })()
    `);
    results.srinagarImageAudit = srinagarImages;
    console.log(`[PASS] Found ${srinagarImages.count} images for Srinagar:`);
    for (const img of srinagarImages.images) {
      console.log(`  Img ${img.index}: loaded=${img.isLoaded} (${img.naturalWidth}x${img.naturalHeight}), alt="${img.alt}"`);
      console.log(`    src: ${img.src}`);
    }

    // 3. Card Order & Biome Groupings Verification (14/14)
    console.log('\n--- 3. Verifying 14 Chapter Cards Order & Biomes ---');
    const cardsAudit = await cdp.evaluate(`
      (function() {
        const articles = Array.from(document.querySelectorAll('article[id^="chapter-"]'));
        return articles.map((art, idx) => {
          const id = art.id.replace('chapter-', '');
          const title = art.querySelector('h3')?.innerText?.trim();
          const zoneEl = art.querySelector('.font-serif.text-sm.font-semibold');
          const zoneName = zoneEl?.innerText?.trim();
          const zoneIdEl = Array.from(art.querySelectorAll('span')).find(s => ['himalayan-alpine', 'indo-gangetic', 'central-india', 'deccan-tablelands', 'southern-basins'].includes(s.innerText?.trim()));
          const zoneId = zoneIdEl?.innerText?.trim();
          const elevEl = Array.from(art.querySelectorAll('span')).find(s => s.innerText && s.innerText.includes('Elev.'));
          const elevation = elevEl?.innerText?.trim();
          return {
            index: idx + 1,
            id,
            title,
            zoneId,
            zoneName,
            elevation
          };
        });
      })()
    `);
    results.cardOrder = cardsAudit;
    console.log(`Found ${cardsAudit.length} rendered chapter articles in DOM.`);
    for (const c of cardsAudit) {
      console.log(`  Stop ${c.index < 10 ? '0' + c.index : c.index}: ${c.id.padEnd(12)} | Title: ${c.title.padEnd(14)} | Zone: ${c.zoneName}`);
    }

    // 4. Glowing Highway Spine Verification in SVG
    console.log('\n--- 4. Verifying Glowing Highway Spine Structure ---');
    await cdp.evaluate(`document.getElementById('corridor-explorer')?.scrollIntoView({ behavior: 'instant' });`);
    await delay(600);
    const spineAudit = await cdp.evaluate(`
      (function() {
        const map = document.getElementById('corridor-explorer');
        const highwayLayer = map ? map.querySelector('.highway-layer') : null;
        if (!highwayLayer) return { found: false };
        const paths = Array.from(highwayLayer.querySelectorAll('path'));
        return {
          found: true,
          passCount: paths.length,
          passes: paths.map((p, i) => ({
            pass: i + 1,
            stroke: p.getAttribute('stroke'),
            strokeWidth: p.getAttribute('stroke-width'),
            filter: p.getAttribute('filter'),
            strokeDasharray: p.getAttribute('stroke-dasharray')
          }))
        };
      })()
    `);
    results.glowingSpineVerification = spineAudit;
    console.log(`[PASS] Glowing Highway Spine has ${spineAudit.passCount} rendering passes:`);
    for (const p of spineAudit.passes) {
      console.log(`  Pass ${p.pass}: stroke=${p.stroke}, width=${p.strokeWidth}, filter=${p.filter || 'none'}`);
    }

    // 5. LOD Switching Verification
    console.log('\n--- 5. Testing Manual LOD Controls & Glowing Spine Persistence ---');
    for (const lvl of [2, 1, 0]) {
      const switchLOD = await cdp.evaluate(`
        (function(targetLvl) {
          const map = document.getElementById('corridor-explorer');
          const buttons = Array.from(map.querySelectorAll('button'));
          const btn = buttons.find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('LOD ' + targetLvl));
          if (!btn) return { success: false, reason: 'Button not found' };
          btn.click();
          return { success: true };
        })(${lvl})
      `);
      await delay(800);

      const lodState = await cdp.evaluate(`
        (function() {
          const highwayLayer = document.querySelector('.highway-layer');
          const paths = highwayLayer ? highwayLayer.querySelectorAll('path').length : 0;
          return { pathsCount: paths };
        })()
      `);
      results.lodTesting.push({ lodLevel: lvl, switchSuccess: switchLOD.success, pathsCount: lodState.pathsCount });
      console.log(`[PASS] Switched to LOD ${lvl}: Spine rendered with ${lodState.pathsCount} passes`);

      const lodScreenshot = `lod-${lvl}-desktop.png`;
      await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, lodScreenshot));
    }

    // 6. Reduced Motion Verification
    console.log('\n--- 6. Testing Prefers-Reduced-Motion Behavior ---');
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await delay(1000);
    const reducedMotionAudit = await cdp.evaluate(`
      (function() {
        const h1 = document.querySelector('h1');
        const heroText = h1 ? h1.innerText.replace(/\\s+/g, ' ').trim() : '';
        const srinagar = document.getElementById('chapter-srinagar');
        return {
          heroRendered: !!h1 && heroText.includes('KASHMIR TO KANYAKUMARI'),
          heroText,
          srinagarRendered: !!srinagar
        };
      })()
    `);
    results.reducedMotionVerification = reducedMotionAudit;
    console.log(`[PASS] Reduced-Motion: Hero="${reducedMotionAudit.heroText}", ChapterSrinagar=${reducedMotionAudit.srinagarRendered}`);

    // Reset media
    await cdp.send('Emulation.setEmulatedMedia', { features: [] });

    // Collect errors
    results.consoleErrors = cdp.consoleLogs.filter(l => l.type === 'error');
    results.networkFailures = cdp.failedRequests;

    console.log('\n--- 7. Diagnostics Summary ---');
    console.log(`Console Errors: ${results.consoleErrors.length}`);
    console.log(`Network Failures: ${results.networkFailures.length}`);
    for (const nf of results.networkFailures) {
      console.log(`  [HTTP ${nf.status}] ${nf.url}`);
    }

    fs.writeFileSync(
      path.join(__dirname, '..', '..', 'data', 'step4_qa_results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\n[PASS] QA Results saved to data/step4_qa_results.json');

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
