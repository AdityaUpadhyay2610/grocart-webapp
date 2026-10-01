// server/src/routes/auth.routes.js
// Wires up all auth endpoints. No logic here — just routes + middleware.

const express = require('express');
const router = express.Router();

const { authLimiter, refreshLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const verifyToken = require('../middleware/verifyToken');
const { registerRules, loginRules } = require('../validators/auth.validators');
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  resendVerification
} = require('../controllers/auth.controller');

// Public routes — rate limited
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);

// Protected routes — require a valid access token
router.get('/me', verifyToken, getMe);
router.post('/resend-verification', verifyToken, resendVerification);

module.exports = router;
