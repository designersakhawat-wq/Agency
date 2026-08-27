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

        // Clean up temporary local file
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
        // Fall back to local file if Cloudinary fails
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
   * Delete media record and associated physical file / Cloudinary asset
   */
  async deleteMedia(id) {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new Error('Media asset not found');
    }

    if (media.source === 'LOCAL') {
      const localFilePath = path.join(__dirname, '../../uploads', path.basename(media.fileUrl));
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
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

    await prisma.media.delete({
      where: { id },
    }).catch(() => null);

    return true;
  }
}

module.exports = new MediaService();
