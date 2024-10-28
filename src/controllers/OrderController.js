const OrderService = require("../services/OrderService");
const Order = require("../models/OrderProduct");
const createOrder = async (req, res) => {
  try {
    const {
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullName,
      address,
      city,
      district,
      ward,
      phone,
      discountPrice,
    } = req.body;

    // Validate inputs in a more efficient way
    if (
      !paymentMethod ||
      !itemsPrice ||
      !shippingPrice ||
      !totalPrice ||
      !fullName ||
      !address ||
      !city ||
      !district ||
      !ward ||
      !phone ||
      discountPrice === undefined
    ) {
      return res.status(400).json({ status: "ERR", message: "Invalid input" });
    }

    const response = await OrderService.createOrder(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const getAllOrderDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const { page = 0, limit = 10, status = 0 } = req.query;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await OrderService.getAllOrderDetails(
      userId,
      page,
      limit,
      status
    );
    return res.status(200).json(response);
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await OrderService.getOrderDetails(orderId);
    return res.status(200).json(response);
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e,
    });
  }
};

const cancelOrderDetails = async (req, res) => {
  try {
    const data = req.body.orderItems;

    const orderId = req.body.orderId;
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }
    const response = await OrderService.cancelOrderDetails(orderId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    const data = await OrderService.getAllOrder(page, limit);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({
        status: "ERR",
        message: "The orderId and status are required",
      });
    }
    const response = await OrderService.updateOrderStatus(orderId, status);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const markOrderAsReceived = async (req, res) => {
  try {
    const { orderId, isPaid, isDelivered } = req.body;
    if (!orderId || isPaid === undefined || isDelivered === undefined) {
      return res.status(400).json({
        status: "ERR",
        message: "The orderId, isPaid, and isDelivered are required",
      });
    }
    const response = await OrderService.markOrderAsReceived(
      orderId,
      isPaid,
      isDelivered
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrderDetails,
  getDetailsOrder,
  cancelOrderDetails,
  getAllOrder,
  updateOrderStatus,
  markOrderAsReceived,
};
