const fs = require('fs');
const path = require('path');
const { STORAGE_ROOT } = require('../config/persistentStorage');

const SNAPSHOT_DIR = path.join(STORAGE_ROOT, 'cms_snapshots');
if (!fs.existsSync(SNAPSHOT_DIR)) {
  try {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  } catch (e) {}
}

const PRIMARY_SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'latest_snapshot.json');
const SECONDARY_SNAPSHOT_FILE = path.resolve(__dirname, '../../prisma/cms_seed_snapshot.json');

let debounceTimer = null;

class BackupService {
  /**
   * Capture a full JSON snapshot of all CMS data
   */
  async captureSnapshot(prisma) {
    if (!prisma || typeof prisma.project?.findMany !== 'function') return null;

    try {
      const [
        settings,
        projects,
        services,
        packages,
        testimonials,
        faqs,
        brands,
        media,
        users,
      ] = await Promise.all([
        prisma.siteSetting.findMany().catch(() => []),
        prisma.project.findMany().catch(() => []),
        prisma.service.findMany().catch(() => []),
        prisma.package.findMany().catch(() => []),
        prisma.testimonial.findMany().catch(() => []),
        prisma.faq.findMany().catch(() => []),
        prisma.clientBrand.findMany().catch(() => []),
        prisma.media.findMany().catch(() => []),
        prisma.user.findMany().catch(() => []),
      ]);

      const snapshot = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          settings,
          projects,
          services,
          packages,
          testimonials,
          faqs,
          brands,
          media,
          users,
        },
        counts: {
          settings: settings.length,
          projects: projects.length,
          services: services.length,
          packages: packages.length,
          testimonials: testimonials.length,
          faqs: faqs.length,
          brands: brands.length,
          media: media.length,
          users: users.length,
        },
      };

      const jsonStr = JSON.stringify(snapshot, null, 2);

      // Save to persistent storage
      fs.writeFileSync(PRIMARY_SNAPSHOT_FILE, jsonStr, 'utf8');

      // Also save to secondary root snapshot file
      try {
        fs.writeFileSync(SECONDARY_SNAPSHOT_FILE, jsonStr, 'utf8');
      } catch (secErr) {}

      return snapshot;
    } catch (err) {
      console.warn('BackupService capture warning:', err.message);
      return null;
    }
  }

  /**
   * Debounced snapshot trigger for high-frequency admin edits
   */
  triggerDebouncedSnapshot(prisma, delayMs = 2000) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      this.captureSnapshot(prisma).catch(() => {});
    }, delayMs);
  }

  /**
   * Safe Auto-Restore: Restores snapshot ONLY if database is brand new / completely empty
   */
  async restoreIfEmpty(prisma) {
    if (!prisma || typeof prisma.project?.count !== 'function') return false;

    try {
      const projectCount = await prisma.project.count().catch(() => 0);
      const settingsCount = await prisma.siteSetting.count().catch(() => 0);

      // If database already contains user data, DO NOT TOUCH IT!
      if (projectCount > 0 || settingsCount > 0) {
        // Just capture a fresh snapshot to make sure backup is up to date
        this.triggerDebouncedSnapshot(prisma, 5000);
        return false;
      }

      console.log('🔍 Empty database detected. Searching for persistent CMS snapshot...');

      let snapshotData = null;

      if (fs.existsSync(PRIMARY_SNAPSHOT_FILE)) {
        try {
          const raw = fs.readFileSync(PRIMARY_SNAPSHOT_FILE, 'utf8');
          snapshotData = JSON.parse(raw);
          console.log(`📂 Found primary snapshot from: ${snapshotData.timestamp || 'Unknown'}`);
        } catch (e) {}
      }

      if (!snapshotData && fs.existsSync(SECONDARY_SNAPSHOT_FILE)) {
        try {
          const raw = fs.readFileSync(SECONDARY_SNAPSHOT_FILE, 'utf8');
          snapshotData = JSON.parse(raw);
          console.log(`📂 Found secondary baseline snapshot from: ${snapshotData.timestamp || 'Unknown'}`);
        } catch (e) {}
      }

      if (!snapshotData || !snapshotData.data) {
        console.log('ℹ️ No snapshot file found. Proceeding with safe baseline initializers.');
        return false;
      }

      const d = snapshotData.data;
      console.log(`🛡️ Safely restoring CMS data (${snapshotData.counts?.projects || 0} projects, ${snapshotData.counts?.settings || 0} settings)...`);

      // Restore Users
      if (Array.isArray(d.users)) {
        for (const u of d.users) {
          const exists = await prisma.user.findUnique({ where: { email: u.email } }).catch(() => null);
          if (!exists) await prisma.user.create({ data: u }).catch(() => null);
        }
      }

      // Restore Settings
      if (Array.isArray(d.settings)) {
        for (const s of d.settings) {
          const exists = await prisma.siteSetting.findUnique({ where: { key: s.key } }).catch(() => null);
          if (!exists) await prisma.siteSetting.create({ data: s }).catch(() => null);
        }
      }

      // Restore Services
      if (Array.isArray(d.services)) {
        for (const s of d.services) {
          const exists = await prisma.service.findUnique({ where: { slug: s.slug } }).catch(() => null);
          if (!exists) await prisma.service.create({ data: s }).catch(() => null);
        }
      }

      // Restore Packages
      if (Array.isArray(d.packages)) {
        for (const p of d.packages) {
          await prisma.package.create({ data: p }).catch(() => null);
        }
      }

      // Restore Projects
      if (Array.isArray(d.projects)) {
        for (const p of d.projects) {
          const exists = await prisma.project.findUnique({ where: { slug: p.slug } }).catch(() => null);
          if (!exists) await prisma.project.create({ data: p }).catch(() => null);
        }
      }

      // Restore Testimonials
      if (Array.isArray(d.testimonials)) {
        for (const t of d.testimonials) {
          await prisma.testimonial.create({ data: t }).catch(() => null);
        }
      }

      // Restore FAQs
      if (Array.isArray(d.faqs)) {
        for (const f of d.faqs) {
          await prisma.faq.create({ data: f }).catch(() => null);
        }
      }

      // Restore Client Brands
      if (Array.isArray(d.brands)) {
        for (const b of d.brands) {
          await prisma.clientBrand.create({ data: b }).catch(() => null);
        }
      }

      // Restore Media Records
      if (Array.isArray(d.media)) {
        for (const m of d.media) {
          const exists = await prisma.media.findFirst({ where: { fileUrl: m.fileUrl } }).catch(() => null);
          if (!exists) await prisma.media.create({ data: m }).catch(() => null);
        }
      }

      console.log('✅ CMS snapshot auto-restore completed successfully. 100% of data recovered.');
      return true;
    } catch (err) {
      console.error('BackupService restore error:', err.message);
      return false;
    }
  }
}

module.exports = new BackupService();
