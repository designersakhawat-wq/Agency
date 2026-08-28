const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const prisma = require('../config/db');

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️ Media Service: Cloudinary storage configured.');
} else {
  console.log('📁 Media Service: Using Hostinger local file storage (/uploads).');
}

// Helper: Guess MIME type from extension or URL
const getMimeType = (filePathOrUrl) => {
  const ext = path.extname(filePathOrUrl || '').toLowerCase().replace('.', '');
  const mimeMap = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ico: 'image/x-icon',
  };
  return mimeMap[ext] || 'image/jpeg';
};

class MediaService {
  /**
   * Process and save an uploaded file (either to Cloudinary or Local Server)
   */
  async processUpload(file, altText = '') {
    if (!file) {
      throw new Error('No file provided');
    }

    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: env.CLOUDINARY_FOLDER || 'portfolio',
          resource_type: 'auto',
        });

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        const media = await prisma.media.create({
          data: {
            fileName: file.originalname,
            fileUrl: result.secure_url,
            fileType: file.mimetype,
            fileSize: parseInt(result.bytes || file.size, 10),
            altText: altText || file.originalname,
            source: 'CLOUDINARY',
          },
        });

        return media;
      } catch (err) {
        console.error('Cloudinary upload error:', err.message);
      }
    }

    // Local file handling
    const fileUrl = `/uploads/${file.filename}`;
    const media = await prisma.media.create({
      data: {
        fileName: file.originalname,
        fileUrl: fileUrl,
        fileType: file.mimetype,
        fileSize: parseInt(file.size, 10),
        altText: altText || file.originalname,
        source: 'LOCAL',
      },
    });

    return media;
  }

  /**
   * Register an existing image path / URL if not already registered in Media library
   */
  async registerAssetIfMissing({ fileName, fileUrl, fileType, fileSize, altText, source = 'LOCAL' }) {
    if (!fileUrl) return null;
    const cleanUrl = String(fileUrl).trim();
    if (!cleanUrl || cleanUrl.startsWith('data:')) return null;

    try {
      const existing = await prisma.media.findFirst({
        where: {
          OR: [
            { fileUrl: cleanUrl },
            { fileName: fileName || path.basename(cleanUrl) },
          ],
        },
      });

      if (existing) return existing;

      const cleanFileName = fileName || path.basename(cleanUrl.split('?')[0]) || 'asset.png';
      const cleanMime = fileType || getMimeType(cleanFileName);
      const cleanSize = fileSize || 1024;
      const cleanAlt = altText || cleanFileName.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');

      const isRemote = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
      const resolvedSource = source || (isRemote ? (cleanUrl.includes('cloudinary') ? 'CLOUDINARY' : 'EXTERNAL') : 'LOCAL');

      const created = await prisma.media.create({
        data: {
          fileName: cleanFileName,
          fileUrl: cleanUrl,
          fileType: cleanMime,
          fileSize: cleanSize,
          altText: cleanAlt,
          source: resolvedSource,
        },
      });
      return created;
    } catch (err) {
      return null;
    }
  }

  /**
   * Automatic Website Image Inventory Scanner
   * Discovers and registers ALL existing images across disk folders and database records
   */
  async scanAndRegisterAllExistingImages() {
    console.log('🔍 [Media Scanner] Starting full website image auto-discovery...');
    let discoveredCount = 0;
    const { UPLOADS_DIR } = require('../config/persistentStorage');

    // 1. Scan physical uploads directory
    try {
      const candidateDirs = [
        UPLOADS_DIR,
        path.resolve(__dirname, '../../uploads'),
        path.resolve(__dirname, '../../client/public/uploads'),
      ];

      for (const dir of candidateDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file === '.gitkeep' || file.startsWith('.')) continue;
            const fullPath = path.join(dir, file);
            try {
              const stat = fs.statSync(fullPath);
              if (stat.isFile() && /\.(png|jpe?g|webp|svg|gif|ico)$/i.test(file)) {
                const registered = await this.registerAssetIfMissing({
                  fileName: file,
                  fileUrl: `/uploads/${file}`,
                  fileType: getMimeType(file),
                  fileSize: stat.size,
                  altText: file.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''),
                  source: 'LOCAL',
                });
                if (registered) discoveredCount++;
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.warn('[Media Scanner] Error scanning uploads dir:', err.message);
    }

    // 2. Scan Project records (coverImage & galleryImages)
    try {
      const projects = await prisma.project.findMany().catch(() => []);
      for (const p of projects) {
        if (p.coverImage) {
          const reg = await this.registerAssetIfMissing({
            fileName: path.basename(p.coverImage.split('?')[0]) || `${p.slug}-cover.png`,
            fileUrl: p.coverImage,
            altText: `${p.title} Cover Image`,
          });
          if (reg) discoveredCount++;
        }

        if (p.galleryImages) {
          let gImages = [];
          try {
            gImages = typeof p.galleryImages === 'string' ? JSON.parse(p.galleryImages) : p.galleryImages;
          } catch (e) {
            gImages = p.galleryImages.split(',').map((s) => s.trim()).filter(Boolean);
          }
          if (Array.isArray(gImages)) {
            for (let idx = 0; idx < gImages.length; idx++) {
              const imgUrl = gImages[idx];
              if (imgUrl) {
                const reg = await this.registerAssetIfMissing({
                  fileName: path.basename(imgUrl.split('?')[0]) || `${p.slug}-gallery-${idx + 1}.png`,
                  fileUrl: imgUrl,
                  altText: `${p.title} Gallery #${idx + 1}`,
                });
                if (reg) discoveredCount++;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Media Scanner] Error scanning projects:', err.message);
    }

    // 3. Scan Testimonials (clientAvatar & brandLogo)
    try {
      const testimonials = await prisma.testimonial.findMany().catch(() => []);
      for (const t of testimonials) {
        if (t.clientAvatar) {
          const reg = await this.registerAssetIfMissing({
            fileName: path.basename(t.clientAvatar.split('?')[0]) || `${t.clientName.replace(/\s+/g, '-').toLowerCase()}-avatar.png`,
            fileUrl: t.clientAvatar,
            altText: `${t.clientName} Avatar`,
          });
          if (reg) discoveredCount++;
        }
        if (t.brandLogo) {
          const reg = await this.registerAssetIfMissing({
            fileName: path.basename(t.brandLogo.split('?')[0]) || `${t.clientCompany.replace(/\s+/g, '-').toLowerCase()}-logo.png`,
            fileUrl: t.brandLogo,
            altText: `${t.clientCompany} Logo`,
          });
          if (reg) discoveredCount++;
        }
      }
    } catch (err) {
      console.warn('[Media Scanner] Error scanning testimonials:', err.message);
    }

    // 4. Scan Client Brands (logoUrl)
    try {
      const brands = await prisma.clientBrand.findMany().catch(() => []);
      for (const b of brands) {
        if (b.logoUrl) {
          const reg = await this.registerAssetIfMissing({
            fileName: path.basename(b.logoUrl.split('?')[0]) || `${b.name.replace(/\s+/g, '-').toLowerCase()}-brand-logo.png`,
            fileUrl: b.logoUrl,
            altText: `${b.name} Brand Logo`,
          });
          if (reg) discoveredCount++;
        }
      }
    } catch (err) {
      console.warn('[Media Scanner] Error scanning brands:', err.message);
    }

    // 5. Scan Site Settings (hero_image, about_image, site_logo, site_favicon, og_image, etc.)
    try {
      const settings = await prisma.siteSetting.findMany().catch(() => []);
      const imageKeys = ['hero_image', 'about_image', 'site_logo', 'site_favicon', 'og_image', 'brand_avatar', 'about_hero_image'];
      for (const s of settings) {
        if (imageKeys.includes(s.key) && s.value && typeof s.value === 'string' && !s.value.startsWith('data:')) {
          const reg = await this.registerAssetIfMissing({
            fileName: path.basename(s.value.split('?')[0]) || `${s.key}.png`,
            fileUrl: s.value,
            altText: `Site Setting: ${s.key.replace(/_/g, ' ')}`,
          });
          if (reg) discoveredCount++;
        }
      }
    } catch (err) {
      console.warn('[Media Scanner] Error scanning settings:', err.message);
    }

    console.log(`✅ [Media Scanner] Inventory complete. Total scanned & verified assets: ${discoveredCount}`);
    return { discoveredCount };
  }

  /**
   * Calculate live references & usage locations for a given Media asset
   */
  async getMediaUsage(mediaId, fileUrl) {
    const usedIn = [];
    const url = fileUrl || '';
    const filename = path.basename(url.split('?')[0]);

    if (!url && !mediaId) return { usageCount: 0, usedIn: [] };

    try {
      // 1. Projects check
      const projects = await prisma.project.findMany().catch(() => []);
      for (const p of projects) {
        if (p.coverImage && (p.coverImage === url || (filename && p.coverImage.includes(filename)))) {
          usedIn.push({ module: 'Portfolio', title: p.title, field: 'Cover Image', id: p.id, url: `/portfolio/${p.slug}` });
        }
        if (p.galleryImages && (p.galleryImages.includes(url) || (filename && p.galleryImages.includes(filename)))) {
          usedIn.push({ module: 'Portfolio', title: p.title, field: 'Gallery Image', id: p.id, url: `/portfolio/${p.slug}` });
        }
      }

      // 2. Testimonials check
      const testimonials = await prisma.testimonial.findMany().catch(() => []);
      for (const t of testimonials) {
        if (t.clientAvatar && (t.clientAvatar === url || (filename && t.clientAvatar.includes(filename)))) {
          usedIn.push({ module: 'Testimonial', title: `${t.clientName} (${t.clientCompany})`, field: 'Client Avatar', id: t.id });
        }
        if (t.brandLogo && (t.brandLogo === url || (filename && t.brandLogo.includes(filename)))) {
          usedIn.push({ module: 'Testimonial', title: `${t.clientName} (${t.clientCompany})`, field: 'Brand Logo', id: t.id });
        }
      }

      // 3. Client Brands check
      const brands = await prisma.clientBrand.findMany().catch(() => []);
      for (const b of brands) {
        if (b.logoUrl && (b.logoUrl === url || (filename && b.logoUrl.includes(filename)))) {
          usedIn.push({ module: 'Client Brand', title: b.name, field: 'Brand Logo', id: b.id });
        }
      }

      // 4. Site Settings check
      const settings = await prisma.siteSetting.findMany().catch(() => []);
      for (const s of settings) {
        if (s.value && (s.value === url || (filename && typeof s.value === 'string' && s.value.includes(filename)))) {
          usedIn.push({ module: 'Site Settings', title: s.key.replace(/_/g, ' ').toUpperCase(), field: s.key, id: s.id });
        }
      }

      // 5. User Avatar check
      const users = await prisma.user.findMany().catch(() => []);
      for (const u of users) {
        if (u.avatar && (u.avatar === url || (filename && u.avatar.includes(filename)))) {
          usedIn.push({ module: 'Admin User', title: u.name, field: 'Profile Avatar', id: u.id });
        }
      }
    } catch (err) {
      console.warn('Error calculating media usage:', err.message);
    }

    return {
      usageCount: usedIn.length,
      usedIn,
    };
  }

  /**
   * Delete media record and perform Global Cascade Unlink across all referencing records
   */
  async deleteMedia(id) {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new Error('Media asset not found');
    }

    const fileUrl = media.fileUrl;
    const filename = path.basename(fileUrl.split('?')[0]);
    const unlinkedLocations = [];

    // 1. Unlink from Projects
    try {
      const projects = await prisma.project.findMany().catch(() => []);
      for (const p of projects) {
        let needsUpdate = false;
        let newCover = p.coverImage;
        let newGallery = p.galleryImages;

        if (p.coverImage && (p.coverImage === fileUrl || (filename && p.coverImage.includes(filename)))) {
          newCover = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800'; // fallback
          needsUpdate = true;
          unlinkedLocations.push(`Project: "${p.title}" Cover Image`);
        }

        if (p.galleryImages && (p.galleryImages.includes(fileUrl) || (filename && p.galleryImages.includes(filename)))) {
          try {
            let gArr = typeof p.galleryImages === 'string' ? JSON.parse(p.galleryImages) : p.galleryImages;
            if (Array.isArray(gArr)) {
              gArr = gArr.filter((img) => img !== fileUrl && !img.includes(filename));
              newGallery = JSON.stringify(gArr);
              needsUpdate = true;
              unlinkedLocations.push(`Project: "${p.title}" Gallery Item`);
            }
          } catch (e) {}
        }

        if (needsUpdate) {
          await prisma.project.update({
            where: { id: p.id },
            data: { coverImage: newCover, galleryImages: newGallery },
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Project cascade unlink error:', err.message);
    }

    // 2. Unlink from Testimonials
    try {
      const testimonials = await prisma.testimonial.findMany().catch(() => []);
      for (const t of testimonials) {
        let updateData = {};
        if (t.clientAvatar && (t.clientAvatar === fileUrl || (filename && t.clientAvatar.includes(filename)))) {
          updateData.clientAvatar = null;
          unlinkedLocations.push(`Testimonial: "${t.clientName}" Client Avatar`);
        }
        if (t.brandLogo && (t.brandLogo === fileUrl || (filename && t.brandLogo.includes(filename)))) {
          updateData.brandLogo = null;
          unlinkedLocations.push(`Testimonial: "${t.clientCompany}" Brand Logo`);
        }
        if (Object.keys(updateData).length > 0) {
          await prisma.testimonial.update({
            where: { id: t.id },
            data: updateData,
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Testimonial cascade unlink error:', err.message);
    }

    // 3. Unlink from Client Brands
    try {
      const brands = await prisma.clientBrand.findMany().catch(() => []);
      for (const b of brands) {
        if (b.logoUrl && (b.logoUrl === fileUrl || (filename && b.logoUrl.includes(filename)))) {
          await prisma.clientBrand.update({
            where: { id: b.id },
            data: { logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
          }).catch(() => {});
          unlinkedLocations.push(`Brand: "${b.name}" Logo`);
        }
      }
    } catch (err) {
      console.warn('Brand cascade unlink error:', err.message);
    }

    // 4. Unlink from Site Settings
    try {
      const settings = await prisma.siteSetting.findMany().catch(() => []);
      for (const s of settings) {
        if (s.value && (s.value === fileUrl || (filename && typeof s.value === 'string' && s.value.includes(filename)))) {
          await prisma.siteSetting.update({
            where: { id: s.id },
            data: { value: '' },
          }).catch(() => {});
          unlinkedLocations.push(`Site Setting: "${s.key}"`);
        }
      }
    } catch (err) {
      console.warn('Settings cascade unlink error:', err.message);
    }

    // 5. Unlink from User Avatar
    try {
      const users = await prisma.user.findMany().catch(() => []);
      for (const u of users) {
        if (u.avatar && (u.avatar === fileUrl || (filename && u.avatar.includes(filename)))) {
          await prisma.user.update({
            where: { id: u.id },
            data: { avatar: null },
          }).catch(() => {});
          unlinkedLocations.push(`User: "${u.name}" Avatar`);
        }
      }
    } catch (err) {
      console.warn('User avatar cascade unlink error:', err.message);
    }

    // 6. Delete physical file from Local Storage or Cloudinary
    if (media.source === 'LOCAL' && fileUrl.startsWith('/uploads/')) {
      const { UPLOADS_DIR } = require('../config/persistentStorage');
      const localFilePath = path.join(UPLOADS_DIR, path.basename(fileUrl));
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
          console.log(`🗑️ Deleted local physical file: ${localFilePath}`);
        } catch (err) {
          console.warn('Failed to delete local file:', err.message);
        }
      }
    } else if (media.source === 'CLOUDINARY' && isCloudinaryConfigured) {
      try {
        const publicId = path.basename(media.fileUrl, path.extname(media.fileUrl));
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Failed to delete Cloudinary asset:', cloudErr.message);
      }
    }

    // 7. Delete database record
    await prisma.media.delete({
      where: { id },
    }).catch(() => null);

    return {
      success: true,
      unlinkedCount: unlinkedLocations.length,
      unlinkedLocations,
    };
  }
}

module.exports = new MediaService();
