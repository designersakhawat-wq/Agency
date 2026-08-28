const prisma = require('../src/config/db');

async function run() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  console.log('MEDIA COUNT:', media.length);
  media.forEach(m => {
    console.log('  [' + m.id.slice(0, 8) + '] ' + m.fileName + ' -> ' + m.fileUrl + ' (' + m.source + ')');
  });

  const projects = await prisma.project.findMany();
  console.log('\nPROJECTS:', projects.length);
  projects.forEach(p => {
    console.log('  [' + p.id.slice(0, 8) + '] ' + p.title + ' -> cover: ' + p.coverImage);
  });

  const brands = await prisma.clientBrand.findMany();
  console.log('\nBRANDS:', brands.length);
  brands.forEach(b => {
    console.log('  [' + b.id.slice(0, 8) + '] ' + b.name + ' -> ' + b.logoUrl);
  });

  const testimonials = await prisma.testimonial.findMany();
  console.log('\nTESTIMONIALS:', testimonials.length);
  testimonials.forEach(t => {
    console.log('  [' + t.id.slice(0, 8) + '] ' + t.clientName + ' avatar:' + (t.clientAvatar || 'null') + ' brand:' + (t.brandLogo || 'null'));
  });

  const settings = await prisma.siteSetting.findMany();
  const imageKeys = settings.filter(s => s.value && (s.value.includes('/uploads/') || s.value.includes('unsplash') || s.key.includes('image') || s.key.includes('logo') || s.key.includes('favicon') || s.key.includes('avatar')));
  console.log('\nIMAGE-RELATED SETTINGS:', imageKeys.length);
  imageKeys.forEach(s => {
    console.log('  ' + s.key + ' = ' + s.value.slice(0, 100));
  });

  // Check physical uploads
  const fs = require('fs');
  const path = require('path');
  const { UPLOADS_DIR } = require('../src/config/persistentStorage');
  const files = fs.readdirSync(UPLOADS_DIR).filter(f => !f.startsWith('.'));
  console.log('\nPHYSICAL FILES IN UPLOADS:', files.length);
  files.forEach(f => {
    const stat = fs.statSync(path.join(UPLOADS_DIR, f));
    console.log('  ' + f + ' (' + Math.round(stat.size / 1024) + ' KB)');
  });

  // Cross-reference: which DB media entries have missing files?
  console.log('\n--- INTEGRITY CHECK ---');
  let missingFiles = 0;
  let orphanFiles = 0;
  const dbUrls = new Set(media.map(m => m.fileUrl));
  
  for (const m of media) {
    if (m.source === 'LOCAL' && m.fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(m.fileUrl);
      const exists = fs.existsSync(path.join(UPLOADS_DIR, filename));
      if (!exists) {
        console.log('  MISSING FILE: ' + m.fileUrl + ' (DB record exists but file missing)');
        missingFiles++;
      }
    }
  }

  for (const f of files) {
    const url = '/uploads/' + f;
    if (!dbUrls.has(url)) {
      console.log('  ORPHAN FILE: ' + url + ' (file exists but no DB record)');
      orphanFiles++;
    }
  }

  console.log('\nSUMMARY:');
  console.log('  Media DB records: ' + media.length);
  console.log('  Physical files: ' + files.length);
  console.log('  Missing files: ' + missingFiles);
  console.log('  Orphan files: ' + orphanFiles);

  await prisma.$disconnect();
}

run().catch(console.error);
