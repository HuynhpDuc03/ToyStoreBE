const Coupon = require("../models/CouponModel");
const { v4: uuidv4 } = require('uuid');

const createCoupon = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const name = `DaH_${uuidv4().split('-')[0]}`;
      const discount = Math.floor(Math.random() * 50) + 1;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 7);
      const newCoupon = await Coupon.create({
        name,
        discount,
        startDate,
        endDate,
      });

      if (newCoupon) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: newCoupon,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updateCoupon = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkCoupon = await Coupon.findOne({
        _id: id,
      });
      if (checkCoupon === null) {
        resolve({
          status: "ERR",
          message: "The Coupon is not defined",
        });
      }
      const updatedCoupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedCoupon,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteCoupon = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Coupon.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete coupon success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllCoupons = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: coupons,
      });
    } catch (e) {
      reject(e);
    }
  });
};


const getDetailsCoupon = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const coupon = await Coupon.findOne({
        _id: id,
      });
      if (coupon === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCESS",
        data: coupon,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const applyCoupon = (couponCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const coupon = await Coupon.findOne({ name: couponCode });
      if (!coupon) {
        resolve({
          status: "ERR",
          message: "Coupon not found",
        });
        return;
      }

      const currentDate = new Date();
      if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
        resolve({
          status: "ERR",
          message: "Coupon is expired",
        });
        return;
      }

      resolve({
        status: "OK",
        message: "Coupon applied",
        discount: coupon.discount,
      });
    } catch (e) {
      reject(e);
    }
  });
};


module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  getDetailsCoupon,
  applyCoupon
};
