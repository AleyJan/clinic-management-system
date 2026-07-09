const Patient = require("../models/Patient");

// POST /api/patients — receptionist or admin creates patient
const createPatient = async (req, res) => {
  try {
    const { name, age, gender, contact } = req.body;

    const patient = await Patient.create({
      name,
      age,
      gender,
      contact,
      createdBy: req.user._id,

    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/patients — all roles can view
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/patients/:id — single patient with full history
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/patients/:id — update patient info
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient };
