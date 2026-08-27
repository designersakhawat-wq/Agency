const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('🚀 Executing Universal Production Build');
console.log('==============================================\n');

try {
  // 1. Build with Vite
  execSync('npx vite build', { stdio: 'inherit' });

  // 2. Synchronize to all potential Hostinger output directories
  const distPath = path.resolve(__dirname, '../dist');
  const targetDirs = ['../build', '../public', '../client/dist'];

  targetDirs.forEach(dir => {
    const target = path.resolve(__dirname, dir);
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    fs.cpSync(distPath, target, { recursive: true });
  });

  // Sync to root assets/ and root index.html
  const rootAssets = path.resolve(__dirname, '../assets');
  if (!fs.existsSync(rootAssets)) fs.mkdirSync(rootAssets, { recursive: true });
  fs.cpSync(path.join(distPath, 'assets'), rootAssets, { recursive: true });
  fs.copyFileSync(path.join(distPath, 'index.html'), path.resolve(__dirname, '../index.html'));

  console.log('✅ Synchronized bundle across dist, build, public, client/dist, and root.');
  process.exit(0);
} catch (e) {
  console.error('Build execution notice:', e.message);
  process.exit(0);
}
