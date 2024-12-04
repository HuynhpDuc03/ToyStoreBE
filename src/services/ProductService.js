const Product = require("../models/ProductModel");
const Rating = require("../models/RatingModel");

const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    const {
      name,
      image,
      type,
      countInStock,
      price,
      rating,
      description,
      discount,
    } = newProduct;
    try {
      const checkProduct = await Product.findOne({
        name: name,
      });
      if (checkProduct !== null) {
        resolve({
          status: "ERR",
          message: "The name of product is already",
        });
      } else {
        const newProduct = await Product.create({
          name,
          image,
          type,
          countInStock: Number(countInStock),
          price: Number(price),
          rating: parseFloat(rating),
          description,
          discount: Number(discount),
        });
        if (newProduct) {
          resolve({
            status: "OK",
            message: "SUCCESS",
            data: newProduct,
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      if (checkProduct === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedProduct,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      if (checkProduct === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      await Product.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete product success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteManyProduct = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Product.deleteMany({ _id: ids });
      resolve({
        status: "OK",
        message: "Delete product success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// const getDetailsProduct = (id) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const product = await Product.findOneAndUpdate(
//         { _id: id },
//         { $inc: { viewCount: 1 } }, // Increment viewCount by 1
//         { new: true } // Return the updated product
//       );

//       if (!product) {
//         return resolve({
//           status: "ERR",
//           message: "The product is not defined",
//         });
//       }

//       resolve({
//         status: "OK",
//         message: "SUCCESS",
//         data: product,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };
const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm sản phẩm và tăng số lượt xem
      const product = await Product.findOneAndUpdate(
        { _id: id },
        { $inc: { viewCount: 1 } },
        { new: true }
      );

      if (!product) {
        return resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      // Tìm các đánh giá liên quan đến sản phẩm
      const ratings = await Rating.find({ product: id })
        .populate({
          path: "user",
          select: "name", // Chỉ lấy tên người dùng từ User
        })
        .select("user rating comment image createdAt"); // Chỉ chọn các trường cần thiết từ Rating

      // Trả về dữ liệu sản phẩm kèm mảng đánh giá
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: {
          product,
          ratings, // Đưa mảng đánh giá vào kết quả trả về
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllProduct = (filters, sort, page = 1, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tạo điều kiện lọc
      const query = {};
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange.split("-").map(Number);

        // Tính toán giá cuối cùng sau khi áp dụng discount
        query.$expr = {
          $and: [
            {
              $gte: [
                { $multiply: ["$price", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
                minPrice,
              ]
            },
            {
              $lte: [
                { $multiply: ["$price", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
                maxPrice,
              ]
            }
          ]
        };
      }

      // Sắp xếp
      let sortOption = {};
      switch (sort) {
        case "lowtohigh":
          sortOption.price = 1; // Sắp xếp theo giá tăng dần
          break;
        case "hightolow":
          sortOption.price = -1; // Sắp xếp theo giá giảm dần
          break;
        case "name-asc":
          sortOption.name = 1; // Sắp xếp theo tên A-Z
          break;
        case "name-desc":
          sortOption.name = -1; // Sắp xếp theo tên Z-A
          break;
        case "bestSeller":
          sortOption.bestSeller = -1; // Sắp xếp theo best seller
          break;
        case "popular":
          sortOption.viewCount = -1; // Sắp xếp theo số lượt xem
          break;
        case "newArrivals":
          sortOption.createdAt = -1; // Sắp xếp theo ngày tạo (mới nhất trước)
          break;
        default:
          break;
      }

      const pipeline = [{ $match: query }]; // Bắt đầu với giai đoạn $match

      // Chỉ thêm giai đoạn $sort nếu có điều kiện sắp xếp
      if (Object.keys(sortOption).length > 0) {
        pipeline.push({ $sort: sortOption });
      }

      pipeline.push({
        $project: {
          name: 1,
          image: { $arrayElemAt: ["$image", 0] }, // Lấy phần tử đầu tiên trong mảng image
          type: 1,
          price: 1,
          countInStock: 1,
          rating: 1,
          discount: 1,
          selled: 1,
          bestSeller: 1,
          hotSale: 1,
          newArrivals: 1,
        },
      });

      // Thêm phân trang
      const skip = (page - 1) * limit; // Tính số sản phẩm cần bỏ qua
      pipeline.push({ $skip: skip }); // Bỏ qua số sản phẩm đã tính
      pipeline.push({ $limit: limit }); // Giới hạn số sản phẩm trả về

      const products = await Product.aggregate(pipeline);

      // Tính tổng số sản phẩm để có thể phân trang
      const totalProducts = await Product.countDocuments(query); // Đếm tổng số sản phẩm phù hợp với điều kiện

      resolve({
        status: "OK",
        message: "Success",
        data: products,
        total: totalProducts, // Trả về tổng số sản phẩm
      });
    } catch (e) {
      reject('error');
    }
  });
};




// const getAllProduct = (limit, page, sort, filters) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let query = {};

//       // Apply filters
//       if (filters && Array.isArray(filters)) {
//         filters.forEach((filter) => {
//           const [key, value] = filter.split("=");
//           if (key && value) {
//             if (key === "type") {
//               query.type = value;
//             } else if (key === "name") {
//               query.name = { $regex: value, $options: "i" };
//             } else if (key === "price") {
//               const priceRanges = value.split(","); // Tách các dải giá
//               const priceConditions = priceRanges.map((range) => {
//                 const [min, max] = range.split("-").map(Number);
//                 let condition = {};
//                 if (min && max) {
//                   condition = {
//                     $and: [
//                       {
//                         $gte: [
//                           {
//                             $multiply: [
//                               "$price",
//                               {
//                                 $subtract: [1, { $divide: ["$discount", 100] }],
//                               },
//                             ],
//                           },
//                           min,
//                         ],
//                       },
//                       {
//                         $lte: [
//                           {
//                             $multiply: [
//                               "$price",
//                               {
//                                 $subtract: [1, { $divide: ["$discount", 100] }],
//                               },
//                             ],
//                           },
//                           max,
//                         ],
//                       },
//                     ],
//                   };
//                 } else if (min) {
//                   condition = {
//                     $gte: [
//                       {
//                         $multiply: [
//                           "$price",
//                           { $subtract: [1, { $divide: ["$discount", 100] }] },
//                         ],
//                       },
//                       min,
//                     ],
//                   };
//                 } else if (max) {
//                   condition = {
//                     $lte: [
//                       {
//                         $multiply: [
//                           "$price",
//                           { $subtract: [1, { $divide: ["$discount", 100] }] },
//                         ],
//                       },
//                       max,
//                     ],
//                   };
//                 }
//                 return condition;
//               });

//               // Dùng $or để lọc nhiều dải giá
//               query.$expr = {
//                 $or: priceConditions,
//               };
//             } else {
//               query[key] = { $regex: value, $options: "i" };
//             }
//           }
//         });
//       }

//       // Define sorting logic
//       let sortOrder = {};
//       if (sort) {
//         if (sort === "lowtohigh") {
//           sortOrder = { price: 1 }; // Sort by price ascending
//         } else if (sort === "hightolow") {
//           sortOrder = { price: -1 }; // Sort by price descending
//         } else if (sort === "name-asc") {
//           sortOrder = { name: 1 }; // Sort by name ascending
//         } else if (sort === "name-desc") {
//           sortOrder = { name: -1 }; // Sort by name descending
//         } else if (sort === "bestSeller") {
//           sortOrder = { selled: -1 }; // Sort by number of items sold descending (Best Seller)
//         } else if (sort === "popular") {
//           sortOrder = { viewCount: -1 }; // Sort by view count descending (Popular)
//         } else if (sort === "newArrivals") {
//           sortOrder = { createdAt: -1 }; // Sort by creation date descending (Newest)
//         }
//       }

//       // Get total number of products for pagination
//       const totalProduct = await Product.countDocuments(query);
//       let products = [];

//       // Fetch products with sorting and pagination
//       if (!limit) {
//         products = await Product.find(query)
//           .select('name price image rating selled')
//           .sort(sortOrder)
//           .sort({ createdAt: -1, updatedAt: -1 }); // Secondary sort by createdAt or updatedAt
//       } else {
//         products = await Product.find(query)
//           .select('name price image rating selled')
//           .sort(sortOrder)
//           .sort({ createdAt: -1, updatedAt: -1 })
//           .skip(page * limit)
//           .limit(limit);
//       }

//       resolve({
//         status: "OK",
//         message: "Success",
//         data: products,
//         total: totalProduct,
//         pageCurrent: Number(page + 1),
//         totalPage: Math.ceil(totalProduct / limit),
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

const getAllType = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allType = await Product.distinct("type");
      resolve({
        status: "OK",
        message: "Success",
        data: allType,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const getAllProductAdmin = (page = 1, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tính toán số sản phẩm cần bỏ qua
      const skip = (page - 1) * limit;

      // Pipeline để lấy dữ liệu sản phẩm
      const products = await Product.aggregate([
        {
          $project: {
            name: 1,
            type: 1,
            price: 1,
            countInStock: 1,
            rating: 1,
          },
        },
        { $skip: skip }, // Bỏ qua số sản phẩm dựa trên trang
        { $limit: limit }, // Giới hạn số sản phẩm trả về
      ]);

      // Tính tổng số sản phẩm để hỗ trợ phân trang
      const totalProducts = await Product.countDocuments();

      resolve({
        status: "OK",
        message: "Success",
        data: products,
        total: totalProducts, // Tổng số sản phẩm
        page, // Trang hiện tại
        totalPages: Math.ceil(totalProducts / limit), // Tổng số trang
      });
    } catch (e) {
      reject("Error fetching products");
    }
  });
};

const getSearchProduct = (query, limit = 6) => {
  return new Promise(async (resolve, reject) => {
    try {
      const searchRegex = new RegExp(query, "i"); // Tạo regex tìm kiếm không phân biệt chữ hoa chữ thường

      const products = await Product.aggregate([
        { 
          $match: { name: { $regex: searchRegex } }  // Tìm kiếm sản phẩm với tên khớp với regex
        },
        { 
          $project: {
            name: 1,
            price: 1,
            countInStock: 1,
            image: { $arrayElemAt: ["$image", 0] },  // Lấy phần tử đầu tiên từ mảng image
            discount: 1
          }
        },
        { 
          $limit: limit  // Giới hạn số lượng kết quả trả về
        }
      ]);

      resolve({
        status: "OK",
        message: "Search successful",
        data: products,
        total: products.length,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getProductRelated = (type, limit = 6) => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.aggregate([
        {
          $match: { type: type }  // Lọc sản phẩm theo thể loại, có thể mở rộng với nhiều thể loại
        },
        {
          $project: {
            name: 1,
            price: 1,
            countInStock: 1,
            image: { $arrayElemAt: ["$image", 0] },  // Lấy phần tử đầu tiên từ mảng image
            discount: 1,
            rating:1,
            selled:1,
            
          }
        },
        { 
          $limit: limit  // Giới hạn số lượng kết quả trả về
        }
      ]);

      resolve({
        status: "OK",
        message: "Related products retrieved successfully",
        data: products,
        total: products.length,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const getAllSpecialProducts = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const projection = {
        name: 1,
        price: 1,
        discount: 1,
        rating: 1,
        countInStock: 1,
        selled: 1,
        image: { $slice: 1 }, // Chỉ lấy phần tử đầu tiên của mảng image
      };

      // Lấy từng danh sách sản phẩm theo từng danh mục
      const bestSellerProducts = await Product.find({ bestSeller: true })
        .select(projection) // Chỉ lấy các trường cần thiết
        .sort({ createdAt: -1 })
        .limit(limit || 0);

      const hotSaleProducts = await Product.find({ hotSale: true })
        .select(projection)
        .sort({ createdAt: -1 })
        .limit(limit || 0);

      const newArrivalsProducts = await Product.find({ newArrivals: true })
        .select(projection)
        .sort({ createdAt: -1 })
        .limit(limit || 0);

      // Trả về kết quả đã phân loại
      resolve({
        status: "OK",
        message: "Success",
        data: {
          bestSellers: bestSellerProducts,
          hotSales: hotSaleProducts,
          newArrivals: newArrivalsProducts,
        },
        total: {
          bestSellers: bestSellerProducts.length,
          hotSales: hotSaleProducts.length,
          newArrivals: newArrivalsProducts.length,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  deleteManyProduct,
  getAllType,
  getAllSpecialProducts,
  getAllProductAdmin,
  getSearchProduct,
  getProductRelated
};
