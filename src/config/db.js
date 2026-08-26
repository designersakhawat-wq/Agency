const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Enable SQLite WAL mode & fast pragma for high throughput if using SQLite
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:') || process.env.DATABASE_URL.includes('.db')) {
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA cache_size = 10000;'))
    .catch((err) => {
      // Ignored if non-sqlite
    });
}

module.exports = prisma;
