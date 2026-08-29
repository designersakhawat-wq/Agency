const http = require('http');

function checkUrl(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, contentType: res.headers['content-type'], length: data.length });
      });
    }).on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

async function testAll() {
  console.log('Testing Live Server Endpoints on http://localhost:5000...');
  
  const endpoints = [
    '/',
    '/api/homepage',
    '/api/settings',
    '/api/projects',
    '/uploads/profile-photo-1787833931978-929342322.jpg',
    '/uploads/logo-png-01-01-1787763443240-155837371.png',
    '/uploads/main-logo-file-04-1787763904733-796883327.png',
  ];

  for (const ep of endpoints) {
    const res = await checkUrl(ep);
    console.log(`Endpoint [${ep}]: Status = ${res.status}, Type = ${res.contentType || 'N/A'}, Size = ${res.length || 0} bytes`);
  }
}

testAll();
