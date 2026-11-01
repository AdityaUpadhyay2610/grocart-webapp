const express = require('express');
const router = express.Router();
const { validateCoupon } = require('../controllers/coupon.controller');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { validateCouponRules } = require('../validators/coupon.validators');

router.post('/validate', verifyToken, validateCouponRules, validate, validateCoupon);

module.exports = router;
