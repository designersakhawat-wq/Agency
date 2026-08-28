const bcrypt = require('bcryptjs');

const initDatabaseSchema = async (prisma) => {
  if (!prisma || typeof prisma.$queryRawUnsafe !== 'function') {
    console.log('Database client not ready for direct DDL, skipping schema init.');
    return;
  }
  try {
    // 0. Enable SQLite WAL mode & memory cache optimizations for high concurrent traffic on Hostinger
    try {
      await prisma.$queryRawUnsafe(`PRAGMA journal_mode = WAL;`).catch(() => {});
      await prisma.$queryRawUnsafe(`PRAGMA synchronous = NORMAL;`).catch(() => {});
      await prisma.$queryRawUnsafe(`PRAGMA cache_size = 10000;`).catch(() => {});
      await prisma.$queryRawUnsafe(`PRAGMA temp_store = MEMORY;`).catch(() => {});
      await prisma.$queryRawUnsafe(`PRAGMA foreign_keys = ON;`).catch(() => {});
    } catch (e) {
      // Non-blocking fallback for other drivers
    }

    // 1. Create all SQLite tables if they do not exist
    const createTableStatements = [
      `CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "avatar" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,

      `CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "client" TEXT,
        "year" TEXT,
        "summary" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "coverImage" TEXT NOT NULL,
        "galleryImages" TEXT,
        "liveUrl" TEXT,
        "githubUrl" TEXT,
        "figmaUrl" TEXT,
        "behanceUrl" TEXT,
        "dribbbleUrl" TEXT,
        "featured" BOOLEAN NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        "tags" TEXT,
        "challenges" TEXT,
        "solutions" TEXT,
        "results" TEXT,
        "goal" TEXT,
        "solution" TEXT,
        "tools" TEXT,
        "seoTitle" TEXT,
        "seoDescription" TEXT,
        "altText" TEXT,
        "serviceId" TEXT,
        "serviceSlug" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");`,

      `CREATE TABLE IF NOT EXISTS "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "tagline" TEXT,
        "description" TEXT NOT NULL,
        "icon" TEXT,
        "features" TEXT,
        "deliverables" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Service_slug_key" ON "Service"("slug");`,

      `CREATE TABLE IF NOT EXISTS "Package" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "serviceId" TEXT,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DECIMAL NOT NULL,
        "billingPeriod" TEXT NOT NULL DEFAULT 'per-project',
        "features" TEXT NOT NULL,
        "excludedFeatures" TEXT,
        "isPopular" BOOLEAN NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "ctaText" TEXT NOT NULL DEFAULT 'Book Package',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS "Testimonial" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "clientName" TEXT NOT NULL,
        "clientRole" TEXT,
        "clientCompany" TEXT NOT NULL,
        "clientAvatar" TEXT,
        "brandLogo" TEXT,
        "serviceId" TEXT,
        "content" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "projectTitle" TEXT,
        "status" TEXT NOT NULL DEFAULT 'APPROVED',
        "featured" BOOLEAN NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS "Faq" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'General',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS "ClientBrand" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logoUrl" TEXT NOT NULL,
        "websiteUrl" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS "ContactInquiry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "company" TEXT,
        "service" TEXT,
        "budget" TEXT,
        "projectType" TEXT,
        "deadline" TEXT,
        "subject" TEXT,
        "message" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS "Booking" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "company" TEXT,
        "serviceName" TEXT,
        "budget" TEXT,
        "projectDetails" TEXT,
        "date" TEXT NOT NULL,
        "timeSlot" TEXT NOT NULL,
        "meetingLink" TEXT,
        "notes" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS "Media" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "fileName" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileType" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "altText" TEXT,
        "source" TEXT NOT NULL DEFAULT 'LOCAL',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS "SiteSetting" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");`,

      `CREATE TABLE IF NOT EXISTS "Invoice" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "invoiceNumber" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "clientEmail" TEXT NOT NULL,
        "clientCompany" TEXT,
        "clientAddress" TEXT,
        "clientPhone" TEXT,
        "issueDate" TEXT NOT NULL,
        "dueDate" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'UNPAID',
        "currency" TEXT NOT NULL DEFAULT '$',
        "currencyCode" TEXT NOT NULL DEFAULT 'USD',
        "items" TEXT NOT NULL,
        "subtotal" DECIMAL NOT NULL DEFAULT 0,
        "discountPercent" DECIMAL NOT NULL DEFAULT 0,
        "taxPercent" DECIMAL NOT NULL DEFAULT 0,
        "totalAmount" DECIMAL NOT NULL DEFAULT 0,
        "notes" TEXT,
        "paymentTerms" TEXT,
        "paymentMethods" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");`,
    ];

    for (const sql of createTableStatements) {
      await prisma.$executeRawUnsafe(sql);
    }

    // Helper to safely add column only if not present
    const addColumnIfMissing = async (tableName, columnName, columnDef) => {
      try {
        const columns = await prisma.$queryRawUnsafe(`PRAGMA table_info("${tableName}")`);
        const exists = Array.isArray(columns) && columns.some((c) => c.name === columnName);
        if (!exists) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnDef};`);
        }
      } catch (err) {}
    };

    // Safe additive column checks
    await addColumnIfMissing('Project', 'goal', 'TEXT');
    await addColumnIfMissing('Project', 'solution', 'TEXT');
    await addColumnIfMissing('Project', 'tools', 'TEXT');
    await addColumnIfMissing('Project', 'seoTitle', 'TEXT');
    await addColumnIfMissing('Project', 'seoDescription', 'TEXT');
    await addColumnIfMissing('Project', 'altText', 'TEXT');
    await addColumnIfMissing('Project', 'serviceId', 'TEXT');
    await addColumnIfMissing('Project', 'serviceSlug', 'TEXT');
    await addColumnIfMissing('Testimonial', 'brandLogo', 'TEXT');
    await addColumnIfMissing('Testimonial', 'serviceId', 'TEXT');
    await addColumnIfMissing('Testimonial', 'status', 'TEXT NOT NULL DEFAULT \'APPROVED\'');
    await addColumnIfMissing('ContactInquiry', 'projectType', 'TEXT');
    await addColumnIfMissing('ContactInquiry', 'deadline', 'TEXT');
    await addColumnIfMissing('Booking', 'budget', 'TEXT');
    await addColumnIfMissing('Booking', 'projectDetails', 'TEXT');

    console.log('✅ SQLite database schema verified and tables created if missing.');

    // 2. Ensure Administrator Account(s) exist
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@sakhawat.design').toLowerCase().trim();
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminName = process.env.ADMIN_NAME || 'Md Sakhawat Hossain';

    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } }).catch(() => null);
    if (!existingAdmin) {
      console.log(`🌱 Creating primary administrator account (${adminEmail})...`);
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'ADMIN',
        },
      });
      console.log(`✅ Primary administrator created: ${adminEmail}`);
    }

    // Also ensure fallback 'admin@sakhawat.design' exists if ADMIN_EMAIL is custom
    if (adminEmail !== 'admin@sakhawat.design') {
      const fallbackAdmin = await prisma.user.findUnique({ where: { email: 'admin@sakhawat.design' } }).catch(() => null);
      if (!fallbackAdmin) {
        const fallbackHashed = await bcrypt.hash('admin123456', 10);
        await prisma.user.create({
          data: {
            email: 'admin@sakhawat.design',
            password: fallbackHashed,
            name: 'Md Sakhawat Hossain',
            role: 'ADMIN',
          },
        });
      }
    }

    // 4. Auto-discover and register all existing website images into Media Library
    setTimeout(async () => {
      try {
        const mediaService = require('../services/mediaService');
        await mediaService.scanAndRegisterAllExistingImages();
      } catch (scanErr) {
        console.warn('Media auto-scanner warning:', scanErr.message);
      }
    }, 1000);
  } catch (err) {
    console.error('Database schema self-heal error:', err.message);
  }
};

module.exports = { initDatabaseSchema };
