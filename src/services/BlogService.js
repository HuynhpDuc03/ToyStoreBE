const Blog = require("../models/BlogModel");

const createBlog = (blogData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newBlog = await Blog.create(blogData);
      resolve({
        status: "OK",
        message: "Blog created successfully",
        data: newBlog,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getBlogById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm blog theo ID
      const blog = await Blog.findById(id);
      if (!blog) {
        resolve({ status: "ERR", message: "Blog not found" });
      } else {
        // Cập nhật views +1
        blog.views = (blog.views || 0) + 1;
        await blog.save();

        // Trả về blog sau khi cập nhật
        resolve({ status: "OK", message: "Blog found", data: blog });
      }
    } catch (error) {
      reject({
        status: "ERR",
        message: "Failed to get blog",
        error: error.message,
      });
    }
  });
};

const getAllBlogs = (page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit; // Calculate how many records to skip
      const totalBlogs = await Blog.countDocuments(); // Total number of blogs

      const blogs = await Blog.find()
        .sort({ publishDate: -1 }) // Sort by publish date in descending order
        .skip(skip) // Skip the previous records based on the page
        .limit(parseInt(limit)); // Limit the number of results per page

      if (blogs.length === 0) {
        resolve({
          status: "ERR",
          message: "No blogs found",
        });
      } else {
        resolve({
          status: "OK",
          message: "Blogs fetched successfully",
          total: totalBlogs, // Return the total number of blogs
          data: blogs, // Return the paginated blogs
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllTags = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const blogs = await Blog.find({}, { tags: 1, _id: 0 });
      const allTags = blogs.reduce((acc, blog) => {
        if (blog.tags && blog.tags.length > 0) {
          acc = acc.concat(blog.tags);
        }
        return acc;
      }, []);

      // Loại bỏ các tags trùng nhau (unique)
      const uniqueTags = [...new Set(allTags)];

      resolve({
        status: "OK",
        message: "Tags fetched successfully",
        data: uniqueTags,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateBlog = (id, blogData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedBlog = await Blog.findByIdAndUpdate(id, blogData, {
        new: true,
      });
      if (!updatedBlog) {
        resolve({ status: "ERR", message: "Blog not found" });
      } else {
        resolve({
          status: "OK",
          message: "Blog updated successfully",
          data: updatedBlog,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteBlog = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blog = await Blog.findByIdAndDelete(id);
      if (!blog) {
        resolve({ status: "ERR", message: "Blog not found" });
      } else {
        resolve({ status: "OK", message: "Blog deleted successfully" });
      }
    } catch (error) {
      reject(error);
    }
  });
};
const addComment = (blogId, commentData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return resolve({
          status: "ERR",
          message: "Blog not found",
        });
      }

      blog.comments.push({
        name: commentData.name || "", 
        email: commentData.email || "", 
        comment: commentData.comment,
        phone: commentData.phone
      });


      await blog.save();

      resolve({
        status: "OK",
        message: "Comment added successfully",
        data: blog.comments,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: "Failed to add comment",
        error: error.message,
      });
    }
  });
};
module.exports = {
  createBlog,
  getBlogById,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  addComment,
  getAllTags,
};
