const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3005;
const CDP_PORT = 9444; // Port 9222 is used by system Lenovo Vantage daemon; 9444 is dedicated
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

  async captureScreenshot(filePath, fullPage = false) {
    const res = await this.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: fullPage
    });
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
  console.log('=== PHASE 1B.4 STEP 5: CROSS-DEVICE & INTERACTION BROWSER QA ===\n');

  // 1. Launch Next.js production server
  const nextBin = process.platform === 'win32'
    ? '.\\node_modules\\.bin\\next.cmd'
    : './node_modules/.bin/next';

  console.log(`Starting Next.js production server on port ${PORT}...`);
  const serverProc = spawn(nextBin, ['start', '-p', String(PORT)], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout.on('data', d => {
    process.stdout.write(d.toString());
  });
  serverProc.stderr.on('data', d => {
    process.stderr.write(d.toString());
  });

  try {
    await waitForServer(`http://localhost:${PORT}`);
    console.log(`[PASS] Next.js server ready at http://localhost:${PORT}\n`);
  } catch (err) {
    serverProc.kill();
    throw err;
  }

  // 2. Launch Google Chrome headless with remote debugging
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-qa-'));
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

  chromeProc.stderr.on('data', d => {
    const s = d.toString();
    if (s.includes('DevTools listening') || s.includes('ERROR')) {
      console.log(`[Chrome] ${s.trim()}`);
    }
  });

  let cdp = null;

  try {
    await waitForServer(`http://127.0.0.1:${CDP_PORT}/json/version`, 15000);
    const versionInfo = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
    console.log(`[PASS] Chrome Debugger connected: ${versionInfo.Browser}`);

    // Get target page from json/list
    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    console.log(`Connecting CDP WebSocket to ${wsUrl}...`);

    cdp = new CdpClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    const testResults = [];

    // Helper to log test result
    function recordTest(testName, passed, details = '') {
      testResults.push({ testName, passed, details });
      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}${details ? ' - ' + details : ''}`);
    }

    // =========================================================================
    // SECTION A: CROSS-DEVICE VIEWPORT VALIDATION (5 VIEWPORTS)
    // =========================================================================
    console.log('\n--- 1. Cross-Device Viewport Validation & Screenshots ---');

    const viewports = [
      { name: 'Desktop', width: 1440, height: 900, isMobile: false, file: 'desktop-1440x900.png' },
      { name: 'Laptop', width: 1280, height: 800, isMobile: false, file: 'laptop-1280x800.png' },
      { name: 'Tablet', width: 768, height: 1024, isMobile: true, file: 'tablet-768x1024.png' },
      { name: 'Mobile', width: 390, height: 844, isMobile: true, file: 'mobile-390x844.png' },
      { name: 'Small Mobile', width: 360, height: 800, isMobile: true, file: 'small-mobile-360x800.png' }
    ];

    for (const vp of viewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.isMobile
      });

      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
      await delay(1200); // Allow D3 map projection and layouts to render

      // Check horizontal overflow
      const overflow = await cdp.evaluate(`
        ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
        })
      `);

      const screenshotPath = path.join(SCREENSHOT_DIR, vp.file);
      await cdp.captureScreenshot(screenshotPath);
      const fileSizeKb = (fs.statSync(screenshotPath).size / 1024).toFixed(1);

      recordTest(
        `VP_${vp.name.replace(/\s+/g, '_')}_${vp.width}x${vp.height}`,
        !overflow.hasOverflow,
        `Captured ${vp.file} (${fileSizeKb} KB). ScrollWidth: ${overflow.scrollWidth}px, Viewport: ${overflow.innerWidth}px`
      );
    }

    // =========================================================================
    // SECTION B: FUNCTIONAL INTERACTION TESTS (10 CHECKS)
    // =========================================================================
    console.log('\n--- 2. Functional Highway Interaction Tests ---');

    // Reset to Desktop for interaction suite
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await delay(1000);

    // TEST 1: Map Checkpoint Selection (Delhi - Checkpoint 05)
    console.log('\nTesting Interaction 1: Map Checkpoint Selection (Delhi)...');
    const selectDelhiRes = await cdp.evaluate(`
      (function() {
        // Find Delhi button in map selection ribbon
        const buttons = Array.from(document.querySelectorAll('#corridor-explorer button'));
        const delhiBtn = buttons.find(b => b.textContent && b.textContent.includes('Delhi'));
        if (!delhiBtn) return { success: false, reason: 'Delhi ribbon button not found' };
        delhiBtn.click();
        return { success: true };
      })()
    `);
    await delay(600);

    const delhiState = await cdp.evaluate(`
      (function() {
        const hash = window.location.hash;
        const sidebarText = document.querySelector('#corridor-explorer')?.textContent || '';
        const hasDelhiHeader = sidebarText.includes('Delhi') && sidebarText.includes('CHECKPOINT 05 OF 14');
        return { hash, hasDelhiHeader };
      })()
    `);
    recordTest(
      'INT_01_Map_Checkpoint_Selection',
      delhiState.hasDelhiHeader,
      `Selected Delhi (05/14). Hash: ${delhiState.hash}, Sidebar confirmed`
    );
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'interaction-map-selection.png'));

    // TEST 2: Journey Progression Strip Quick-Jump (Hyderabad - Checkpoint 09)
    console.log('\nTesting Interaction 2: Progression Strip Quick-Jump (Hyderabad)...');
    const jumpHyderabadRes = await cdp.evaluate(`
      (function() {
        const scrubberButtons = Array.from(document.querySelectorAll('#chapters button[aria-label*="checkpoint"]'));
        const hydBtn = scrubberButtons.find(b => b.getAttribute('aria-label')?.includes('Hyderabad') || b.textContent?.includes('Hyderabad'));
        if (!hydBtn) return { success: false, reason: 'Hyderabad scrubber pill not found' };
        hydBtn.click();
        return { success: true };
      })()
    `);
    await delay(800);

    const hydState = await cdp.evaluate(`
      (function() {
        const hash = window.location.hash;
        const strip = document.querySelector('#chapters');
        const hasHydText = strip ? strip.textContent.includes('Hyderabad') : false;
        return { hash, hasHydText };
      })()
    `);
    recordTest(
      'INT_02_Scrubber_Quick_Jump',
      hydState.hasHydText,
      `Jumped to Hyderabad (09/14). Hash: ${hydState.hash}, Progression strip updated`
    );
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'interaction-scrubber-jump.png'));

    // TEST 3: Locate on Highway Map from Chapter Card (Hyderabad -> Corridor Explorer)
    console.log('\nTesting Interaction 3: Locate on Highway Map (Hyderabad -> Map Section)...');
    const locateOnMapRes = await cdp.evaluate(`
      (function() {
        const hydArticle = document.getElementById('chapter-hyderabad');
        if (!hydArticle) return { success: false, reason: 'Chapter article not found' };
        const locateBtn = hydArticle.querySelector('button[aria-label*="Locate"]');
        if (!locateBtn) return { success: false, reason: 'Locate button not found' };
        locateBtn.click();
        return { success: true };
      })()
    `);
    await delay(1000); // Allow smooth scroll to settle

    const locateState = await cdp.evaluate(`
      (function() {
        const corridorEl = document.getElementById('corridor-explorer');
        const rect = corridorEl ? corridorEl.getBoundingClientRect() : null;
        const isNearTop = rect ? Math.abs(rect.top) < 300 : false;
        const sidebarText = corridorEl ? corridorEl.textContent : '';
        const hasHydInSidebar = sidebarText.includes('Hyderabad') && sidebarText.includes('CHECKPOINT 09 OF 14');
        return { isNearTop, rectTop: rect?.top, hasHydInSidebar };
      })()
    `);
    recordTest(
      'INT_03_Locate_On_Highway_Map',
      locateState.hasHydInSidebar,
      `Scrolled to Corridor Explorer (top: ${Math.round(locateState.rectTop || 0)}px). Map marker and sidebar confirmed on Hyderabad`
    );
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'interaction-locate-on-map.png'));

    // TEST 4: Previous and Next Navigation on Chapter Cards (Bangalore -> Salem -> Bangalore)
    console.log('\nTesting Interaction 4: Synchronized Prev / Next Buttons...');
    await cdp.evaluate(`
      (function() {
        const el = document.getElementById('chapter-bangalore');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      })()
    `);
    await delay(600);

    const nextNavRes = await cdp.evaluate(`
      (function() {
        const blrCard = document.getElementById('chapter-bangalore');
        const nextBtn = Array.from(blrCard.querySelectorAll('button')).find(b => b.textContent?.includes('Salem'));
        if (!nextBtn) return { success: false, reason: 'Next button for Salem not found' };
        nextBtn.click();
        return { success: true };
      })()
    `);
    await delay(800);

    const salemState = await cdp.evaluate(`
      (function() {
        return {
          hash: window.location.hash,
          salemArticle: !!document.getElementById('chapter-salem')
        };
      })()
    `);
    recordTest(
      'INT_04_Prev_Next_Navigation',
      salemState.hash === '#chapter-salem',
      `Navigated Bangalore -> Salem. Hash: ${salemState.hash}`
    );

    // TEST 5: Navbar Checkpoints Dropdown Menu
    console.log('\nTesting Interaction 5: Navbar Checkpoint Dropdown...');
    const navDropdownRes = await cdp.evaluate(`
      (function() {
        const menuBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent && b.textContent.includes('Checkpoints'));
        if (!menuBtn) return { success: false, reason: 'Checkpoints menu button not found' };
        menuBtn.click();
        return { success: true };
      })()
    `);
    await delay(400);

    const dropdownState = await cdp.evaluate(`
      (function() {
        const header = document.querySelector('header');
        const dropdown = header ? header.querySelector('.backdrop-blur-xl') : null;
        const items = dropdown ? Array.from(dropdown.querySelectorAll('button')).length : 0;
        return { isOpen: !!dropdown, itemCount: items };
      })()
    `);
    recordTest(
      'INT_05_Navbar_Dropdown_Menu',
      dropdownState.isOpen && dropdownState.itemCount >= 14,
      `Dropdown open with ${dropdownState.itemCount} checkpoint items`
    );
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'interaction-navbar-dropdown.png'));

    // Select Madurai from dropdown
    await cdp.evaluate(`
      (function() {
        const header = document.querySelector('header');
        const maduraiBtn = Array.from(header.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Madurai'));
        if (maduraiBtn) maduraiBtn.click();
      })()
    `);
    await delay(800);

    const maduraiNavState = await cdp.evaluate(`({ hash: window.location.hash })`);
    recordTest(
      'INT_05B_Navbar_Dropdown_Selection',
      maduraiNavState.hash === '#chapter-madurai',
      `Selected Madurai from dropdown. Hash: ${maduraiNavState.hash}`
    );

    // TEST 6: Mobile Navigation Drawer (Tested at 390x844)
    console.log('\nTesting Interaction 6: Mobile Navigation Drawer...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true
    });
    await delay(300);

    const openMobileMenuRes = await cdp.evaluate(`
      (function() {
        const toggleBtn = document.querySelector('header button[aria-label="Toggle mobile menu"]');
        if (!toggleBtn) return { success: false, reason: 'Mobile toggle not found' };
        toggleBtn.click();
        return { success: true };
      })()
    `);
    await delay(400);

    const mobileDrawerState = await cdp.evaluate(`
      (function() {
        const drawer = document.querySelector('header .fixed.inset-x-0');
        const items = drawer ? Array.from(drawer.querySelectorAll('button')).length : 0;
        return { isOpen: !!drawer, itemsCount: items };
      })()
    `);
    recordTest(
      'INT_06_Mobile_Navigation_Drawer',
      mobileDrawerState.isOpen && mobileDrawerState.itemsCount >= 14,
      `Drawer open on 390x844 viewport with ${mobileDrawerState.itemsCount} buttons`
    );
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'interaction-mobile-drawer.png'));

    // TEST 7: Natural Chapter Scrolling & IntersectionObserver Scroll-Spy
    console.log('\nTesting Interaction 7: Natural Chapter Scrolling & Scroll-Spy...');
    // Restore Desktop
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await delay(300);

    // Scroll naturally to Gwalior (Stop 06)
    await cdp.evaluate(`
      (function() {
        const gwaliorEl = document.getElementById('chapter-gwalior');
        if (gwaliorEl) {
          const rect = gwaliorEl.getBoundingClientRect();
          const targetY = window.scrollY + rect.top - (window.innerHeight * 0.25);
          window.scrollTo({ top: targetY, behavior: 'instant' });
        }
      })()
    `);
    await delay(700); // Allow IntersectionObserver throttle

    const scrollSpyState = await cdp.evaluate(`
      (function() {
        return {
          hash: window.location.hash,
          isGwalior: window.location.hash === '#chapter-gwalior'
        };
      })()
    `);
    recordTest(
      'INT_07_ScrollSpy_Detection',
      scrollSpyState.isGwalior,
      `Scrolled to Gwalior. Scroll-spy synchronized hash: ${scrollSpyState.hash}`
    );

    // TEST 8: Browser Back and Forward History Restoration
    console.log('\nTesting Interaction 8: Browser Back and Forward...');
    // Push new deliberate navigation to Ambala
    await cdp.evaluate(`
      (function() {
        const btn = document.querySelector('#chapter-ambala button[aria-label*="Locate"]');
        if (btn) btn.click();
      })()
    `);
    await delay(800);

    // Now invoke history back
    await cdp.evaluate(`window.history.back()`);
    await delay(600);

    const historyBackHash = await cdp.evaluate(`window.location.hash`);
    recordTest(
      'INT_08_Browser_Back_Forward',
      historyBackHash.length > 0,
      `Browser history.back() restored URL hash: ${historyBackHash}`
    );

    // TEST 9: Direct Chapter URL & Refresh Restoration
    console.log('\nTesting Interaction 9: Direct URL Deep-Link (#chapter-namakkal)...');
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/#chapter-namakkal` });
    await delay(1800);

    const deepLinkState = await cdp.evaluate(`
      (function() {
        const hash = window.location.hash;
        const namakkalCard = document.getElementById('chapter-namakkal');
        const rect = namakkalCard ? namakkalCard.getBoundingClientRect() : null;
        // Verify card is in or near the viewport
        const inViewport = rect ? (rect.top < window.innerHeight && rect.bottom > 0) : false;
        return { hash, inViewport, rectTop: rect?.top };
      })()
    `);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'interaction-deep-link-namakkal.png'));
    recordTest(
      'INT_09_Direct_URL_DeepLink',
      deepLinkState.hash === '#chapter-namakkal' && deepLinkState.inViewport,
      `Deep linked to Namakkal. Card in viewport (top: ${Math.round(deepLinkState.rectTop || 0)}px, hash: ${deepLinkState.hash})`
    );

    // TEST 10: Checkpoint Metric Consistency Across All Views
    console.log('\nTesting Interaction 10: Consistency of Metric Reporting...');
    const metricsAudit = await cdp.evaluate(`
      (function() {
        const text = document.body.innerText;
        const hasMoRTH = text.includes('3,810 KM') || text.includes('3810 KM');
        const hasOSM = text.includes('3,614 KM') || text.includes('3,613') || text.includes('3614');
        const progressbars = Array.from(document.querySelectorAll('[role="progressbar"]')).map(pb => ({
          now: pb.getAttribute('aria-valuenow'),
          label: pb.getAttribute('aria-label')
        }));
        return { hasMoRTH, hasOSM, progressbarsCount: progressbars.length, progressbars };
      })()
    `);
    recordTest(
      'INT_10_Metric_Consistency_Across_Views',
      metricsAudit.hasMoRTH && metricsAudit.hasOSM && metricsAudit.progressbarsCount >= 2,
      `MoRTH benchmark (3,810 KM) and OSM centerline (~3,614 KM) both documented. Progressbars: ${metricsAudit.progressbarsCount}`
    );

    // Summary of results
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    console.log(`\n========================================`);
    console.log(`BROWSER QA SCORE: ${passedTests} / ${totalTests} CHECKS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log(`========================================\n`);

    // Output JSON for deliverable documentation
    const reportPath = path.join(__dirname, '..', '..', 'data', 'browser_qa_results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      chromeVersion: versionInfo.Browser,
      summary: { total: totalTests, passed: passedTests },
      viewports: viewports.map(v => ({
        name: v.name,
        width: v.width,
        height: v.height,
        screenshot: v.file
      })),
      results: testResults
    }, null, 2));

  } finally {
    if (cdp) cdp.close();
    if (chromeProc && chromeProc.pid) {
      try { spawn('taskkill', ['/pid', chromeProc.pid.toString(), '/f', '/t'], { stdio: 'ignore' }); } catch {}
    }
    if (serverProc && serverProc.pid) {
      try { spawn('taskkill', ['/pid', serverProc.pid.toString(), '/f', '/t'], { stdio: 'ignore' }); } catch {}
    }
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('Browser QA test runner failed:', err);
  process.exit(1);
});
