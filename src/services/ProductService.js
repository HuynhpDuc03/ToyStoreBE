const Product = require("../models/ProductModel");

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

const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOneAndUpdate(
        { _id: id },
        { $inc: { viewCount: 1 } }, // Increment viewCount by 1
        { new: true } // Return the updated product
      );

      if (!product) {
        return resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: product,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllProduct = (limit, page, sort, filters) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = {};

      // Apply filters
      if (filters && Array.isArray(filters)) {
        filters.forEach((filter) => {
          const [key, value] = filter.split("=");
          if (key && value) {
            if (key === "type") {
              query.type = value;
            } else if (key === "name") {
              query.name = { $regex: value, $options: "i" };
            } else if (key === "price") {
              const priceRanges = value.split(","); // Tách các dải giá
              const priceConditions = priceRanges.map((range) => {
                const [min, max] = range.split("-").map(Number);
                let condition = {};
                if (min && max) {
                  condition = {
                    $and: [
                      {
                        $gte: [
                          {
                            $multiply: [
                              "$price",
                              {
                                $subtract: [1, { $divide: ["$discount", 100] }],
                              },
                            ],
                          },
                          min,
                        ],
                      },
                      {
                        $lte: [
                          {
                            $multiply: [
                              "$price",
                              {
                                $subtract: [1, { $divide: ["$discount", 100] }],
                              },
                            ],
                          },
                          max,
                        ],
                      },
                    ],
                  };
                } else if (min) {
                  condition = {
                    $gte: [
                      {
                        $multiply: [
                          "$price",
                          { $subtract: [1, { $divide: ["$discount", 100] }] },
                        ],
                      },
                      min,
                    ],
                  };
                } else if (max) {
                  condition = {
                    $lte: [
                      {
                        $multiply: [
                          "$price",
                          { $subtract: [1, { $divide: ["$discount", 100] }] },
                        ],
                      },
                      max,
                    ],
                  };
                }
                return condition;
              });

              // Dùng $or để lọc nhiều dải giá
              query.$expr = {
                $or: priceConditions,
              };
            } else {
              query[key] = { $regex: value, $options: "i" };
            }
          }
        });
      }

      // Define sorting logic
      let sortOrder = {};
      if (sort) {
        if (sort === "lowtohigh") {
          sortOrder = { price: 1 }; // Sort by price ascending
        } else if (sort === "hightolow") {
          sortOrder = { price: -1 }; // Sort by price descending
        } else if (sort === "name-asc") {
          sortOrder = { name: 1 }; // Sort by name ascending
        } else if (sort === "name-desc") {
          sortOrder = { name: -1 }; // Sort by name descending
        } else if (sort === "bestSeller") {
          sortOrder = { selled: -1 }; // Sort by number of items sold descending (Best Seller)
        } else if (sort === "popular") {
          sortOrder = { viewCount: -1 }; // Sort by view count descending (Popular)
        } else if (sort === "newArrivals") {
          sortOrder = { createdAt: -1 }; // Sort by creation date descending (Newest)
        }
      }

      // Get total number of products for pagination
      const totalProduct = await Product.countDocuments(query);
      let products = [];

      // Fetch products with sorting and pagination
      if (!limit) {
        products = await Product.find(query)
          .sort(sortOrder)
          .sort({ createdAt: -1, updatedAt: -1 }); // Secondary sort by createdAt or updatedAt
      } else {
        products = await Product.find(query)
          .sort(sortOrder)
          .sort({ createdAt: -1, updatedAt: -1 })
          .skip(page * limit)
          .limit(limit);
      }

      resolve({
        status: "OK",
        message: "Success",
        data: products,
        total: totalProduct,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalProduct / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

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
const getAllSpecialProducts = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const queryOptions = { bestSeller: true, hotSale: true, newArrivals: true };
      const bestSellerProducts = await Product.find({ ...queryOptions, bestSeller: true })
        .sort({ createdAt: -1 })
        .limit(limit || 0); // Nếu limit là null, thì không giới hạn

      const hotSaleProducts = await Product.find({ ...queryOptions, hotSale: true })
        .sort({ createdAt: -1 })
        .limit(limit || 0);

      const newArrivalsProducts = await Product.find({ ...queryOptions, newArrivals: true })
        .sort({ createdAt: -1 })
        .limit(limit || 0);

      const combinedProducts = [
        ...bestSellerProducts,
        ...hotSaleProducts,
        ...newArrivalsProducts,
      ];

      const uniqueProducts = [
        ...new Map(combinedProducts.map((item) => [item._id, item])).values(),
      ];

      const sortedUniqueProducts = uniqueProducts.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      const finalProducts = sortedUniqueProducts.slice(0, limit || undefined);  

      resolve({
        status: "OK",
        message: "Success",
        data: finalProducts,
        total: finalProducts.length,
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
};
