const ZaloPayConfig = require("../config/db/zalopay");
const OrderService = require("../services/OrderService");
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const crypto = require('crypto');

const createZaloPayOrder = async (req, res) => {
  try {
    const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, district, ward, phone, user, email } = req.body;

    if (!orderItems || !paymentMethod || !itemsPrice || !shippingPrice || !totalPrice || !fullName || !address || !city || !district || !ward || !phone || !email) {
      return res.status(400).json({ status: "ERR", message: "Invalid input" });
    }

    // Tạo đơn hàng trong hệ thống trước
    const orderResult = await OrderService.createOrder({
      orderItems,
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
      user,
      email,
    });

    if (orderResult.status !== "OK") {
      return res.status(400).json({ status: "ERR", message: orderResult.message });
    }

    // Lấy OrderID từ đơn hàng đã tạo
    const orderId = orderResult.data?._id; // Giả sử createOrder trả về đơn hàng mới tạo trong `data`

    const embed_data = {orderId};
    const items = orderItems.map((item) => ({
      id: item.product,
      name: item.name,
      price: item.price,
      quantity: item.amount,
    }));
    const now = Date.now();
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: ZaloPayConfig.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // Mã giao dịch unique
      app_user: email,
      app_time: now, // Thời gian tạo đơn
      amount: totalPrice, // Số tiền
      embed_data: JSON.stringify(embed_data),
      item: JSON.stringify(items),
      description: `AntDesign - Payment for order #${orderId}`,
      bank_code: "",
      callback_url: ZaloPayConfig.linkcallback,
    };

    // Tạo chữ ký (HMAC-SHA256)
    const data = ZaloPayConfig.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, ZaloPayConfig.key1).toString();

    // Gửi request tạo thanh toán tới ZaloPay
    const response = await axios.post(ZaloPayConfig.endpoint, null, { params: order });
    const { return_code, order_url, zp_trans_token } = response.data;

    if (return_code !== 1) {
      return res.status(500).json({
        status: "ERR",
        message: "Failed to create ZaloPay order",
        zalopay_response: response.data,
      });
    }

    // Cập nhật trạng thái thanh toán của đơn hàng
    await OrderService.updateOrderPayment(orderId, zp_trans_token);

    // Trả về URL thanh toán
    return res.status(200).json({ status: "OK", payment_url: order_url });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ status: "ERR", message: err.message });
  }
};



const handleZaloPayCallback = async (req, res) => {
  try {

    const { data, mac } = req.body;
    const recalculatedMac = crypto.createHmac("sha256", ZaloPayConfig.key2).update(data).digest("hex");

    if (mac !== recalculatedMac) {
      return res.status(400).json({ status: "ERR", message: "Invalid signature" });
    }

    const callbackData = JSON.parse(data);
    const { embed_data } = callbackData;
    const { orderId } = JSON.parse(embed_data);


    if (req.body.type === 1) {
      await OrderService.updateOrderStatusZaloPay(orderId, true);
    }
    
    // Phản hồi OK với ZaloPay
    return res.status(200).json({ status: "OK", message: "Payment success" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ return_code: -1, return_message: "Error" });
  }
};

module.exports = {
  createZaloPayOrder,
  handleZaloPayCallback
};
