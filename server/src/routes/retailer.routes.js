// server/src/routes/retailer.routes.js
// Routes for retailer operations: product management, inventory, and analytics.

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const retailerController = require('../controllers/retailer.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { saveProductRules, idParamRules } = require('../validators/product.validators');

// All retailer routes require a valid access token
router.use(verifyToken);

// GET /api/retailer/products — retailer only, fetch own inventory
router.get(
  '/products',
  requireRole('retailer'),
  productController.getRetailerProducts
);

// PUT /api/retailer/products/:id — retailer only, upsert product (create or update)
router.put(
  '/products/:id',
  requireRole('retailer'),
  idParamRules,
  saveProductRules,
  validate,
  productController.saveProduct
);

// DELETE /api/retailer/products/:id — retailer (owner) or admin
router.delete(
  '/products/:id',
  requireRole('retailer', 'admin'),
  idParamRules,
  validate,
  productController.deleteProduct
);

// GET /api/retailer/analytics — retailer only, view own sales/profit metrics
router.get(
  '/analytics',
  requireRole('retailer'),
  retailerController.getRetailerAnalytics
);

// GET /api/retailer/orders — retailer only, view orders containing retailer's items
router.get(
  '/orders',
  requireRole('retailer'),
  retailerController.getRetailerOrders
);

module.exports = router;
