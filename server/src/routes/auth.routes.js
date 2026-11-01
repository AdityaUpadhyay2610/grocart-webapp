// server/src/routes/auth.routes.js
// Wires up all auth endpoints. No logic here — just routes + middleware.

const express = require('express');
const router = express.Router();

const {
  loginLimiter,
  registerLimiter,
  refreshLimiter
} = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const verifyToken = require('../middleware/verifyToken');
const requireCookieRequestHeader = require('../middleware/requireCookieRequestHeader');
const {
  registerRules,
  loginRules,
  changePasswordRules
} = require('../validators/auth.validators');
const {
  register,
  login,
  refresh,
  logout,
  changePassword,
  getMe,
  resendVerification
} = require('../controllers/auth.controller');

// Public routes — rate limited
router.post('/register', registerLimiter, registerRules, validate, register);
router.post('/login', loginLimiter, loginRules, validate, login);
router.post('/refresh', refreshLimiter, requireCookieRequestHeader, refresh);
router.post('/logout', requireCookieRequestHeader, logout);

// Protected routes — require a valid access token
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, changePasswordRules, validate, changePassword);
router.post('/resend-verification', verifyToken, resendVerification);

module.exports = router;
