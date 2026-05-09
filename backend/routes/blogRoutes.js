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
const { isAuthor } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

// ✅ CREATE BLOG (author only)
router.post("/", protect, isAuthor, upload.single("featuredImage"), createBlog);

// ✅ PUBLIC
router.get("/", getBlogs);
router.get("/:slug", getSingleBlog);

// ✅ AUTHOR ONLY
router.put("/:id", protect, isAuthor, updateBlog);
router.delete("/:id", protect, isAuthor, deleteBlog);

// ✅ LOGGED-IN USERS
router.put("/like/:id", protect, likeBlog);
router.post("/comment/:id", protect, addComment);
router.delete("/comment/:blogId/:commentId", protect, deleteComment);

module.exports = router;