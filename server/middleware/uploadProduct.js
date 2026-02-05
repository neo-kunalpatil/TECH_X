const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config');

// IMAGE storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gofarm/products/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// VIDEO storage
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gofarm/products/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
  },
});

const uploadImages = multer({ storage: imageStorage });
const uploadVideos = multer({ storage: videoStorage });

module.exports = {
  uploadProductFiles: [
    uploadImages.array('images', 10),
    uploadVideos.array('videos', 5),
  ],
};
