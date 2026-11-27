const { spawn } = require('child_process');
const http = require('http');

const PORT = 3004;

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
          status: res.statusCode,
          headers: res.headers,
          length: body.length,
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
      if (res.status >= 200 && res.status < 400) return true;
    } catch {}
    await delay(300);
  }
  throw new Error(`Server failed to start on port ${PORT} within ${timeoutMs}ms`);
}

async function main() {
  console.log('=== PILOT IMAGE ASSET VERIFICATION ===\n');

  const nextBin = process.platform === 'win32'
    ? '.\\node_modules\\.bin\\next.cmd'
    : './node_modules/.bin/next';

  console.log(`Starting production server on port ${PORT}...`);
  const proc = spawn(nextBin, ['start', '-p', PORT.toString()], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  proc.stdout.on('data', d => process.stdout.write(d.toString()));
  proc.stderr.on('data', d => process.stderr.write(d.toString()));

  try {
    await waitForServer();
    console.log(`[PASS] Server is live on port ${PORT}\n`);

    const pilotImages = [
      { id: 'Srinagar (Stop 01)', path: '/images/nh44/01-srinagar-dal-lake.webp' },
      { id: 'Delhi (Stop 05)', path: '/images/nh44/05-delhi-humayuns-tomb.webp' },
      { id: 'Kanyakumari (Stop 14)', path: '/images/nh44/14-kanyakumari-rock-memorial.webp' }
    ];

    console.log('1. Probing Local WebP Image Endpoints:');
    for (const item of pilotImages) {
      const res = await probeUrl(item.path);
      if (res.status === 200 && res.length > 50000) {
        console.log(`[PASS] ${item.id}: HTTP ${res.status} OK | Size: ${res.length} bytes | Content-Type: ${res.headers['content-type']}`);
      } else {
        throw new Error(`Failed to serve ${item.path}: Status ${res.status}, size ${res.length}`);
      }
    }

    console.log('\n2. Verifying Next.js Server-Rendered HTML:');
    const page = await probeUrl('/');
    for (const item of pilotImages) {
      // Next.js Image component encodes URLs in srcset / src or renders raw path
      const encoded = encodeURIComponent(item.path);
      const isReferenced = page.bodyStr.includes(item.path) || page.bodyStr.includes(encoded);
      if (isReferenced) {
        console.log(`[PASS] Verified ${item.id} image path is referenced in page markup`);
      } else {
        throw new Error(`Expected image path ${item.path} not found in page HTML`);
      }
    }

    // Verify that the old Unsplash URLs for these three landmarks are no longer in the HTML
    const oldUnsplashUrls = [
      'photo-1598091383021-15ddea10925d', // Old Srinagar landmark
      'photo-1587474260584-136574528ed5', // Old Delhi landmark
      'photo-1704019541434-550af5403e7f'  // Old Kanyakumari landmark
    ];

    console.log('\n3. Verifying Zero External CDN Hotlinks for Pilot Landmarks:');
    for (const oldUrl of oldUnsplashUrls) {
      // Note: Hero may still use a background image until Step 3, but the chapter cards must not use these three old URLs
      // Let's check specifically if the chapter card section contains them
      const cardSection = page.bodyStr.substring(page.bodyStr.indexOf('id="chapters"'));
      const hasOldUrl = cardSection.includes(oldUrl);
      if (!hasOldUrl) {
        console.log(`[PASS] Confirmed old external Unsplash asset (${oldUrl}) is eliminated from chapter cards`);
      } else {
        throw new Error(`Old Unsplash asset ${oldUrl} was still found in chapters markup`);
      }
    }

    console.log('\n========================================');
    console.log('PILOT VERIFICATION: ALL CHECKS PASSED (3/3)');
    console.log('========================================\n');
  } finally {
    if (proc && proc.pid) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', proc.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
      } else {
        proc.kill('SIGTERM');
      }
    }
  }
}

main().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
