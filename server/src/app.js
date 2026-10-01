// server/src/app.js
// Express application configuration and middleware stack.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiters');
const { sendSuccess } = require('./utils/response');

// Route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const retailerRoutes = require('./routes/retailer.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow the configured frontend URL with credentials (for cookies)
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true
  })
);

// Cookie parsing for refresh tokens
app.use(cookieParser());

// Body parsing with 2MB limit (avatars can be large base64 strings)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Apply general rate limit to all routes
app.use(generalLimiter);

// Public health check
app.get('/api/health', (req, res) => {
  return sendSuccess(res, { ok: true, status: 'healthy', timestamp: Date.now() });
});

// Mount route files
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/retailer', retailerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler — must be the LAST middleware
app.use(errorHandler);

module.exports = app;
