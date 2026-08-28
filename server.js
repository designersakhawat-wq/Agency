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

// Trust Hostinger reverse proxy headers for real client IPs & SSL
app.set('trust proxy', 1);

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

// Serve transparent PNG for legacy placeholder requests to eliminate 422/404 errors
app.get('/placeholder-cleaned.png', (req, res) => {
  const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(transparentPng);
});

// Ensure uploads directory exists in persistent storage and serve with browser caching
const { UPLOADS_DIR } = require('./src/config/persistentStorage');
const uploadsDir = UPLOADS_DIR;
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(uploadsDir, {
    maxAge: '7d',
    etag: true,
  })
);

// Mount REST API with real-time freshness
app.use(
  '/api',
  (req, res, next) => {
    // Prevent Hostinger Edge CDN or browser from caching API responses so edits show instantly
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  },
  apiLimiter,
  apiRoutes
);

// Hostinger & Production Static Asset Serving (React SPA)
const candidatePaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, 'build'),
  path.join(__dirname, 'public'),
];

let resolvedDistPath = null;
for (const p of candidatePaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    resolvedDistPath = p;
    break;
  }
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

const prisma = require('./src/config/db');
const { initDatabaseSchema } = require('./src/config/dbInit');

const PORT = process.env.PORT || env.PORT || 5000;

// Resilient server startup with EADDRINUSE self-recovery
const startServer = (portToTry, attempts = 0) => {
  const isSocket = isNaN(Number(portToTry));
  const s = isSocket
    ? app.listen(portToTry)
    : app.listen(Number(portToTry));

  s.on('listening', () => {
    console.log('\n======================================================');
    console.log(`🚀 Production Server listening on ${isSocket ? 'socket: ' + portToTry : 'port: ' + portToTry}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`📡 API Base: http://localhost:${isSocket ? 'socket' : portToTry}/api`);
    console.log(`📬 Admin Notifications: ${env.ADMIN_NOTIFICATION_EMAIL}`);
    console.log('⚡ Cache-Control: Intelligent Tiered Caching Activated');
    console.log('======================================================\n');

    initDatabaseSchema(prisma).catch((err) => {
      console.error('Database initialization background error:', err.message);
    });
  });

  s.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempts < 5 && !isSocket) {
      console.warn(`⚠️ Port ${portToTry} in use, retrying on ${Number(portToTry) + 1}...`);
      startServer(Number(portToTry) + 1, attempts + 1);
    } else {
      console.error('Server listen notice:', err.message);
    }
  });

  return s;
};

const server = startServer(PORT);

// Graceful Shutdown for Hostinger Process Managers (PM2 / Passenger / Systemd)
const handleGracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  if (server && server.close) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await prisma.$disconnect();
        console.log('Database connection cleanly closed.');
      } catch (e) {}
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error('Force closing server after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception thrown:', err);
});

module.exports = app;
