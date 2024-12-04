const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const Blog = require("../models/BlogModel");
const Coupon = require("../models/CouponModel");

const getRevenueByChartType = (chartType, fromDate, toDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      let startDate, endDate;
      const now = new Date();

      // Logic để xác định khoảng thời gian dựa trên loại biểu đồ
      if (chartType === "Month") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        endDate = now;
      } else if (chartType === "3Month") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 3);
        endDate = now;
      } else if (chartType === "Year") {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        endDate = now;
      } else if (chartType === "FromTo") {
        if (!fromDate || !toDate) {
          reject({
            status: "ERR",
            message:
              "From date and to date must be provided for FromTo chartType",
          });
          return;
        }
        startDate = new Date(fromDate);
        endDate = new Date(toDate);
      } else {
        reject({ status: "ERR", message: "Invalid chart type" });
        return;
      }

      const revenueData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            isPaid: true,
          },
        },
        {
          $unwind: "$orderItems", // Tách từng item trong orderItems ra để tính tổng số lượng
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: chartType === "Year" ? "%m/%Y" : chartType === "3Month" ? "%d/%m" : "%d/%m/%Y", // Định dạng dựa trên chartType
                date: "$createdAt",
              },
            },
            totalRevenue: { $sum: "$totalPrice" }, // Tổng doanh thu
            totalSold: { $sum: "$orderItems.amount" }, // Tổng số lượng đã bán
          },
        },
        {
          $project: {
            date: "$_id", // Ngày theo định dạng đã cấu hình
            totalRevenue: 1,
            totalSold: 1, // Số lượng đã bán
            _id: 0,
          },
        },
        { $sort: { date: 1 } },
      ]);

      resolve({ status: "OK", data: revenueData });
    } catch (error) {
      reject({ status: "ERR", message: error.message });
    }
  });
};
const getDashboardSummary = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalProducts = await Product.countDocuments();

      const totalOrders = await Order.countDocuments();

      const totalCustomers = await User.countDocuments();

      const totalArticles = await Blog.countDocuments();

      const totalCoupons = await Coupon.countDocuments();

      const orderStatuses = await Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            orderStatus: "$_id",
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: {
            orderStatus: 1,
          },
        },
      ]);

      const orderStatusesWithPercentage = orderStatuses.map((status) => {
        const percentage = parseFloat(
          (status.count / totalOrders) * 100
        ).toFixed(2);
        return {
          orderStatus: status.orderStatus,
          count: status.count,
          percentage: percentage,
        };
      });

      resolve({
        status: "OK",
        data: {
          totalProducts,
          totalOrders,
          totalCustomers,
          totalArticles,
          totalCoupons,
          orderStatuses: orderStatusesWithPercentage,
        },
      });
    } catch (error) {
      reject({ status: "ERR", message: error.message });
    }
  });
};

const getChartCategoryStock = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Aggregate products by type and calculate the total count in stock for each type
            const categoryStock = await Product.aggregate([
              {
                $group: {
                  _id: "$type", // Group by product type
                  totalStock: { $sum: "$countInStock" }, // Sum stock count for each type
                },
              },
              {
                $project: {
                  type: "$_id", 
                  totalStock: 1,  
                  _id: 0,  
                },
              },
              { $sort: { totalStock: -1 } },  
            ]);
        
            resolve({
                status: "OK",
                data: categoryStock
              });
            } catch (error) {
              reject({ status: "ERR", message: error.message });
            }
    })
  };


  const getChartProductStock = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const productStock = await Product.aggregate([
          {
            $group: {
              _id: "$name", // Nhóm theo tên của từng sản phẩm
              countInStock: { $sum: "$countInStock" }, // Tổng số lượng tồn kho cho mỗi sản phẩm
            },
          },
          {
            $project: {
              productName: "$_id", // Trả về tên sản phẩm
              countInStock: 1, // Trả về số lượng tồn kho
              _id: 0,
            },
          },
          { $sort: { countInStock: 1 } }, // Sắp xếp theo số lượng tồn kho (tăng dần, tức là sản phẩm tồn kho thấp nhất sẽ lên trước)
          { $limit: 10 } // Lấy ra top 10 sản phẩm có lượng tồn kho thấp nhất (có thể điều chỉnh giới hạn này)
        ]);
  
        resolve({
          status: "OK",
          data: productStock
        });
      } catch (error) {
        reject({ status: "ERR", message: error.message });
      }
    });
  };
  


const getStockPercentage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const totalProducts = await Product.countDocuments();
        if (totalProducts === 0) {
          return resolve({
            status: "OK",
            data: {
              lowStockPercentage: 0,
              inStockPercentage: 0,
            },
          });
        }
  
        const lowStockCount = await Product.countDocuments({
          countInStock: { $lte: 100 }, // Giả sử 10 là mức sắp hết hàng
        });
  
        const lowStockPercentage = parseInt(
          (lowStockCount / totalProducts) * 100
        )
        const inStockPercentage = parseInt(
          ((totalProducts - lowStockCount) / totalProducts) * 100
        )
  
        resolve({
          status: "OK",
          data: {
            lowStockPercentage: lowStockPercentage,
            inStockPercentage: inStockPercentage,
          },
        });
      } catch (error) {
        reject({ status: "ERR", message: error.message });
      }
    });
  };

module.exports = {
  getRevenueByChartType,
  getDashboardSummary,
  getChartCategoryStock,
  getChartProductStock,
  getStockPercentage
};
