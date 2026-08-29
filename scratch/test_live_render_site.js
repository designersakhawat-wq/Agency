const https = require('https');

function checkRemoteUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({ url, status: res.statusCode, contentType: res.headers['content-type'], length: data.length });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 408, error: 'Request Timeout' });
    });
    req.on('error', (err) => {
      resolve({ url, status: 500, error: err.message });
    });
  });
}

async function runLiveCheck() {
  console.log('🌐 Checking Live Render Deployment at https://agency-opa0.onrender.com...\n');
  
  const endpoints = [
    'https://agency-opa0.onrender.com/',
    'https://agency-opa0.onrender.com/portfolio',
    'https://agency-opa0.onrender.com/about',
    'https://agency-opa0.onrender.com/services/logo-branding',
    'https://agency-opa0.onrender.com/admin/login',
    'https://agency-opa0.onrender.com/admin/media',
    'https://agency-opa0.onrender.com/api/homepage',
    'https://agency-opa0.onrender.com/api/settings',
    'https://agency-opa0.onrender.com/api/projects',
  ];

  for (const ep of endpoints) {
    const res = await checkRemoteUrl(ep);
    const mark = res.status >= 200 && res.status < 400 ? '✅' : '❌';
    console.log(`${mark} [${res.status}] ${ep} (${res.contentType || 'N/A'}, ${Math.round((res.length || 0) / 1024)} KB)`);
  }
}

runLiveCheck();
