const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Guarantee DATABASE_URL is always set for Hostinger cloud deployments
if (!process.env.DATABASE_URL) {
  const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
  process.env.DATABASE_URL = `file:${defaultDbPath}`;
}

let PrismaClient;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  console.warn('⚠️ @prisma/client not initialized, auto-generating now...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch (err) {
    console.error('Prisma auto-generation failed:', err.message);
  }
}

let prisma;
try {
  if (PrismaClient) {
    prisma = new PrismaClient({
      log: ['error'],
    });
  }
} catch (err) {
  console.warn('⚠️ Prisma Client initialization notice:', err.message);
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    const FreshClient = require('@prisma/client').PrismaClient;
    prisma = new FreshClient({ log: ['error'] });
  } catch (e) {
    console.error('Prisma recovery failed:', e.message);
  }
}

module.exports = prisma || {};
