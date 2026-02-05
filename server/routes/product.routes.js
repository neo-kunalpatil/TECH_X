const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');

// PUBLIC
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProduct);

// PROTECTED
router.use(protect);

router.post(
  '/',
  authorize('farmer', 'retailer'),
  upload.array('images', 5),
  productController.createProduct 
);

router.put('/:id', authorize('farmer', 'retailer'), productController.updateProduct);
router.delete('/:id', authorize('farmer', 'retailer'), productController.deleteProduct);
router.post('/:id/review', productController.addReview);

module.exports = router;
