const Prescription = require("../models/Prescription");

const createPrescription = async (req, res) => {
  try {
    const { patientId, medicines, instructions } = req.body;

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      medicines,
      instructions,
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientId: req.params.patientId,
    })
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctorId", "name email")
      .populate("patientId", "name age gender");

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
};
