const Rating = require("../models/RatingModel");
const Product = require("../models/ProductModel");
const Order = require("../models/OrderProduct");


const addRating = ({orderId, product, user, rating, comment, image }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
      const existingRating = await Rating.findOne({ orderId });
      if (existingRating) {
        return reject({
          status: "ERROR",
          message: "User has already rated this product",
        });
      }

      // Thêm đánh giá mới
      const newRating = new Rating({ order:orderId,product, user, rating, comment, image });
      await newRating.save();

      // Cập nhật điểm đánh giá trung bình của sản phẩm
      await updateProductAverageRating(product);

      
      await Order.updateOne(
        { _id: orderId, "orderItems.product": product },  
        { $set: { "orderItems.$.isRating": true } },  
        { arrayFilters: [{ "item.product": product }] }  
      );
      

      resolve({
        status: "OK",
        message: "Rating added successfully",
        data: newRating,
      });
    } catch (e) {
      reject({
        status: "ERROR",
        message: e.message,
      });
    }
  });
};


const updateProductAverageRating = async (productId) => {
    try {
      // Lấy tất cả đánh giá của sản phẩm
      const ratings = await Rating.find({ product: productId });
      const totalRatings = ratings.length;
      const averageRating =
        ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings;
  
      // Cập nhật trường rating trong Product
      await Product.findByIdAndUpdate(productId, {
        rating: parseFloat(averageRating.toFixed(1)), // cập nhật trường rating
      });
    } catch (error) {
      console.error("Error updating product rating:", error.message);
    }
  };
  

module.exports = {
  addRating,
};
