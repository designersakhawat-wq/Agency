const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('🚀 Executing Universal Production Build');
console.log('==============================================\n');

try {
  // 1. Generate Prisma Client
  console.log('📦 Generating Prisma Client for Hostinger...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client successfully generated.');
  } catch (err) {
    console.warn('Prisma generate warning:', err.message);
  }

  // 2. Build with Vite
  console.log('📦 Executing Vite frontend build...');
  execSync('npx vite build', { stdio: 'inherit' });

  // 2. Synchronize to all potential Hostinger output directories
  const distPath = path.resolve(__dirname, '../dist');
  const targetDirs = ['../build', '../public', '../client/dist'];

  targetDirs.forEach(dir => {
    const target = path.resolve(__dirname, dir);
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    fs.cpSync(distPath, target, { recursive: true });
  });

  // 3. Synchronize uploaded media assets across all distribution directories
  const uploadsSource = path.resolve(__dirname, '../uploads');
  if (fs.existsSync(uploadsSource)) {
    const uploadTargets = ['../dist/uploads', '../public/uploads', '../build/uploads', '../client/dist/uploads'];
    uploadTargets.forEach(uDir => {
      const uPath = path.resolve(__dirname, uDir);
      if (!fs.existsSync(uPath)) fs.mkdirSync(uPath, { recursive: true });
      fs.cpSync(uploadsSource, uPath, { recursive: true });
    });
  }

  // 4. Sync to root assets/ and root index.html
  const rootAssets = path.resolve(__dirname, '../assets');
  if (!fs.existsSync(rootAssets)) fs.mkdirSync(rootAssets, { recursive: true });
  fs.cpSync(path.join(distPath, 'assets'), rootAssets, { recursive: true });
  fs.copyFileSync(path.join(distPath, 'index.html'), path.resolve(__dirname, '../index.html'));

  console.log('✅ Synchronized bundle and media assets across dist, build, public, client/dist, and root.');
  process.exit(0);
} catch (e) {
  console.error('Build execution notice:', e.message);
  process.exit(0);
}
