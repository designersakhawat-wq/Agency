const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');

const env = require('./src/config/env');
const apiRoutes = require('./src/routes');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();

// High Performance Gzip / Brotli compression for all text/JSON/assets
app.use(compression());

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for flexible external image hosting (Cloudinary/Unsplash/Google Fonts)
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  env.APP_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin static apps)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow flexible deployment on Hostinger domains
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  })
);

// Logging in dev
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure uploads directory exists and serve with browser caching
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '7d',
    etag: true,
  })
);

// Mount REST API with Intelligent Tiered Caching
app.use(
  '/api',
  (req, res, next) => {
    // Only cache public GET queries (like projects, services, faqs, settings)
    // Keep admin, auth, and state modifications strictly realtime
    if (req.method === 'GET' && !req.url.startsWith('/admin') && !req.url.startsWith('/auth')) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
  },
  apiLimiter,
  apiRoutes
);

// Hostinger & Production Static Asset Serving (React SPA)
const clientDistPath = path.join(__dirname, 'client/dist');
const altDistPath = path.join(__dirname, 'dist');

let resolvedDistPath = null;
if (fs.existsSync(clientDistPath)) {
  resolvedDistPath = clientDistPath;
} else if (fs.existsSync(altDistPath)) {
  resolvedDistPath = altDistPath;
}

if (resolvedDistPath) {
  console.log(`📦 Serving static frontend from: ${resolvedDistPath}`);
  app.use(
    express.static(resolvedDistPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (filePath.match(/\.(js|css|woff2|woff|ttf|png|jpg|jpeg|svg|webp|ico)$/)) {
          // Immutable long-term caching for hashed bundle assets
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  // Catch-all SPA route with strict no-cache headers for index.html
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(resolvedDistPath, 'index.html'));
  });
} else {
  // If no build found, serve friendly dev landing
  app.get('/', (req, res) => {
    res.json({
      message: 'Md Sakhawat Hossain Portfolio & CMS API Server is running.',
      environment: env.NODE_ENV,
      endpoints: {
        health: '/api/health',
        projects: '/api/projects',
        services: '/api/services',
        packages: '/api/packages',
        testimonials: '/api/testimonials',
        faqs: '/api/faqs',
        brands: '/api/brands',
        inquiries: '/api/inquiries',
        bookings: '/api/bookings',
        invoices: '/api/invoices',
      },
    });
  });
}

// Global Error Handling Middleware
app.use(errorHandler);

const PORT = env.PORT || 5000;

const { execSync } = require('child_process');
const prisma = require('./src/config/db');

async function bootstrapDatabase() {
  try {
    // Quick test if tables exist
    await prisma.user.findFirst();
  } catch (err) {
    if (err.message && (err.message.includes('does not exist') || err.message.includes('no such table') || err.message.includes('table `main.User` does not exist'))) {
      console.log('📦 Database tables missing. Running automatic schema migration and seed on start...');
      try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        execSync('node prisma/seed.js', { stdio: 'inherit' });
        console.log('✅ Database schema synchronized & seeded successfully!');
      } catch (pushErr) {
        console.error('❌ Database push failed:', pushErr.message);
      }
    }
  }

  // Ensure default admin exists
  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0) {
      console.log('🌱 No admin account detected. Running seed script...');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
    }
  } catch (e) {
    // handled above
  }
}

// Start server after ensuring DB
bootstrapDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log(`🚀 Production Server running on port: ${PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`📬 Admin Notifications: ${env.ADMIN_NOTIFICATION_EMAIL}`);
    console.log('⚡ Cache-Control: Intelligent Tiered Caching Activated');
    console.log('======================================================\n');
  });
});
