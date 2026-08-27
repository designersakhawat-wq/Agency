const bcrypt = require('bcryptjs');

const initDatabaseSchema = async (prisma) => {
  try {
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
        "content" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "projectTitle" TEXT,
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
        "subject" TEXT,
        "message" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'UNREAD',
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
    console.log('✅ SQLite database schema verified and tables created if missing.');

    // 2. Ensure Admin User exists
    const userCount = await prisma.user.count().catch(() => 0);
    if (userCount === 0) {
      console.log('🌱 Creating default administrator account...');
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      await prisma.user.create({
        data: {
          email: 'admin@sakhawat.design',
          password: hashedPassword,
          name: 'Md Sakhawat Hossain',
          role: 'ADMIN',
        },
      });
      console.log('✅ Default administrator created: admin@sakhawat.design / admin123456');
    }

    // 3. If fresh database with 0 services, seed initial default content safely
    const serviceCount = await prisma.service.count().catch(() => 0);
    if (serviceCount === 0) {
      console.log('🌱 Fresh database detected: Seeding initial baseline datasets...');
      try {
        const seed = require('../../prisma/seed');
        if (typeof seed === 'function') await seed();
      } catch (seedErr) {
        console.warn('Initial baseline seed info:', seedErr.message);
      }
    }
  } catch (err) {
    console.error('Database schema self-heal error:', err.message);
  }
};

module.exports = { initDatabaseSchema };
