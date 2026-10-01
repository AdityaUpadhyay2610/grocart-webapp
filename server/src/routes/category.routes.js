// server/src/routes/category.routes.js
// Routes for product categories.

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// GET /api/categories — public
router.get('/', categoryController.getCategories);

module.exports = router;
