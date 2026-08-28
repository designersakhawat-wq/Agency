const path = require('path');
const dbPath = path.resolve(__dirname, '../src/config/db.js');
const prisma = require(dbPath);

async function main() {
  const projects = await prisma.project.findMany();
  console.log('TOTAL PROJECTS IN DB:', projects.length);
  projects.forEach(p => console.log(' - ID:', p.id, '| Title:', p.title, '| Category:', p.category, '| Cover:', p.coverImage));
}

main().catch(console.error).finally(() => prisma.$disconnect());
