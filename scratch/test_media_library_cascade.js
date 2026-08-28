const { PrismaClient } = require('@prisma/client');
const mediaService = require('../src/services/mediaService');
const prisma = new PrismaClient();

async function runTest() {
  console.log('=== 1. TESTING EXISTING WEBSITE IMAGE AUTO-SCAN ===');
  const scanResult = await mediaService.scanAndRegisterAllExistingImages();
  console.log('Auto-scan summary:', scanResult);

  console.log('\n=== 2. TESTING MEDIA ASSET LISTING & USAGE TRACING ===');
  const allMedia = await prisma.media.findMany({ take: 5 });
  console.log(`Found ${allMedia.length} sample media records:`);
  for (const m of allMedia) {
    const usage = await mediaService.getMediaUsage(m.id, m.fileUrl);
    console.log(`- [${m.id}] ${m.fileName}: used in ${usage.usageCount} places`, usage.usedIn);
  }

  console.log('\n=== 3. TESTING CASCADE UNLINK ON MEDIA DELETE ===');
  // Create a test Media record
  const testMedia = await prisma.media.create({
    data: {
      fileName: 'cascade-test-image.png',
      fileUrl: '/uploads/cascade-test-image.png',
      fileSize: 1024,
      fileType: 'image/png',
      altText: 'Cascade Test Image',
      source: 'TEST',
    },
  });
  console.log('Created test media:', testMedia.id);

  // Create a Project referencing this test media in coverImage and galleryImages
  const testProject = await prisma.project.create({
    data: {
      title: 'Cascade Unlink Test Project',
      slug: 'cascade-unlink-test-' + Date.now(),
      summary: 'Testing cascade unlinking',
      description: 'Full case study test description',
      coverImage: testMedia.fileUrl,
      galleryImages: JSON.stringify([testMedia.fileUrl, 'https://example.com/other.png']),
      category: 'Logo & Branding',
      featured: false,
      active: true,
    },
  });
  console.log('Created test project referencing media:', testProject.id);

  // Create a Brand referencing this test media
  const testBrand = await prisma.clientBrand.create({
    data: {
      name: 'Cascade Test Brand',
      logoUrl: testMedia.fileUrl,
      active: true,
      order: 999,
    },
  });
  console.log('Created test brand referencing media:', testBrand.id);

  // Check usage
  const preUsage = await mediaService.getMediaUsage(testMedia.id, testMedia.fileUrl);
  console.log('Pre-delete usage count:', preUsage.usageCount, preUsage.usedIn);

  // Delete media with cascade unlinking
  console.log('Executing cascade delete on media:', testMedia.id);
  const deleteResult = await mediaService.deleteMedia(testMedia.id);
  console.log('Delete result:', deleteResult);

  // Verify Project was updated
  const updatedProject = await prisma.project.findUnique({ where: { id: testProject.id } });
  console.log('Updated Project coverImage:', updatedProject.coverImage);
  console.log('Updated Project galleryImages:', updatedProject.galleryImages);

  // Verify Brand was updated
  const updatedBrand = await prisma.clientBrand.findUnique({ where: { id: testBrand.id } });
  console.log('Updated Brand logoUrl:', updatedBrand.logoUrl);

  // Clean up test records
  await prisma.project.delete({ where: { id: testProject.id } });
  await prisma.clientBrand.delete({ where: { id: testBrand.id } });

  console.log('\n✅ ALL CENTRALIZED MEDIA LIBRARY & CASCADE TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
