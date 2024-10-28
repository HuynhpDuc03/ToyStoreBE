const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("../services/EmailService");
const VnProvinces = require("vn-local-plus");

const getAddressDetails = (cityCode, districtCode, wardCode) => {
  const city = VnProvinces.getProvinceByCode(cityCode)?.name;
  const district = VnProvinces.getDistrictByCode(districtCode)?.name;
  const ward = VnProvinces.getWardByCode(wardCode)?.name;

  return { city, district, ward };
};
const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    const {
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
      isPaid,
      paidAt,
      discountPrice,
      email,
    } = newOrder;

    try {
      // Sử dụng bulkWrite để cập nhật sản phẩm
      const bulkOperations = orderItems.map((order) => ({
        updateOne: {
          filter: {
            _id: order.product,
            countInStock: { $gte: order.amount }, // Chỉ cập nhật nếu đủ số lượng
          },
          update: {
            $inc: {
              countInStock: -order.amount,
              selled: order.amount,
            },
          },
        },
      }));

      // Thực hiện bulkWrite
      const bulkResult = await Product.bulkWrite(bulkOperations);

      // Kiểm tra sản phẩm nào không cập nhật thành công
      if (bulkResult.modifiedCount < orderItems.length) {
        const insufficientStock = orderItems.filter((item, index) => !bulkResult.modifiedCount[index]);
        const arrId = insufficientStock.map((item) => item.product);
        return resolve({
          status: "ERR",
          message: `Sản phẩm với id: ${arrId.join(", ")} không đủ hàng`,
        });
      }

      // Tạo đơn hàng
      const createdOrder = await Order.create({
        orderItems,
        shippingAddress: {
          fullName,
          address,
          city,
          district,
          ward,
          phone,
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        user,
        email,
        isPaid,
        paidAt,
        discountPrice,
      });

      // Thực hiện gửi email không đồng bộ
      const { city: cityName, district: districtName, ward: wardName } = getAddressDetails(city, district, ward);
      const orderDetails = {
        fullName,
        email,
        phone,
        address,
        city: cityName,
        district: districtName,
        ward: wardName,
        orderNumber: createdOrder._id,
        orderDate: createdOrder.createdAt,
        totalPrice: createdOrder.totalPrice,
      };

      // Gửi email sau khi API phản hồi
      setImmediate(async () => {
        try {
          await EmailService.sendEmailCreateOrder(email, fullName, orderItems, orderDetails);
        } catch (error) {
          console.error(`Error sending email: ${error.message}`);
        }
      });

      // Phản hồi ngay lập tức mà không đợi email hoàn thành
      return resolve({
        status: "OK",
        message: "success",
      });

    } catch (error) {
      return reject(error);
    }
  });
};

const getAllOrderDetails = (id, page, limit, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = page * limit;
      const query = { user: id };
       
      if (status !== '0') {  
        query.orderStatus = status;
      }

      const totalOrders = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      if (orders.length === 0) {
        resolve({
          status: "ERR",
          message: "No orders found",
        });
      } else {
        resolve({
          status: "OK",
          message: "SUCCESS",
          total: totalOrders,
          data: orders,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const getOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById({
        _id: id,
      });
      if (order === null) {
        resolve({
          status: "ERR",
          message: "The order is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCESSS",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const cancelOrderDetails = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = [];
      const promises = data.map(async (order) => {
        const productData = await Product.findOneAndUpdate(
          {
            _id: order.product,
            selled: { $gte: order.amount },
          },
          {
            $inc: {
              countInStock: +order.amount,
              selled: -order.amount,
            },
          },
          { new: true }
        );
        if (productData) {
          order = await Order.findByIdAndDelete(id);
          if (order === null) {
            resolve({
              status: "ERR",
              message: "The order is not defined",
            });
          }
        } else {
          return {
            status: "OK",
            message: "ERR",
            id: order.product,
          };
        }
      });
      const results = await Promise.all(promises);
      const newData = results && results[0] && results[0].id;

      if (newData) {
        resolve({
          status: "ERR",
          message: `San pham voi id: ${newData} khong ton tai`,
        });
      }
      resolve({
        status: "OK",
        message: "success",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const getAllOrder = (page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;

      // Fetch orders for the current page
      const allOrder = await Order.find()
        .sort({
          createdAt: -1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination info
      const totalOrders = await Order.countDocuments();

      // Calculate total revenue (sum of totalPrice for all paid orders)
      const totalRevenue = await Order.aggregate([
        { $match: { isPaid: true } }, // Only paid orders
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }, // Sum totalPrice
      ]);

      // If totalRevenue is empty, set it to 0
      const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

      resolve({
        status: "OK",
        message: "Success",
        data: allOrder,
        total: totalOrders,
        page,
        limit,
        totalRevenue: revenue, // Include total revenue in the response
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateOrderStatus = (orderId, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: status },
        { new: true }
      );
      if (!order) {
        return resolve({
          status: "ERR",
          message: "Order not found",
        });
      }
      resolve({
        status: "OK",
        message: "Success",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const markOrderAsReceived = async (orderId, isPaid, isDelivered) => {
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { isPaid, isDelivered },
      { new: true }
    );
    return order
      ? { status: "OK", message: "Success", data: order }
      : { status: "ERR", message: "Order not found" };
  } catch (e) {
    throw new Error(e.message);
  }
};




module.exports = {
  createOrder,
  getAllOrderDetails,
  getOrderDetails,
  cancelOrderDetails,
  getAllOrder,
  updateOrderStatus,
  markOrderAsReceived,
};
