const path = require('path');
const dbPath = path.resolve(__dirname, '../src/config/db.js');
const prisma = require(dbPath);
const backupService = require('../src/services/backupService');

async function main() {
  const snapshot = await backupService.captureSnapshot(prisma);
  console.log('✅ Captured fresh CMS snapshot with counts:', snapshot.counts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
