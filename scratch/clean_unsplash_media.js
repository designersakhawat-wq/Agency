const path = require('path');
const prisma = require(path.resolve(__dirname, '../src/config/db.js'));

async function main() {
  // Remove Unsplash stock placeholder rows from Media table
  const deleted = await prisma.media.deleteMany({
    where: {
      fileUrl: {
        contains: 'unsplash',
      },
    },
  });
  console.log(`Removed ${deleted.count} Unsplash stock placeholders from Media table.`);

  const remaining = await prisma.media.findMany();
  console.log(`\n✅ Remaining Real Media Assets (${remaining.length}):`);
  remaining.forEach((m, idx) => {
    console.log(`${idx + 1}. [${m.fileType}] ${m.fileName} -> ${m.fileUrl} (${Math.round((m.fileSize || 0) / 1024)} KB)`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
