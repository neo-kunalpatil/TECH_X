const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary.config');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gofarm',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

const uploadProductFiles = upload.fields([
  { name: 'images', maxCount: 5 },
]);

module.exports = { uploadProductFiles };
