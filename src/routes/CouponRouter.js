const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/CouponController');
const { authMiddleWare } = require("../middleware/authMiddleware");

router.post('/createCoupon', authMiddleWare,CouponController.createCoupon);
router.put('/updateCoupon/:id', authMiddleWare,CouponController.updateCoupon);
router.delete('/deleteCoupon/:id', authMiddleWare,CouponController.deleteCoupon);
router.get('/getAllCoupons', CouponController.getAllCoupons);
router.get('/getDetailCoupon/:id', CouponController.getDetailsCoupon);
router.post('/applyCoupon', CouponController.applyCoupon);
module.exports = router;
