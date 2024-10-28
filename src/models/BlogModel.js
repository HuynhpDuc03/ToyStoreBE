const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    comments: [
      {
        name: { type: String, required: false },
        email: { type: String, required: false },
        comment: { type: String, required: false },
        phone: { type: String, required: false},
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
    bannerImage: { type: String, required: false },
    publishDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
