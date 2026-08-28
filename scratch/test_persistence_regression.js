const prisma = require('../src/config/db');
const backupService = require('../src/services/backupService');
const { initDatabaseSchema } = require('../src/config/dbInit');
const { PERSISTENT_DB_FILE, UPLOADS_DIR } = require('../src/config/persistentStorage');
const fs = require('fs');

async function testPersistence() {
  console.log('🧪 Starting Enterprise Data Persistence Verification Test...\n');

  console.log('1️⃣ Verifying Database Location & Connection:');
  console.log('   Persistent DB Path:', PERSISTENT_DB_FILE);
  console.log('   Uploads Dir Path:', UPLOADS_DIR);
  console.log('   DATABASE_URL:', process.env.DATABASE_URL);

  // Initialize schema safely
  await initDatabaseSchema(prisma);

  // Read current counts
  const initialProjects = await prisma.project.count();
  const initialSettings = await prisma.siteSetting.count();
  console.log(`\n2️⃣ Current Database State:`);
  console.log(`   Projects Count: ${initialProjects}`);
  console.log(`   Settings Count: ${initialSettings}`);

  // Test: Insert a unique persistent marker setting
  const testKey = 'persistence_verification_marker';
  const testValue = `Verified Safe on ${new Date().toISOString()}`;
  
  await prisma.siteSetting.upsert({
    where: { key: testKey },
    update: { value: testValue },
    create: { key: testKey, value: testValue },
  });

  console.log(`\n3️⃣ Saved Test Marker Setting: [${testKey} = "${testValue}"]`);

  // Capture snapshot
  const snapshot = await backupService.captureSnapshot(prisma);
  console.log(`\n4️⃣ Snapshot Captured Successfully:`);
  console.log(`   Timestamp: ${snapshot.timestamp}`);
  console.log(`   Projects snapshotted: ${snapshot.counts.projects}`);
  console.log(`   Settings snapshotted: ${snapshot.counts.settings}`);

  // Verify marker in database
  const retrieved = await prisma.siteSetting.findUnique({ where: { key: testKey } });
  if (retrieved && retrieved.value === testValue) {
    console.log(`\n✅ PASS: Test marker successfully retrieved from persistent SQLite!`);
  } else {
    console.error(`\n❌ FAIL: Test marker not found in database!`);
    process.exit(1);
  }

  // Clean up test marker
  await prisma.siteSetting.delete({ where: { key: testKey } }).catch(() => {});
  await backupService.captureSnapshot(prisma);

  console.log('\n🎉 ALL DATA PERSISTENCE TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

testPersistence().catch((e) => {
  console.error('Test Error:', e);
  process.exit(1);
});
