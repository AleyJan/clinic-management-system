const express = require("express");
const router = express.Router();
const { symptomCheck } = require("../controllers/aiController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

// Patients need a Pro subscription to run AI checkups; doctors always can
const requireProForPatients = (req, res, next) => {
  if (req.user.role === "patient" && req.user.subscriptionPlan !== "pro") {
    return res.status(403).json({ message: "Upgrade to Pro to access AI checkups." });
  }
  next();
};

router.post("/symptom-check", protect, allowRoles("doctor", "patient"), requireProForPatients, symptomCheck);

module.exports = router;
