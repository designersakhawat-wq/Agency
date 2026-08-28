const fs = require('fs');
const path = require('path');
const dbPath = path.resolve(__dirname, '../src/config/db.js');
const prisma = require(dbPath);

async function main() {
  // 1. Find and delete all dummy QA test images from DB
  const deleted = await prisma.media.deleteMany({
    where: {
      OR: [
        { fileName: { contains: 'qa-test' } },
        { fileName: { contains: 'test-brand' } },
        { fileUrl: { contains: 'qa-test' } },
        { fileUrl: { contains: 'test-brand' } },
      ],
    },
  });
  console.log(`Deleted ${deleted.count} dummy test media rows from DB.`);

  // 2. Delete physical files from all candidate upload folders
  const candidateDirs = [
    path.resolve(__dirname, '../uploads'),
    path.resolve(__dirname, '../persistent_storage/uploads'),
    path.resolve(__dirname, '../public/uploads'),
    path.resolve(__dirname, '../dist/uploads'),
    path.resolve(__dirname, '../client/dist/uploads'),
  ];

  candidateDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach((f) => {
        if (f.startsWith('qa-test-') || f.startsWith('test-brand-')) {
          try {
            fs.unlinkSync(path.join(dir, f));
            console.log(`Deleted file: ${f} from ${dir}`);
          } catch (e) {}
        }
      });
    }
  });

  console.log('✅ Cleanup of dummy test files complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
