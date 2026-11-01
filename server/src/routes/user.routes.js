// server/src/routes/user.routes.js
// Wires up user profile update endpoint.

const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const { profileLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { updateProfileRules } = require('../validators/user.validators');
const { updateProfile } = require('../controllers/user.controller');

// PUT /api/users/me — update own profile
router.put('/me', verifyToken, profileLimiter, updateProfileRules, validate, updateProfile);

module.exports = router;
