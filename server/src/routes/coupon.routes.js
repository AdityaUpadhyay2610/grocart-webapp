const express = require('express');
const router = express.Router();
const { validateCoupon } = require('../controllers/coupon.controller');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { validateCouponRules } = require('../validators/coupon.validators');
const { couponLimiter } = require('../middleware/rateLimit');

router.post('/validate', verifyToken, couponLimiter, validateCouponRules, validate, validateCoupon);

module.exports = router;
