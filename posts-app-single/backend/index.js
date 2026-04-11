require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");

const postRoutes = require("./routes/posts");
const { seedPosts } = require("./services/seedService");

const app = express();
const server = http.createServer(app);

// ── Middleware ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
//       cb(new Error("Not allowed by CORS"));
//     },
//   })
// );
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://internship-post.vercel.app"
    ],
    credentials: true
  })
);
app.use(express.json());

// ── REST Routes ─────────────────────────────────────────────────────────────
app.use("/api/posts", postRoutes);

app.get("/", (_req, res) =>
  res.json({ status: "ok", message: "Posts API is running" })
);

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
);

// ── WebSocket Server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", async (raw) => {
    try {
      const { type, query } = JSON.parse(raw.toString());

      if (type === "search") {
        const Post = require("./models/Post");
        const q = (query || "").trim();

        const filter = q
          ? {
              $or: [
                { title: { $regex: q, $options: "i" } },
                { body: { $regex: q, $options: "i" } },
              ],
            }
          : {};

        const posts = await Post.find(filter).limit(50).lean();

        ws.send(
          JSON.stringify({ type: "search_results", query: q, results: posts, count: posts.length })
        );
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", message: err.message }));
    }
  });

  ws.on("close", () => console.log("WebSocket client disconnected"));
  ws.on("error", (err) => console.error("WebSocket error:", err));

  // Send a welcome ping
  ws.send(JSON.stringify({ type: "connected", message: "WebSocket ready" }));
});

// ── MongoDB + Boot ───────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/postsapp";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedPosts(); // fetch from JSONPlaceholder and seed if needed
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
