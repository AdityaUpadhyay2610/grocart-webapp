// server/src/routes/admin.routes.js
// Routes for platform administrator tasks. All routes strictly require the 'admin' role.

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const categoryController = require('../controllers/category.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createAdminRules, idParamRules } = require('../validators/admin.validators');
const { saveCategoryRules } = require('../validators/category.validators');

// All admin routes require authentication and the admin role
router.use(verifyToken);
router.use(requireRole('admin'));

// GET /api/admin/users — fetch all users across all roles
router.get('/users', adminController.getAllUsers);

// DELETE /api/admin/users/:id — delete user account (cascades all related data)
router.delete('/users/:id', idParamRules, validate, adminController.deleteUser);

// POST /api/admin/admins — create another admin
router.post('/admins', createAdminRules, validate, adminController.createAdmin);

// GET /api/admin/orders — fetch all orders across the platform
router.get('/orders', adminController.getAllOrders);

// GET /api/admin/platform-analytics — fetch platform-wide GMV, profit, retailers count
router.get('/platform-analytics', adminController.getPlatformAnalytics);

// POST /api/admin/categories — create or update a category by id
router.post('/categories', saveCategoryRules, validate, categoryController.saveCategory);

module.exports = router;
