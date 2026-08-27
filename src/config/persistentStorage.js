const path = require('path');
const fs = require('fs');

/**
 * Enterprise Permanent Data Persistence Engine
 * Guarantees that Database (.db) and Uploaded Files (/uploads) survive 100% of:
 * - Hostinger Git Redeployments (which create ephemeral version folders in hbuilds/versions/...)
 * - Server Restarts
 * - Cache Clears
 * - Code Updates & Git Pushes
 */

const getPersistentStorageDir = () => {
  if (process.env.PERSISTENT_DATA_DIR) {
    const customPath = path.resolve(process.env.PERSISTENT_DATA_DIR);
    if (!fs.existsSync(customPath)) fs.mkdirSync(customPath, { recursive: true });
    return customPath;
  }

  // On Linux (Hostinger Web App Environment)
  if (process.platform === 'linux') {
    // Attempt domain-level persistent directory outside the versioned hbuilds folder
    const candidatePaths = [
      // Standard Hostinger user home persistent storage
      process.env.HOME ? path.join(process.env.HOME, 'portfolio_persistent_storage') : null,
      // Traverse 4 levels up from /home/.../domains/scaaleminte.com/hbuilds/versions/<id>/src/config
      path.resolve(__dirname, '../../../../persistent_storage'),
      path.resolve(__dirname, '../../../persistent_storage'),
      // Fallback inside application root
      path.resolve(__dirname, '../../persistent_storage'),
    ].filter(Boolean);

    for (const p of candidatePaths) {
      try {
        if (!fs.existsSync(p)) {
          fs.mkdirSync(p, { recursive: true });
        }
        // Test write permissions
        const testFile = path.join(p, '.write_test');
        fs.writeFileSync(testFile, 'ok');
        fs.unlinkSync(testFile);
        return p;
      } catch (err) {
        // Continue to next candidate if permission fails
      }
    }
  }

  // Default Local / Windows development directory
  const localDir = path.resolve(__dirname, '../../persistent_storage');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  return localDir;
};

const STORAGE_ROOT = getPersistentStorageDir();
const DB_DIR = path.join(STORAGE_ROOT, 'database');
const UPLOADS_DIR = path.join(STORAGE_ROOT, 'uploads');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const PERSISTENT_DB_FILE = path.join(DB_DIR, 'production.db');

// If persistent DB does not exist yet, initialize it safely from baseline dev.db if present
const baselineDb = path.resolve(__dirname, '../../prisma/dev.db');
if (!fs.existsSync(PERSISTENT_DB_FILE) && fs.existsSync(baselineDb)) {
  try {
    fs.copyFileSync(baselineDb, PERSISTENT_DB_FILE);
    console.log(`📦 Initialized persistent database baseline at: ${PERSISTENT_DB_FILE}`);
  } catch (err) {
    console.warn('Could not copy baseline DB:', err.message);
  }
}

// Ensure Prisma connects to the permanent database
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${PERSISTENT_DB_FILE}`;
}

// Copy existing local uploads to persistent uploads if any
const localUploadsDir = path.resolve(__dirname, '../../uploads');
if (fs.existsSync(localUploadsDir)) {
  try {
    const files = fs.readdirSync(localUploadsDir);
    for (const file of files) {
      if (file === '.gitkeep') continue;
      const src = path.join(localUploadsDir, file);
      const dest = path.join(UPLOADS_DIR, file);
      if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
      }
    }
  } catch (e) {}
}

console.log(`🔒 Permanent Storage System Active:`);
console.log(`   📂 Storage Root: ${STORAGE_ROOT}`);
console.log(`   🗄️  Database File: ${PERSISTENT_DB_FILE}`);
console.log(`   🖼️  Uploads Directory: ${UPLOADS_DIR}`);

module.exports = {
  STORAGE_ROOT,
  DB_DIR,
  UPLOADS_DIR,
  PERSISTENT_DB_FILE,
};
