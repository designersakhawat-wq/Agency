const path = require('path');
const fs = require('fs');

async function runRegressionTests() {
  console.log('===========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE DATA PERSISTENCE REGRESSION TESTS');
  console.log('===========================================================\n');

  const { PERSISTENT_DB_FILE, UPLOADS_DIR } = require('../src/config/persistentStorage');
  const prisma = require('../src/config/db');
  const { initDatabaseSchema } = require('../src/config/dbInit');

  console.log(`Checking Database File: ${PERSISTENT_DB_FILE}`);
  console.log(`Checking Uploads Dir: ${UPLOADS_DIR}\n`);

  // Step 1: Run DB Schema Init
  console.log('1️⃣ Initializing Database Schema...');
  await initDatabaseSchema(prisma);
  console.log('   ✅ Schema initialized.\n');

  // Step 2: Apply Change A
  console.log('2️⃣ Applying Change A (Setting + Project)...');
  const keyA = 'test_setting_a';
  const valA = 'Value A - ' + Date.now();
  await prisma.siteSetting.upsert({
    where: { key: keyA },
    update: { value: valA },
    create: { key: keyA, value: valA },
  });

  const slugA = 'project-alpha-' + Date.now();
  const projA = await prisma.project.create({
    data: {
      title: 'Project Alpha Persistence Test',
      slug: slugA,
      category: 'Ads Creative',
      summary: 'Summary for Alpha',
      description: 'Description for Alpha',
      coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766',
      active: true,
    },
  });
  console.log(`   ✅ Change A saved (Setting: ${keyA}, Project ID: ${projA.id})\n`);

  // Step 3: Apply Change B
  console.log('3️⃣ Applying Change B (Setting + Project)...');
  const keyB = 'test_setting_b';
  const valB = 'Value B - ' + Date.now();
  await prisma.siteSetting.upsert({
    where: { key: keyB },
    update: { value: valB },
    create: { key: keyB, value: valB },
  });

  const slugB = 'project-beta-' + Date.now();
  const projB = await prisma.project.create({
    data: {
      title: 'Project Beta Persistence Test',
      slug: slugB,
      category: 'Logo & Branding',
      summary: 'Summary for Beta',
      description: 'Description for Beta',
      coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766',
      active: true,
    },
  });
  console.log(`   ✅ Change B saved (Setting: ${keyB}, Project ID: ${projB.id})\n`);

  // Step 4: Verify Change A + Change B coexist
  console.log('4️⃣ Verifying Change A + B coexistence...');
  const checkA = await prisma.siteSetting.findUnique({ where: { key: keyA } });
  const checkB = await prisma.siteSetting.findUnique({ where: { key: keyB } });
  const checkProjA = await prisma.project.findUnique({ where: { id: projA.id } });
  const checkProjB = await prisma.project.findUnique({ where: { id: projB.id } });

  if (checkA?.value === valA && checkB?.value === valB && checkProjA && checkProjB) {
    console.log('   ✅ PASS: Change A and Change B are BOTH perfectly preserved!\n');
  } else {
    throw new Error('❌ FAIL: Change A or B was lost or overwritten!');
  }

  // Step 5: Apply Change C
  console.log('5️⃣ Applying Change C...');
  const keyC = 'test_setting_c';
  const valC = 'Value C - ' + Date.now();
  await prisma.siteSetting.upsert({
    where: { key: keyC },
    update: { value: valC },
    create: { key: keyC, value: valC },
  });
  console.log(`   ✅ Change C saved (Setting: ${keyC})\n`);

  // Step 6: Simulate Server Restart / Deployment Reboot
  console.log('6️⃣ Simulating Server Restart / Re-Init (Running initDatabaseSchema again)...');
  await initDatabaseSchema(prisma);
  console.log('   ✅ Server reboot simulated.\n');

  // Step 7: Verify A + B + C after reboot
  console.log('7️⃣ Verifying A + B + C persistence after server reboot...');
  const afterA = await prisma.siteSetting.findUnique({ where: { key: keyA } });
  const afterB = await prisma.siteSetting.findUnique({ where: { key: keyB } });
  const afterC = await prisma.siteSetting.findUnique({ where: { key: keyC } });
  const afterProjA = await prisma.project.findUnique({ where: { id: projA.id } });
  const afterProjB = await prisma.project.findUnique({ where: { id: projB.id } });

  if (afterA?.value === valA && afterB?.value === valB && afterC?.value === valC && afterProjA && afterProjB) {
    console.log('   ✅ PASS: ALL changes (A + B + C + Projects) PERSISTED after reboot!\n');
  } else {
    throw new Error('❌ FAIL: Data was reset by reboot/seed logic!');
  }

  // Step 8: Test Media File Persistence
  console.log('8️⃣ Testing Uploads Directory & File Persistence...');
  const testFile = path.join(UPLOADS_DIR, `test-media-${Date.now()}.txt`);
  fs.writeFileSync(testFile, 'Permanent Media Test Content');
  if (fs.existsSync(testFile)) {
    console.log(`   ✅ PASS: Media file written to persistent storage: ${testFile}`);
    fs.unlinkSync(testFile);
  } else {
    throw new Error('❌ FAIL: Media directory write failed!');
  }

  // Cleanup test records
  await prisma.siteSetting.deleteMany({ where: { key: { in: [keyA, keyB, keyC] } } });
  await prisma.project.deleteMany({ where: { id: { in: [projA.id, projB.id] } } });

  console.log('\n===========================================================');
  console.log('🎉 ALL PERSISTENCE REGRESSION TESTS PASSED 100%!');
  console.log('===========================================================');
  process.exit(0);
}

runRegressionTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
