const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.log('🔄 Checking database configuration...');

const isMysql = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql');

try {
  if (isMysql) {
    console.log('🐬 Attempting connection to MySQL database...');
    execSync(`${npxCmd} prisma db push --accept-data-loss`, { stdio: 'inherit' });
    console.log('✅ MySQL schema synchronized successfully.');
  } else {
    throw new Error('Using local SQLite fallback.');
  }
} catch (err) {
  console.log('ℹ️ MySQL not reachable locally. Initializing local zero-config SQLite database for seamless development...');
  
  // Backup MySQL schema and copy SQLite schema
  const mysqlSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
  const sqliteSchemaPath = path.join(__dirname, '../prisma/schema.sqlite.prisma');
  const tempMysqlPath = path.join(__dirname, '../prisma/schema.mysql.prisma');

  if (!fs.existsSync(tempMysqlPath) && fs.existsSync(mysqlSchemaPath)) {
    fs.copyFileSync(mysqlSchemaPath, tempMysqlPath);
  }

  if (fs.existsSync(sqliteSchemaPath)) {
    fs.copyFileSync(sqliteSchemaPath, mysqlSchemaPath);
  }

  // Update .env DATABASE_URL for sqlite
  let envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  if (!envContent.includes('file:./dev.db')) {
    envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./dev.db"');
    fs.writeFileSync(path.join(__dirname, '../.env'), envContent);
  }

  execSync(`${npxCmd} prisma generate`, { stdio: 'inherit' });
  execSync(`${npxCmd} prisma db push --accept-data-loss`, { stdio: 'inherit' });
  console.log('✅ Local SQLite database initialized.');
}

console.log('🌱 Seeding initial data...');
try {
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  console.log('🎉 Database setup and seeding complete!');
} catch (e) {
  console.error('Seeding notice:', e.message);
}
