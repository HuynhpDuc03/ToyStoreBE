const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: [{ type: String, required: true }],
    type: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    description: { type: String, required: false },
    discount: { type: Number },
    selled: {type: Number, required: false, default:0},
    bestSeller: { type: Boolean, default: false, required: false },
    hotSale: { type: Boolean, default: false, required: false },
    newArrivals: { type: Boolean, default: false, required: false },

  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
