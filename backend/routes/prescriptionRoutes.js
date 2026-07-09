const express = require("express");
const router = express.Router();
const { createPrescription, getPatientPrescriptions, getPrescriptionById } = require("../controllers/prescriptionController");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const Patient = require("../models/Patient");
const Prescription = require("../models/Prescription");

router.post("/", protect, allowRoles("doctor"), createPrescription);

// ✅ /my BEFORE /:id — order matters!
router.get("/my", protect, async (req, res) => {
  try {
    const patientRecord = await Patient.findOne({ userId: req.user._id });
    if (!patientRecord) return res.json([]);

    const prescriptions = await Prescription
      .find({ patientId: patientRecord._id })
      .populate("doctorId", "name email")
      .populate("patientId", "name age gender")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/patient/:patientId", protect, getPatientPrescriptions);
router.get("/:id", protect, getPrescriptionById);

module.exports = router;