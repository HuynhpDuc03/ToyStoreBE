const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    phone: { type: Number, required: true },
    address: { type: String, required: false},
    city: { type: String, required: false },
    district: { type: String, required: false },
    ward: { type: String, required: false },
    access_token: { type: String, required: false },
    refresh_token: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
