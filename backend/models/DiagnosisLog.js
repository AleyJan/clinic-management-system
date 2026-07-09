const mongoose = require("mongoose");

const diagnosisLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptoms: { type: String, required: true }, // what doctor entered
    aiResponse: { type: String }, // what AI returned
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DiagnosisLog", diagnosisLogSchema);
