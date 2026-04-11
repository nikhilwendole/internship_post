const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { refreshPosts } = require("../services/seedService");

// GET /api/posts — get all posts (with optional ?page & ?limit)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ externalId: 1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/search?q=... — search posts (REST fallback)
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      const posts = await Post.find().limit(20).lean();
      return res.json({ posts, query: "", count: posts.length });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } },
      ],
    })
      .limit(50)
      .lean();

    res.json({ posts, query: q, count: posts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id — get single post by MongoDB _id or externalId
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    // Try externalId first (numeric), then _id
    if (/^\d+$/.test(id)) {
      post = await Post.findOne({ externalId: parseInt(id) }).lean();
    }
    if (!post) {
      post = await Post.findById(id).lean();
    }

    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/fetch — re-fetch & upsert all posts from JSONPlaceholder
router.post("/fetch", async (req, res) => {
  try {
    const result = await refreshPosts();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
