const Blog = require("../models/Blog");

// CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { title, content, category, tags, status } = req.body || {};

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const slug = title.toLowerCase().split(" ").join("-");
    const featuredImage = req.file ? req.file.filename : null;

    const blog = await Blog.create({
      title,
      slug,
      content,
      category,
      tags,
      status,
      featuredImage,
      author: req.user.id,
    });

    res.status(201).json({
      message: "Blog created successfully",
      blog: {
        ...blog._doc,
        featuredImage: blog.featuredImage
          ? `http://localhost:5001/uploads/${blog.featuredImage}`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL BLOGS
exports.getBlogs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;

    const keyword = req.query.search
      ? { title: { $regex: req.query.search, $options: "i" } }
      : {};

    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

    const filter = { ...keyword, ...categoryFilter };

    const count = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate("author", "name")
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      blogs,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE BLOG
exports.getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email")
      .populate("comments.user", "name");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE BLOG
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await blog.deleteOne();

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIKE / UNLIKE BLOG
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user.id;

    if (!blog.likes) blog.likes = [];

    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      message: alreadyLiked ? "Blog unliked" : "Blog liked",
      totalLikes: blog.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const newComment = { user: req.user.id, text };
    blog.comments.push(newComment);
    await blog.save();

    // repopulate so frontend gets user names
    const updated = await Blog.findById(blog._id).populate("comments.user", "name");

    res.json({ message: "Comment added", comments: updated.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE COMMENT
// ✅ allowed if: you wrote the comment OR you are the blog author
exports.deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId).populate("comments.user", "name");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isCommentOwner = comment.user._id
      ? comment.user._id.toString() === req.user.id.toString()
      : comment.user.toString() === req.user.id.toString();

    const isBlogAuthor = blog.author.toString() === req.user.id.toString();

    if (!isCommentOwner && !isBlogAuthor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await blog.save();

    const updated = await Blog.findById(blog._id).populate("comments.user", "name");

    res.json({ message: "Comment deleted", comments: updated.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};