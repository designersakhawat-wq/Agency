const path = require('path');
const fs = require('fs');
const { PERSISTENT_DB_FILE } = require('./persistentStorage');

// Ensure DATABASE_URL points to the permanent database across all redeploys
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${PERSISTENT_DB_FILE}`;
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
