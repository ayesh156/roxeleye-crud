const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/items');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage for processing with sharp
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn('Invalid file type attempted', { 
      mimetype: file.mimetype, 
      originalname: file.originalname 
    });
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (before compression)
  }
});

// Middleware to compress and convert image to WebP
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `item-${uniqueSuffix}.webp`;
    const outputPath = path.join(uploadsDir, filename);

    // Process image with sharp - resize, compress, convert to WebP
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Update req.file with new filename
    req.file.filename = filename;
    req.file.path = outputPath;

    logger.info('Image processed and converted to WebP', { 
      originalName: req.file.originalname,
      newFilename: filename 
    });

    next();
  } catch (error) {
    logger.error('Image processing failed', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      error: 'Failed to process image'
    });
  }
};

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer upload error', { error: err.message, code: err.code });
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: err.message
    });
  } else if (err) {
    logger.error('Upload error', { error: err.message });
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};

// Helper function to delete image file
const deleteImageFile = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info('Deleted image file', { path: imagePath });
    }
  }
};

module.exports = {
  upload,
  handleUploadError,
  processImage,
  deleteImageFile
};
