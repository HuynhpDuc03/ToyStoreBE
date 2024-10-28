const express = require("express");
const router = express.Router();
const BlogController = require("../controllers/BlogController");
const { authMiddleWare } = require("../middleware/authMiddleware");

router.post("/createBlog", authMiddleWare,BlogController.createBlog);
router.get("/getDetails/:id", BlogController.getBlogById);
router.get("/getAllTags", BlogController.getAllTags);
router.get("/getAll", BlogController.getAllBlogs);
router.put("/update/:id", authMiddleWare,BlogController.updateBlog);
router.delete("/delete/:id", authMiddleWare,BlogController.deleteBlog);
router.post("/:blogId/comments", BlogController.addCommentToBlog);


module.exports = router;
