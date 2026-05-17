const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const blogRoutes = require("./routes/blogRoutes");
require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// connect database
connectDB();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Add your Vercel frontend URL here after deploying
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // set this in Render environment variables
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/uploads",   express.static(path.join(__dirname, "uploads")));

// test route
app.get("/", (req, res) => {
  res.send("Inkwell API is running...");
});

app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});