const path = require('path');
const fs = require('fs');

// Guarantee DATABASE_URL is always set for Hostinger cloud deployments
if (!process.env.DATABASE_URL) {
  const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
  process.env.DATABASE_URL = `file:${defaultDbPath}`;
}

let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient({
    log: ['error'],
  });
} catch (e) {
  console.warn('PrismaClient init note:', e.message);
  prisma = {};
}

module.exports = prisma || {};
