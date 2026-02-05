const Product = require('../models/Product.model');
const {
  emitProductAdded,
  emitProductUpdated,
  emitProductDeleted,
} = require('../utils/socket');

/* ================= GET ALL PRODUCTS ================= */
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('seller', 'name avatar rating')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= SEARCH PRODUCTS ================= */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    const products = await Product.find({
      name: { $regex: q, $options: 'i' },
    });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET SINGLE PRODUCT ================= */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name avatar rating');

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/* ================= CREATE PRODUCT (CLOUDINARY ONLY) ================= */
exports.createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      seller: req.user._id,
    };

    // ✅ Cloudinary URLs only
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
    }

    const product = await Product.create(productData);
    emitProductAdded(product);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    emitProductUpdated(product);

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false });
    }

    await product.deleteOne();
    emitProductDeleted(product._id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ================= ADD REVIEW ================= */
exports.addReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    product.reviews.push({
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    await product.save();

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};
