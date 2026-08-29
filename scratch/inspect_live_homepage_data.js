const https = require('https');

https.get('https://agency-opa0.onrender.com/api/homepage', (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const data = json.data;
      console.log('--- LIVE RENDER SITE STATUS ---');
      console.log('Site Title:', data.settings.site_title);
      console.log('Hero Designer Name:', data.settings.hero_designer_name);
      console.log('Hero Title:', data.settings.hero_title);
      console.log('Hero Image:', data.settings.hero_image);
      console.log('About Image:', data.settings.about_image);
      console.log('Site Logo:', data.settings.site_logo);
      console.log('Total Projects:', data.projects.length);
      console.log('Total Services:', data.services.length);
      console.log('Total Testimonials:', data.testimonials.length);
      console.log('Total Brands:', data.brands.length);
      console.log('-------------------------------');
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', console.error);
