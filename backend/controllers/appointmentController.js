const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

// POST /api/appointments
const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date } = req.body;
    const appointment = await Appointment.create({ patientId, doctorId, date });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments — filtered by role
const getAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "doctor") {
      query.doctorId = req.user._id;
    }

    if (req.user.role === "patient") {
      const Patient = require("../models/Patient");
      const patientRecord = await Patient.findOne({ userId: req.user._id }); // 👈 match by userId
      if (patientRecord) query.patientId = patientRecord._id;
      else query.patientId = null;
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "name age gender contact")
      .populate("doctorId", "name email")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: "cancelled" }, { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAppointment, getAppointments, updateAppointmentStatus, cancelAppointment };