/**
 * Production Endpoints Smoke Test
 * 
 * Verifies that key application routes compile and serve valid HTTP 2xx responses
 * in a production runtime environment.
 * 
 * Usage:
 *   node scripts/test_endpoints.js
 */
const { spawn } = require('child_process');
const http = require('http');

const PORT = parseInt(process.env.PORT || '3002', 10);
const GLOBAL_TIMEOUT_MS = 25000;
const SERVER_READY_TIMEOUT_MS = 15000;
const REQUEST_TIMEOUT_MS = 5000;

const ENDPOINTS_TO_CHECK = [
  '/',
  '/map-test',
  '/styleguide',
];

/**
 * Probes an HTTP endpoint and asserts a 2xx response.
 * @param {string} path - URL path to query.
 * @returns {Promise<{status: number, length: number}>}
 */
function probeEndpoint(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(
            new Error(`Endpoint ${path} returned HTTP ${res.statusCode} (expected 2xx status code)`)
          );
        }
        resolve({ status: res.statusCode, length: data.length });
      });
    });

    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Request to ${path} timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });
  });
}

/**
 * Polls the server until it responds to HTTP requests or times out.
 * @param {number} maxWaitMs - Max milliseconds to wait for readiness.
 */
async function waitForServerReady(maxWaitMs) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      await probeEndpoint('/');
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Server failed to start and respond on port ${PORT} within ${maxWaitMs}ms`);
}

/**
 * Terminates the child process and any spawned child sub-processes.
 * @param {import('child_process').ChildProcess} proc
 */
function cleanupProcess(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', proc.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
    }
  } catch (err) {
    console.error('Error during process cleanup:', err.message);
  }
}

async function runSmokeTest() {
  const nextBin = process.platform === 'win32'
    ? '.\\node_modules\\.bin\\next.cmd'
    : './node_modules/.bin/next';

  console.log(`[SMOKE-TEST] Launching production server on port ${PORT}...`);

  const proc = spawn(nextBin, ['start', '-p', PORT.toString()], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (d) => process.stdout.write(d.toString()));
  proc.stderr.on('data', (d) => process.stderr.write(d.toString()));

  const globalTimeout = setTimeout(() => {
    console.error(`[SMOKE-TEST FAIL] Global test timeout exceeded (${GLOBAL_TIMEOUT_MS}ms). Aborting.`);
    cleanupProcess(proc);
    process.exit(1);
  }, GLOBAL_TIMEOUT_MS);

  let failureEncountered = false;

  try {
    console.log(`[SMOKE-TEST] Waiting for server readiness at http://localhost:${PORT}...`);
    await waitForServerReady(SERVER_READY_TIMEOUT_MS);
    console.log(`[SMOKE-TEST] Server is ready. Probing endpoints...`);

    for (const endpoint of ENDPOINTS_TO_CHECK) {
      const result = await probeEndpoint(endpoint);
      console.log(`[PASS] GET ${endpoint} -> Status: ${result.status} OK, Body: ${result.length} bytes`);
    }

    console.log(`[SMOKE-TEST PASS] All ${ENDPOINTS_TO_CHECK.length} endpoints responded with HTTP 2xx.`);
  } catch (err) {
    console.error(`[SMOKE-TEST FAIL] Smoke test assertion failed:`, err.message || err);
    failureEncountered = true;
  } finally {
    clearTimeout(globalTimeout);
    cleanupProcess(proc);

    // Allow process termination to finalize
    setTimeout(() => {
      process.exit(failureEncountered ? 1 : 0);
    }, 1000);
  }
}

runSmokeTest();
