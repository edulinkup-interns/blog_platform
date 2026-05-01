const express = require("express");
const router = express.Router();

const {
  createBlog,
  getBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  deleteComment,
} = require("../controllers/blogController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ✅ CREATE BLOG (with image)
router.post("/", protect, upload.single("featuredImage"), createBlog);

// OTHER ROUTES
router.get("/", getBlogs);
router.get("/:slug", getSingleBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);
router.put("/like/:id", protect, likeBlog);
router.post("/comment/:id", protect, addComment);
router.delete("/comment/:blogId/:commentId", protect, deleteComment);

module.exports = router;