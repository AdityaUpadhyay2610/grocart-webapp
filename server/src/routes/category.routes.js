// server/src/routes/category.routes.js
// Routes for product categories.

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { searchLimiter } = require('../middleware/rateLimit');

// GET /api/categories — public
router.get('/', searchLimiter, categoryController.getCategories);

module.exports = router;
