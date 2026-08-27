const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Guarantee DATABASE_URL is always set for Hostinger cloud deployments
if (!process.env.DATABASE_URL) {
  const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
  process.env.DATABASE_URL = `file:${defaultDbPath}`;
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
