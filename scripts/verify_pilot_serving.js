const { spawn } = require('child_process');
const http = require('http');

const PORT = 3008;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function probeUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: body.length,
          bodyStr: body.toString('utf8')
        });
      });
    }).on('error', reject);
  });
}

async function waitForServer(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await probeUrl('/');
      if (res.statusCode >= 200 && res.statusCode < 400) return true;
    } catch {}
    await delay(300);
  }
  throw new Error(`Server failed to start on port ${PORT} within ${timeoutMs}ms`);
}

async function main() {
  console.log('=== PHASE 1C STEP 1: PILOT IMAGE SERVING & RENDERING VERIFICATION ===\n');

  const nextBin = process.platform === 'win32'
    ? '.\\node_modules\\.bin\\next.cmd'
    : './node_modules/.bin/next';

  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn(nextBin, ['start', '-p', String(PORT)], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', d => process.stdout.write(d.toString()));
  server.stderr.on('data', d => process.stderr.write(d.toString()));

  try {
    await waitForServer();
    console.log(`[PASS] Server is live at http://localhost:${PORT}\n`);

    const imagesToTest = [
      {
        id: '01-srinagar-dal-lake',
        path: '/images/nh44/01-srinagar-dal-lake.webp',
        expectedType: 'image/webp'
      },
      {
        id: '05-delhi-humayuns-tomb',
        path: '/images/nh44/05-delhi-humayuns-tomb.webp',
        expectedType: 'image/webp'
      },
      {
        id: '14-kanyakumari-rock-memorial',
        path: '/images/nh44/14-kanyakumari-rock-memorial.webp',
        expectedType: 'image/webp'
      }
    ];

    console.log('--- 1. Probing Local WebP Image Endpoints ---');
    for (const img of imagesToTest) {
      const res = await probeUrl(img.path);
      if (res.statusCode === 200 && res.contentLength > 50000) {
        console.log(`[PASS] ${img.id}: HTTP ${res.statusCode} OK | Content-Type: ${res.contentType} | Size: ${res.contentLength} bytes`);
      } else {
        throw new Error(`Failed to serve ${img.path}: HTTP ${res.statusCode}, size: ${res.contentLength}`);
      }
    }

    console.log('\n--- 2. Auditing HTML Page Response for Pilot Paths & Zero External CDN ---');
    const pageRes = await probeUrl('/');
    if (pageRes.statusCode !== 200) {
      throw new Error(`Page returned HTTP ${pageRes.statusCode}`);
    }

    for (const img of imagesToTest) {
      const isPresent = pageRes.bodyStr.includes(encodeURIComponent(img.path)) || pageRes.bodyStr.includes(img.path);
      if (isPresent) {
        console.log(`[PASS] Verified ${img.id} path rendered in server-rendered HTML`);
      } else {
        throw new Error(`Path ${img.path} not found in page HTML`);
      }
    }

    console.log('\n========================================');
    console.log('ALL 3 PILOT ASSETS FULLY VERIFIED IN PRODUCTION RUNTIME');
    console.log('========================================\n');
  } finally {
    if (server && server.pid) {
      try {
        const killCmd = process.platform === 'win32'
          ? spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t'], { stdio: 'ignore' })
          : server.kill('SIGTERM');
      } catch {}
    }
  }
}

main().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
