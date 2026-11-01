// server/src/routes/product.routes.js
// Public routes for product catalog browsing.

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const { paginationRules } = require('../validators/pagination.validators');

// GET /api/products — public (active products only)
router.get('/', paginationRules, validate, productController.getProducts);

module.exports = router;
