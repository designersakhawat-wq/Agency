const prisma = require('../src/config/db');

async function fixDatabase() {
  console.log('=== Phase 1: Database Cleanup ===\n');

  // 1. Fix 3 projects with Unsplash covers
  console.log('1. Fixing project cover images...');
  
  const projectFixes = [
    {
      id: '312deb7b-9950-47a6-a0c1-1721a34d12b1', // Kenakata Shop
      coverImage: '/uploads/9062-laptop-mockup-v2-1787833949708-949730261.jpg',
    },
    {
      id: '62d57c47-381b-4e51-ad9a-3ca83b1a9db7', // Advanced Digital Automotive
      coverImage: '/uploads/logo-new-01-01-1787835006263-396457564.jpg',
    },
    {
      id: 'c625f31a-a3e7-4ea9-ade2-bfa0602c428a', // Optiva Max
      coverImage: '/uploads/cover-photo-1787764748710-758629908.jpg',
    },
  ];

  for (const fix of projectFixes) {
    try {
      const project = await prisma.project.findUnique({ where: { id: fix.id } });
      if (project) {
        await prisma.project.update({
          where: { id: fix.id },
          data: { coverImage: fix.coverImage },
        });
        console.log('  ✅ ' + project.title + ' -> ' + fix.coverImage);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not fix project ' + fix.id + ': ' + e.message);
    }
  }

  // 2. Set testimonial avatars to null (stock photos)
  console.log('\n2. Clearing Unsplash testimonial avatars...');
  const testimonials = await prisma.testimonial.findMany();
  for (const t of testimonials) {
    if (t.clientAvatar && t.clientAvatar.includes('unsplash.com')) {
      await prisma.testimonial.update({
        where: { id: t.id },
        data: { clientAvatar: null },
      });
      console.log('  ✅ Cleared avatar for: ' + t.clientName);
    }
  }

  // 3. Add/fix about_image setting
  console.log('\n3. Setting about_image...');
  const aboutImageSetting = await prisma.siteSetting.findUnique({ where: { key: 'about_image' } });
  if (!aboutImageSetting) {
    await prisma.siteSetting.create({
      data: {
        key: 'about_image',
        value: '/uploads/profile-photo-1787833931978-929342322.jpg',
      },
    });
    console.log('  ✅ Created about_image setting');
  } else if (aboutImageSetting.value.includes('unsplash.com') || !aboutImageSetting.value || aboutImageSetting.value === '') {
    await prisma.siteSetting.update({
      where: { key: 'about_image' },
      data: { value: '/uploads/profile-photo-1787833931978-929342322.jpg' },
    });
    console.log('  ✅ Updated about_image setting');
  } else {
    console.log('  ℹ️ about_image already set: ' + aboutImageSetting.value);
  }

  // 4. Verify no Unsplash URLs remain in database
  console.log('\n4. Verifying database is Unsplash-free...');
  
  const projects = await prisma.project.findMany();
  let unsplashCount = 0;
  for (const p of projects) {
    if (p.coverImage && p.coverImage.includes('unsplash.com')) {
      console.log('  ❌ Project still has Unsplash: ' + p.title);
      unsplashCount++;
    }
  }

  const brands = await prisma.clientBrand.findMany();
  for (const b of brands) {
    if (b.logoUrl && b.logoUrl.includes('unsplash.com')) {
      console.log('  ❌ Brand still has Unsplash: ' + b.name);
      unsplashCount++;
    }
  }

  const settings = await prisma.siteSetting.findMany();
  for (const s of settings) {
    if (s.value && s.value.includes('unsplash.com')) {
      console.log('  ❌ Setting still has Unsplash: ' + s.key);
      unsplashCount++;
    }
  }

  const testimonialsCheck = await prisma.testimonial.findMany();
  for (const t of testimonialsCheck) {
    if ((t.clientAvatar && t.clientAvatar.includes('unsplash.com')) ||
        (t.brandLogo && t.brandLogo.includes('unsplash.com'))) {
      console.log('  ❌ Testimonial still has Unsplash: ' + t.clientName);
      unsplashCount++;
    }
  }

  if (unsplashCount === 0) {
    console.log('  ✅ Database is 100% Unsplash-free!');
  } else {
    console.log('  ⚠️ ' + unsplashCount + ' Unsplash references still found');
  }

  await prisma.$disconnect();
  console.log('\n=== Phase 1 Complete ===');
}

fixDatabase().catch(console.error);
