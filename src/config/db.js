const path = require('path');
const fs = require('fs');
const { PERSISTENT_DB_FILE } = require('./persistentStorage');

const currentDbUrl = process.env.DATABASE_URL || '';
const isRemoteDb = currentDbUrl.startsWith('mysql:') || currentDbUrl.startsWith('postgresql:') || currentDbUrl.startsWith('postgres:');
const normalizedPath = PERSISTENT_DB_FILE.replace(/\\/g, '/');
const finalDbUrl = isRemoteDb ? currentDbUrl : `file:${normalizedPath}`;

process.env.DATABASE_URL = finalDbUrl;

let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: finalDbUrl,
      },
    },
    log: ['error'],
  });
} catch (e) {
  console.warn('PrismaClient init note:', e.message);
  prisma = {};
}

module.exports = prisma || {};
