const path = require('path');
const dbPath = path.resolve(__dirname, '../src/config/db.js');
const prisma = require(dbPath);

async function main() {
  const media = await prisma.media.findMany();
  console.log('TOTAL MEDIA IN DB:', media.length);
  media.forEach(m => console.log(' - ID:', m.id, '| Name:', m.fileName, '| FileUrl:', m.fileUrl, '| Source:', m.source));
}

main().catch(console.error).finally(() => prisma.$disconnect());
