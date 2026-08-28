const prisma = require('../src/config/db');

async function unfeature() {
  console.log('Setting featured: false for Kenakata Shop and Advanced Digital Automotive...');
  
  const res = await prisma.project.updateMany({
    where: {
      OR: [
        { title: { contains: 'Kenakata' } },
        { title: { contains: 'Advanced Digital Automotive' } },
        { id: '312deb7b-9950-47a6-a0c1-1721a34d12b1' },
        { id: '62d57c47-381b-4e51-ad9a-3ca83b1a9db7' },
      ],
    },
    data: {
      featured: false,
    },
  });

  console.log('Updated projects count:', res.count);

  const all = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  all.forEach(p => {
    console.log(`[${p.id.slice(0, 8)}] ${p.title} -> featured: ${p.featured}`);
  });

  await prisma.$disconnect();
}

unfeature().catch(console.error);
