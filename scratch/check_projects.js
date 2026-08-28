const prisma = require('../src/config/db');

async function check() {
  const projs = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  console.log('TOTAL DB PROJECTS:', projs.length);
  projs.forEach((p, idx) => {
    console.log(
      (idx + 1) + '. ID: ' + p.id +
      '\n   Title: ' + p.title +
      '\n   Featured: ' + p.featured +
      '\n   Active: ' + p.active +
      '\n   CoverImage: ' + p.coverImage +
      '\n   CreatedAt: ' + p.createdAt
    );
  });
  await prisma.$disconnect();
}

check().catch(console.error);
