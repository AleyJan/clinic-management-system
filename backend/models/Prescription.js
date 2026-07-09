const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g "1 tablet twice a day"
  duration: { type: String }, // e.g "7 days"
});

const prescriptionSchema = new mongoose.Schema(
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
    medicines: [medicineSchema], // array of medicine objects
    instructions: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
