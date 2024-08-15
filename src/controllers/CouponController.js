const CouponService = require("../services/CouponService");

const createCoupon = async (req, res) => {
  try {
    const response = await CouponService.createCoupon();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message,
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const data = req.body;
    if (!couponId) {
      return res.status(200).json({
        status: "ERR",
        message: "The couponId is required",
      });
    }
    const response = await CouponService.updateCoupon(couponId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    if (!couponId) {
      return res.status(200).json({
        status: "ERR",
        message: "The couponId is required",
      });
    }
    const response = await CouponService.deleteCoupon(couponId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const response = await CouponService.getAllCoupons();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    if (!couponId) {
      return res.status(200).json({
        status: "ERR",
        message: "The couponId is required",
      });
    }
    const response = await CouponService.getDetailsCoupon(couponId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const response = await CouponService.applyCoupon(couponCode);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message,
    });
  }
};


module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  getDetailsCoupon,
  applyCoupon
};
