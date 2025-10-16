import multer from 'multer';
import { channelImageStorage } from './cloudinary.js';

// Multer configuration for channel image uploads
export const channelImageUpload = multer({
  storage: channelImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép tải lên hình ảnh (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File quá lớn',
        message: 'Kích thước file không được vượt quá 5MB'
      });
    }
    return res.status(400).json({
      error: 'Lỗi tải lên file',
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      error: 'Lỗi tải lên file',
      message: err.message
    });
  }
  next();
};