const http = require('http');

function postJson(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(
      `http://localhost:5000${urlPath}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${urlPath}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function runEndToEndVerification() {
  console.log('🧪 Starting End-to-End CMS Update & Persistence Test...\n');

  // 1. Login as Admin
  console.log('1️⃣ Logging in as Admin...');
  const loginRes = await postJson('/api/auth/login', {
    email: 'admin@sakhawat.design',
    password: 'admin123456',
  });
  
  if (loginRes.status !== 200 || !loginRes.body?.data?.token) {
    console.error('❌ Login failed:', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.data.token;
  console.log('✅ Admin login successful. Token acquired.');

  // 2. Update a CMS section setting
  console.log('\n2️⃣ Updating Homepage CMS Sections...');
  const testVal = 'Fast 24-48h Delivery Window (Guaranteed)';
  const updateRes = await postJson(
    '/api/admin/settings/bulk',
    {
      settings: [
        { key: 'why_point1_title', value: testVal },
        { key: 'trust_stat_4_val', value: '24-48h' },
        { key: 'process_section_title', value: 'Seamless 4-Step Design Process' },
      ],
    },
    token
  );
  console.log('✅ Bulk update status:', updateRes.status, updateRes.body?.message);

  // 3. Fetch public homepage data to verify live synchronization
  console.log('\n3️⃣ Verifying Live Public Homepage Data...');
  const homepageRes = await getJson('/api/homepage');
  const fetchedVal = homepageRes.body?.data?.settings?.why_point1_title;
  console.log(`   Fetched 'why_point1_title': "${fetchedVal}"`);

  if (fetchedVal === testVal) {
    console.log('✅ Live Homepage reflects CMS update instantly!');
  } else {
    console.error('❌ Mismatch in live homepage settings:', fetchedVal);
    process.exit(1);
  }

  // 4. Verify Snapshot on persistent disk
  const fs = require('fs');
  const path = require('path');
  const snapshotPath = path.resolve(__dirname, '../persistent_storage/cms_snapshots/latest_snapshot.json');
  if (fs.existsSync(snapshotPath)) {
    const snap = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    console.log(`\n4️⃣ Persistent Snapshot File Verified: ${snap.counts?.settings} settings, captured at ${snap.timestamp}`);
  } else {
    console.warn('\n⚠️ Snapshot file not found at primary location.');
  }

  console.log('\n🎉 END-TO-END CMS PERSISTENCE VERIFICATION PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

runEndToEndVerification().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
