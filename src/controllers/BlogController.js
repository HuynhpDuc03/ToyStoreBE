const BlogService = require("../services/BlogService");

const createBlog = async (req, res) => {
  try {
    const blogData = req.body;
    const response = await BlogService.createBlog(blogData);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await BlogService.getBlogById(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const { page = 0, limit = 10 } = req.query;
     const response = await BlogService.getAllBlogs(page,limit);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};


const getAllTags = async (req, res) => {
  try {
    const response = await BlogService.getAllTags();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};





const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogData = req.body;
    const response = await BlogService.updateBlog(id, blogData);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await BlogService.deleteBlog(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};


const addCommentToBlog = async (req, res) => {
    try {
      const blogId = req.params.blogId;
      const commentData = req.body;
  
      // Gọi service để thêm bình luận
      const response = await BlogService.addComment(blogId, commentData);
  
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "ERR",
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

module.exports = {
  createBlog,
  getBlogById,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  addCommentToBlog,
  getAllTags
};
