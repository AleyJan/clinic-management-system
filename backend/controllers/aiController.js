const DiagnosisLog = require("../models/DiagnosisLog");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const symptomCheck = async (req, res) => {
  try {
    const { symptoms, age, gender, history, patientId } = req.body;

    const isPatient = req.user.role === "patient";
    const prompt = `
      You are a medical AI assistant ${isPatient ? "running a preliminary health checkup for a patient" : "helping a doctor"}.
      Patient Info: Age: ${age}, Gender: ${gender}
      Medical History: ${history || "None"}
      Current Symptoms: ${symptoms}

      Respond in JSON format only, no extra text, no markdown:
      {
        "possibleConditions": ["condition1", "condition2"],
        "riskLevel": "low",
        "suggestedTests": ["test1", "test2"],
        "advice": "${isPatient ? "brief plain-language advice for the patient, recommending a doctor visit when appropriate" : "brief advice for the doctor"}"
      }
      riskLevel must be exactly: "low" or "medium" or "high"
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const aiText = completion.choices[0].message.content;
    console.log("Groq raw:", aiText);

    const cleaned = aiText.replace(/```json|```/g, "").trim();
    const aiResult = JSON.parse(cleaned);

    await DiagnosisLog.create({
      patientId,
      doctorId: req.user._id,
      symptoms,
      aiResponse: JSON.stringify(aiResult),
      riskLevel: aiResult.riskLevel,
    });

    res.json(aiResult);

  } catch (error) {
    console.error("AI Error:", error.message);
    res.json({
      possibleConditions: ["Unable to analyze — please consult manually"],
      riskLevel: "low",
      suggestedTests: [],
      advice: "AI is temporarily unavailable. Please proceed with manual diagnosis.",
      fallback: true,
    });
  }
};

module.exports = { symptomCheck };