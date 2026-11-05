// server/src/routes/auth.routes.js
// Wires up all auth endpoints. No logic here — just routes + middleware.

const express = require('express');
const router = express.Router();

const {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  googleLimiter
} = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const verifyToken = require('../middleware/verifyToken');
const requireCookieRequestHeader = require('../middleware/requireCookieRequestHeader');
const {
  registerRules,
  loginRules,
  changePasswordRules,
  googleLoginRules
} = require('../validators/auth.validators');
const {
  register,
  login,
  refresh,
  logout,
  changePassword,
  getMe,
  resendVerification,
  googleNonce,
  googleLogin
} = require('../controllers/auth.controller');

// Public routes — rate limited
router.post('/register', registerLimiter, registerRules, validate, register);
router.post('/login', loginLimiter, loginRules, validate, login);

router.get('/google/nonce',requireCookieRequestHeader,googleNonce)
router.post('/google', googleLimiter, requireCookieRequestHeader,googleLoginRules, validate, googleLogin);

router.post('/refresh', refreshLimiter, requireCookieRequestHeader, refresh);
router.post('/logout', requireCookieRequestHeader, logout);

// Protected routes — require a valid access token
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, changePasswordRules, validate, changePassword);
router.post('/resend-verification', verifyToken, resendVerification);

module.exports = router;
