const express = require("express");
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
} = require("../controllers/patientController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.post("/", protect, allowRoles("receptionist", "admin"), createPatient);
router.get("/", protect, getPatients);
// GET /api/patients/my — patient gets their own record
router.get("/my", protect, async (req, res) => {
  try {
    const patient = await require("../models/Patient")
      .findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient record not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:id", protect, getPatientById);
router.put("/:id", protect, allowRoles("receptionist", "admin"), updatePatient);

router.get("/:id/timeline", protect, async (req, res) => {
  try {
    const Appointment = require("../models/Appointment");
    const Prescription = require("../models/Prescription");
    const DiagnosisLog = require("../models/DiagnosisLog");

    const [appointments, prescriptions, diagnosisLogs] = await Promise.all([
      Appointment.find({ patientId: req.params.id })
        .populate("doctorId", "name")
        .sort({ date: -1 }),
      Prescription.find({ patientId: req.params.id })
        .populate("doctorId", "name")
        .sort({ createdAt: -1 }),
      DiagnosisLog.find({ patientId: req.params.id })
        .populate("doctorId", "name")
        .sort({ createdAt: -1 }),
    ]);

    res.json({ appointments, prescriptions, diagnosisLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
