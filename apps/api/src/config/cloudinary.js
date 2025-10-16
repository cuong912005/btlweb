import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for channel images
export const channelImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'volunteerhub/channel-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' }, // Limit max dimensions
      { quality: 'auto' }, // Auto optimize quality
      { fetch_format: 'auto' } // Auto format optimization
    ]
  }
});

// Configure Cloudinary storage for user avatars
export const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'volunteerhub/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop focused on face
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Configure Cloudinary storage for event images
export const eventImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'volunteerhub/event-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1600, height: 900, crop: 'limit' }, // 16:9 aspect ratio limit
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (imageUrl, folder = '') => {
  if (!imageUrl) return null;
  
  try {
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicIdWithExtension = filename.split('.')[0];
    
    return folder ? `${folder}/${publicIdWithExtension}` : publicIdWithExtension;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Helper function to delete image from Cloudinary
export const deleteCloudinaryImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

export default cloudinary;