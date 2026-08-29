const https = require('https');

const urls = [
  'https://res.cloudinary.com/sgmbxuyt/image/upload/v1788003904/sakhawat_portfolio/sitcb6hpwzo404jllkgu.png',
  'https://res.cloudinary.com/sgmbxuyt/image/upload/v1788003909/sakhawat_portfolio/guxswq2vlob2yvos87pj.jpg',
  'https://res.cloudinary.com/sgmbxuyt/image/upload/v1788003897/sakhawat_portfolio/vnfootnxcbilf2dultmd.png',
];

urls.forEach((url) => {
  https.get(url, (res) => {
    console.log(`Cloudinary Asset [${res.statusCode}]: ${url.split('/').pop()} (${res.headers['content-type']}, ${Math.round(res.headers['content-length'] / 1024)} KB)`);
  }).on('error', (err) => console.error(err.message));
});
