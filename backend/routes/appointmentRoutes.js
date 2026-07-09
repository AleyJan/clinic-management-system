const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  allowRoles("receptionist", "admin", "patient"),
  createAppointment,
);
router.get("/", protect, getAppointments);
router.put(
  "/:id/status",
  protect,
  allowRoles("doctor", "admin"),
  updateAppointmentStatus,
);
router.put("/:id/cancel", protect, cancelAppointment);

module.exports = router;
