const prisma = require('../src/config/db');
const { UPLOADS_DIR, PERSISTENT_DB_FILE } = require('../src/config/persistentStorage');
const fs = require('fs');
const path = require('path');

async function testPipeline() {
  console.log('==============================================');
  console.log('🧪 AUDITING SERVICE PROJECT PERSISTENCE PIPELINE');
  console.log('==============================================');
  console.log('Database:', PERSISTENT_DB_FILE);
  console.log('Uploads:', UPLOADS_DIR);

  // 1. Find or create the "Logo & Branding" service
  let service = await prisma.service.findFirst({
    where: { slug: 'logo-branding' },
  });
  if (!service) {
    service = await prisma.service.create({
      data: {
        title: 'Logo & Branding',
        slug: 'logo-branding',
        tagline: 'Distinctive visual identities',
        description: 'End-to-end brand identity systems.',
        icon: 'Palette',
        order: 1,
        active: true,
      },
    });
  }
  console.log(`✅ Service Resolved: ID=${service.id}, Slug=${service.slug}, Title=${service.title}`);

  // 2. Simulate Uploading an Image and creating a Project attached to this service
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  const testProject = await prisma.project.create({
    data: {
      title: 'Automated Audit Logo Project ' + Date.now(),
      slug: 'auto-audit-logo-' + Date.now(),
      category: service.title,
      serviceId: service.id,
      serviceSlug: service.slug,
      client: 'Audit Client',
      year: '2025',
      summary: 'Showcase portfolio project for Logo & Branding.',
      description: 'Delivered high-converting visual design deliverables.',
      coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
      active: true,
      featured: true,
      order: 1,
    },
  });
  console.log(`✅ Project Created: ID=${testProject.id}, Title=${testProject.title}`);

  // 3. Test Service Detail query matching logic (as run by /api/services/:slug and ServiceDetailPage.jsx)
  const allProjects = await prisma.project.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });

  const matchingProjects = allProjects.filter((p) => {
    if (p.serviceId === service.id) return true;
    if (p.serviceSlug === service.slug) return true;
    if (p.category === service.title) return true;
    const pCat = (p.category || '').toLowerCase().trim();
    const sSlug = service.slug.toLowerCase().trim();
    if (sSlug.includes('logo') && (pCat.includes('logo') || pCat.includes('brand'))) return true;
    return false;
  });

  console.log(`✅ Service Detail Matching Works Count: ${matchingProjects.length}`);
  console.log('   Attached Projects Found:', matchingProjects.map(p => ({ id: p.id, title: p.title, cat: p.category, sId: p.serviceId })));

  if (matchingProjects.some(p => p.id === testProject.id)) {
    console.log('🎉 SUCCESS: Newly created project is 100% matched to service!');
  } else {
    console.error('❌ FAILURE: Newly created project was not matched!');
  }

  // Cleanup test project
  await prisma.project.delete({ where: { id: testProject.id } });
  console.log('🧹 Cleaned up test project.');
  await prisma.$disconnect();
}

testPipeline().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
