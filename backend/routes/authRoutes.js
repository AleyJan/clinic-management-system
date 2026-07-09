const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserPlan
} = require("../controllers/authController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/users", protect, require("../controllers/authController").getUsers);
// Users may change their own plan; admins may change anyone's
const selfOrAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: "You can only change your own plan." });
  }
  next();
};
router.put("/users/:id/plan", protect, selfOrAdmin, updateUserPlan);

module.exports = router;
