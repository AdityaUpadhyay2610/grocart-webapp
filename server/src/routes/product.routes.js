// server/src/routes/product.routes.js
// Public routes for product catalog browsing.

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET /api/products — public (active products only)
router.get('/', productController.getProducts);

module.exports = router;
