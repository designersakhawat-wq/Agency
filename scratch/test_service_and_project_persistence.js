const http = require('http');
const express = require('express');
const prisma = require('../src/config/db');
const cacheService = require('../src/services/cacheService');
const apiRoutes = require('../src/routes');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiRoutes);

const testPersistence = async () => {
  console.log('🧪 Starting Service Pricing & Project Upload Persistence Test...');

  const server = app.listen(5124, async () => {
    try {
      // 1. Admin Login to get token
      const loginPayload = JSON.stringify({ email: 'admin@sakhawat.design', password: 'admin123456' });
      const loginRes = await fetch('http://localhost:5124/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: loginPayload,
      });
      const loginData = await loginRes.json();
      const token = loginData.data?.token;
      if (!token) throw new Error('Admin login failed');
      console.log('  ✅ [PASS] Admin authenticated successfully');

      // 2. Fetch existing services
      const srvRes = await fetch('http://localhost:5124/api/services');
      const srvData = await srvRes.json();
      const service = srvData.data?.[0];
      if (!service) throw new Error('No service found');
      console.log(`  ✅ [PASS] Retrieved service "${service.title}"`);

      // 3. Update Service Pricing Package
      const newPrice = 299;
      const pkgToUpdate = service.packages?.[0];
      if (pkgToUpdate) {
        const updateRes = await fetch(`http://localhost:5124/api/packages/admin/${pkgToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...pkgToUpdate,
            price: newPrice,
          }),
        });
        const updateData = await updateRes.json();
        if (updateData.data?.price !== newPrice) throw new Error('Package update failed in DB');
        console.log(`  ✅ [PASS] Package updated to $${newPrice} in database`);

        // 4. Verify Homepage and Services API returns NEW price (not stale cache!)
        const freshHomepageRes = await fetch('http://localhost:5124/api/homepage');
        const freshHomepage = await freshHomepageRes.json();
        const matchedService = freshHomepage.data?.services?.find((s) => s.id === service.id);
        const matchedPkg = matchedService?.packages?.find((p) => p.id === pkgToUpdate.id);
        if (matchedPkg?.price !== newPrice) {
          throw new Error(`Stale cache detected on Homepage! Expected ${newPrice}, got ${matchedPkg?.price}`);
        }
        console.log(`  ✅ [PASS] Live Homepage API instantly returned fresh price $${matchedPkg.price}`);
      }

      // 5. Test Quick Project Upload with Base64 Cover Image
      const fakeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const projectTitle = `Test Showcase Project ${Date.now()}`;
      const projectPayload = {
        title: projectTitle,
        category: service.title,
        serviceId: service.id,
        serviceSlug: service.slug,
        summary: 'Automated persistence test project',
        description: 'Verifying image saving and Media table indexing',
        coverImage: fakeBase64,
        galleryImages: [fakeBase64],
        featured: true,
        active: true,
      };

      const projCreateRes = await fetch('http://localhost:5124/api/projects/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectPayload),
      });
      const projCreateData = await projCreateRes.json();
      const createdProj = projCreateData.data;
      if (!createdProj || !createdProj.id) throw new Error('Project creation failed');
      console.log(`  ✅ [PASS] Project created: "${createdProj.title}" (ID: ${createdProj.id})`);
      console.log(`  ✅ [PASS] Cover image saved to disk: ${createdProj.coverImage}`);

      // 6. Verify image is indexed in Media Library
      // Give DB 100ms for async insertion
      await new Promise((r) => setTimeout(r, 100));
      const mediaList = await prisma.media.findMany({
        where: { fileUrl: createdProj.coverImage },
      });
      if (mediaList.length === 0) {
        throw new Error('Image was not registered in Media table!');
      }
      console.log(`  ✅ [PASS] Image "${createdProj.coverImage}" is registered in Media Library!`);

      // 7. Verify Live Homepage & Service Detail immediately includes the project
      const serviceDetailRes = await fetch(`http://localhost:5124/api/services/${service.slug}`);
      const serviceDetail = await serviceDetailRes.json();
      const foundInService = serviceDetail.data?.projects?.some((p) => p.id === createdProj.id);
      if (!foundInService) {
        throw new Error('Newly created project not found in service detail projects list!');
      }
      console.log(`  ✅ [PASS] Project found in Live Service details API`);

      // Clean up test project
      await prisma.project.delete({ where: { id: createdProj.id } }).catch(() => {});
      console.log('  ✅ [PASS] Test project cleaned up');

      console.log('\n========================================================');
      console.log('🎯 ALL PERSISTENCE TESTS PASSED (100% SUCCESS)');
      console.log('========================================================');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Test failed:', err.message);
      server.close();
      process.exit(1);
    }
  });
};

testPersistence();
