const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { initializeSocket } = require('./utils/socket');

/* ================= LOAD ENV ================= */
dotenv.config();

/* ================= APP & SERVER ================= */
const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

/* ================= DEBUG ENV ================= */
console.log('Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded ✓' : 'Missing ✗');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded ✓' : 'Missing ✗');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

/* ================= MIDDLEWARE ================= */
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */
// uploaded images/videos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// fallback / seeded images
app.use('/image', express.static(path.join(__dirname, '../image')));

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

/* ================= SOCKET ================= */
initializeSocket(io);
app.set('io', io);

/* ================= ROUTES ================= */
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/market-prices', require('./routes/marketPrice.routes'));
app.use('/api/waste-products', require('./routes/wasteProduct.routes'));

/* ================= HEALTH CHECK ================= */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    time: new Date(),
  });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* ================= 404 ================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
