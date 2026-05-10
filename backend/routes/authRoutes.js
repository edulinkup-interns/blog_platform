const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const upload  = require("../middleware/upload");

// public
router.post("/register", registerUser);
router.post("/login",    loginUser);

// protected
router.get("/profile",              protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);

module.exports = router;