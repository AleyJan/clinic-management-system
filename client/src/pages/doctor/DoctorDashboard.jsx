import { useState, useEffect } from "react";
import Layout from "../../components/shared/Layout";
import Icon from "../../components/shared/Icon";
import API from "../../services/api";

const doctorLinks = [
  { tab: "appointments", icon: "calendar", label: "Appointments" },
  { tab: "prescriptions", icon: "pill", label: "Prescriptions" },
  { tab: "ai", icon: "sparkle", label: "AI Diagnosis" },
  { tab: "timeline", icon: "clipboard", label: "Patient History" },
];

const cleanMsg = (m) => m.replace(/^[✅❌]\s*/, "");

const statusBadge = (status) => ({
  completed: "ui-badge ui-badge-teal",
  confirmed: "ui-badge ui-badge-indigo",
  cancelled: "ui-badge ui-badge-pink",
  pending: "ui-badge ui-badge-amber",
}[status] || "ui-badge ui-badge-amber");

const riskBadge = (level) => ({
  high: "ui-badge ui-badge-pink",
  medium: "ui-badge ui-badge-amber",
  low: "ui-badge ui-badge-teal",
}[level] || "ui-badge ui-badge-teal");

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [prescForm, setPrescForm] = useState({
    patientId: "",
    medicines: [{ name: "", dosage: "", duration: "" }],
    instructions: "",
  });
  const [prescMsg, setPrescMsg] = useState("");

  const [aiForm, setAiForm] = useState({
    patientId: "", symptoms: "", age: "", gender: "male", history: ""
  });
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [aRes, pRes] = await Promise.all([
        API.get("/appointments"),
        API.get("/patients"),
      ]);
      setAppointments(aRes.data);
      setPatients(pRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const addMedicine = () => {
    setPrescForm({ ...prescForm, medicines: [...prescForm.medicines, { name: "", dosage: "", duration: "" }] });
  };

  const updateMedicine = (index, field, value) => {
    const updated = prescForm.medicines.map((m, i) => i === index ? { ...m, [field]: value } : m);
    setPrescForm({ ...prescForm, medicines: updated });
  };

  const removeMedicine = (index) => {
    setPrescForm({ ...prescForm, medicines: prescForm.medicines.filter((_, i) => i !== index) });
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    setPrescMsg("");
    try {
      await API.post("/prescriptions", prescForm);
      setPrescMsg("✅ Prescription added successfully!");
      setPrescForm({ patientId: "", medicines: [{ name: "", dosage: "", duration: "" }], instructions: "" });
    } catch (err) {
      setPrescMsg("❌ " + (err.response?.data?.message || "Failed"));
    }
  };

  const handleAICheck = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await API.post("/ai/symptom-check", aiForm);
      console.log("AI Result:", res.data);
      setAiResult(res.data);
    } catch (err) {
      setAiResult({
        possibleConditions: ["AI unavailable"],
        riskLevel: "low",
        suggestedTests: [],
        advice: "Please diagnose manually.",
        fallback: true
      });
    } finally {
      setAiLoading(false);
    }
  };

  const fetchTimeline = async (patientId) => {
    setTimelineLoading(true);
    setTimeline(null);
    try {
      const res = await API.get(`/patients/${patientId}/timeline`);
      setTimeline(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  };

  if (loading) return (
    <Layout links={doctorLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="ui-loading-wrap">
        <div style={{ textAlign: "center" }}>
          <div className="ui-spinner" />
          <p className="ui-loading-text">Loading…</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout links={doctorLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <style>{`
        .ddash-tl-item { display: flex; gap: 14px; }
        .ddash-tl-rail { display: flex; flex-direction: column; align-items: center; }
        .ddash-tl-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .ddash-tl-icon-appt { background: rgba(129,140,248,0.12); border: 1px solid rgba(129,140,248,0.25); }
        .ddash-tl-icon-presc { background: rgba(45,212,191,0.12); border: 1px solid rgba(45,212,191,0.25); }
        .ddash-tl-icon-ai { background: rgba(244,114,182,0.12); border: 1px solid rgba(244,114,182,0.25); }
        .ddash-tl-line { width: 1px; background: rgba(255,255,255,0.07); flex: 1; margin: 4px 0; min-height: 20px; }
        .ddash-tl-card {
          flex: 1;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 10px;
        }
        .ddash-tl-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .ddash-tl-date { font-size: 11px; color: rgba(100,116,139,0.6); }
        .ddash-med-row { display: flex; gap: 8px; margin-bottom: 8px; }
        .ddash-med-remove {
          background: none;
          border: none;
          color: rgba(244,114,182,0.7);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          transition: color 0.15s;
        }
        .ddash-med-remove:hover { color: #f472b6; }
        .ddash-add-med {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-family: var(--sans);
          font-weight: 500;
          color: rgba(45,212,191,0.85);
          padding: 4px 0;
        }
        .ddash-add-med:hover { color: #2dd4bf; }
        .ddash-ai-result {
          margin-top: 24px;
          background: rgba(129,140,248,0.05);
          border: 1px solid rgba(129,140,248,0.18);
          border-radius: 14px;
          padding: 20px;
        }
        .ddash-ai-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgba(100,116,139,0.75);
          margin: 0 0 8px;
        }
        .ddash-advice {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: rgba(203,213,225,0.9);
          line-height: 1.6;
        }
        .ddash-chip-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
      `}</style>

      <div className="ui-page-header">
        <h1 className="ui-page-title">Doctor Dashboard</h1>
        <p className="ui-page-sub">Manage appointments, prescriptions and AI diagnosis</p>
      </div>

      {/* Stats */}
      <div className="ui-stat-grid">
        {[
          { label: "Total Appointments", value: appointments.length, icon: "calendar", cls: "ui-stat-teal" },
          { label: "Pending", value: appointments.filter(a => a.status === "pending").length, icon: "clock", cls: "ui-stat-amber" },
          { label: "Completed", value: appointments.filter(a => a.status === "completed").length, icon: "check-circle", cls: "ui-stat-indigo" },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className={`ui-stat ${cls}`}>
            <div className="ui-stat-icon"><Icon name={icon} size={15} /></div>
            <div className="ui-stat-val">{value}</div>
            <div className="ui-stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="ui-card">

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <p className="ui-card-title">My Appointments</p>
            {appointments.length === 0 ? (
              <p className="ui-empty">No appointments yet.</p>
            ) : (
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td className="td-name">{a.patientId?.name}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td><span className={statusBadge(a.status)}>{a.status}</span></td>
                      <td>
                        {a.status === "pending" && (
                          <button onClick={() => handleStatusUpdate(a._id, "confirmed")}
                            className="ui-action ui-action-indigo">
                            Confirm
                          </button>
                        )}
                        {a.status === "confirmed" && (
                          <button onClick={() => handleStatusUpdate(a._id, "completed")}
                            className="ui-action ui-action-teal">
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Prescription Tab */}
        {activeTab === "prescriptions" && (
          <div style={{ maxWidth: 520 }}>
            <p className="ui-card-title">Write Prescription</p>
            {prescMsg && (
              <div className={prescMsg.startsWith("✅") ? "ui-msg-ok" : "ui-msg-err"}>
                {cleanMsg(prescMsg)}
              </div>
            )}
            <form onSubmit={handleAddPrescription} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="ui-label">Select Patient</label>
                <select value={prescForm.patientId}
                  onChange={e => setPrescForm({ ...prescForm, patientId: e.target.value })}
                  className="ui-input" required>
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="ui-label">Medicines</label>
                {prescForm.medicines.map((med, index) => (
                  <div key={index} className="ddash-med-row">
                    <input type="text" placeholder="Medicine name" value={med.name}
                      onChange={e => updateMedicine(index, "name", e.target.value)}
                      className="ui-input" style={{ flex: 1 }} required />
                    <input type="text" placeholder="Dosage" value={med.dosage}
                      onChange={e => updateMedicine(index, "dosage", e.target.value)}
                      className="ui-input" style={{ flex: 1 }} required />
                    <input type="text" placeholder="Days" value={med.duration}
                      onChange={e => updateMedicine(index, "duration", e.target.value)}
                      className="ui-input" style={{ width: 70 }} />
                    {prescForm.medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(index)}
                        className="ddash-med-remove" aria-label="Remove medicine">
                        <Icon name="x" size={14} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addMedicine} className="ddash-add-med">
                  + Add Medicine
                </button>
              </div>

              <div>
                <label className="ui-label">Instructions</label>
                <textarea value={prescForm.instructions}
                  onChange={e => setPrescForm({ ...prescForm, instructions: e.target.value })}
                  className="ui-input" rows={3} placeholder="Additional instructions..." />
              </div>

              <button type="submit" className="ui-btn ui-btn-block">
                Save Prescription
              </button>
            </form>
          </div>
        )}

        {/* AI Tab */}
        {activeTab === "ai" && (
          <div style={{ maxWidth: 520 }}>
            <p className="ui-card-title" style={{ marginBottom: 4 }}>AI Symptom Checker</p>
            <p className="ui-page-sub" style={{ marginBottom: 20 }}>
              Enter patient symptoms and get AI-powered diagnosis suggestions.
            </p>
            <form onSubmit={handleAICheck} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="ui-label">Select Patient</label>
                <select value={aiForm.patientId}
                  onChange={e => setAiForm({ ...aiForm, patientId: e.target.value })}
                  className="ui-input" required>
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Age: {p.age})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="ui-label">Age</label>
                  <input type="number" value={aiForm.age}
                    onChange={e => setAiForm({ ...aiForm, age: e.target.value })}
                    className="ui-input" placeholder="Age" required />
                </div>
                <div>
                  <label className="ui-label">Gender</label>
                  <select value={aiForm.gender}
                    onChange={e => setAiForm({ ...aiForm, gender: e.target.value })}
                    className="ui-input">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="ui-label">Symptoms</label>
                <textarea value={aiForm.symptoms}
                  onChange={e => setAiForm({ ...aiForm, symptoms: e.target.value })}
                  className="ui-input" rows={3}
                  placeholder="e.g. fever, headache, sore throat..." required />
              </div>
              <div>
                <label className="ui-label">Medical History (optional)</label>
                <input type="text" value={aiForm.history}
                  onChange={e => setAiForm({ ...aiForm, history: e.target.value })}
                  className="ui-input" placeholder="e.g. diabetes, hypertension..." />
              </div>
              <button type="submit" disabled={aiLoading} className="ui-btn ui-btn-block">
                {aiLoading ? "Analyzing…" : "Run AI Diagnosis"}
              </button>
            </form>

            {aiResult && (
              <div className="ddash-ai-result">
                <p className="ui-card-title">AI Diagnosis Result</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Risk Level */}
                  <div>
                    <p className="ddash-ai-label">Risk Level</p>
                    <span className={riskBadge(aiResult.riskLevel)} style={{ fontSize: 12, padding: "4px 14px" }}>
                      {aiResult.riskLevel?.toUpperCase()}
                    </span>
                  </div>

                  {/* Possible Conditions */}
                  <div>
                    <p className="ddash-ai-label">Possible Conditions</p>
                    <div className="ddash-chip-wrap">
                      {aiResult.possibleConditions?.map((c, i) => (
                        <span key={i} className="ui-badge ui-badge-indigo" style={{ fontSize: 11, padding: "4px 12px" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Tests */}
                  {aiResult.suggestedTests && aiResult.suggestedTests.length > 0 && (
                    <div>
                      <p className="ddash-ai-label">Suggested Tests</p>
                      <div className="ddash-chip-wrap">
                        {aiResult.suggestedTests.map((t, i) => (
                          <span key={i} className="ui-badge ui-badge-amber" style={{ fontSize: 11, padding: "4px 12px" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advice */}
                  {aiResult.advice && (
                    <div>
                      <p className="ddash-ai-label">Advice</p>
                      <div className="ddash-advice">{aiResult.advice}</div>
                    </div>
                  )}

                  {aiResult.fallback && (
                    <p style={{ fontSize: 11, color: "#fb923c", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="alert" size={12} /> AI fallback mode
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div>
            <p className="ui-card-title">Patient Medical History</p>

            <div style={{ maxWidth: 340, marginBottom: 24 }}>
              <label className="ui-label">Select Patient</label>
              <select
                value={selectedPatient}
                onChange={e => { setSelectedPatient(e.target.value); if (e.target.value) fetchTimeline(e.target.value); }}
                className="ui-input"
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (Age: {p.age})</option>
                ))}
              </select>
            </div>

            {timelineLoading && (
              <p className="ui-empty">Loading timeline...</p>
            )}

            {!selectedPatient && !timelineLoading && (
              <div className="ui-empty-block">
                <div className="ui-empty-icon"><Icon name="clipboard" size={30} /></div>
                <p style={{ margin: 0 }}>Select a patient to view their medical history</p>
              </div>
            )}

            {timeline && !timelineLoading && (
              <div>
                {[
                  ...timeline.appointments.map(a => ({ type: "appointment", date: new Date(a.date), data: a })),
                  ...timeline.prescriptions.map(p => ({ type: "prescription", date: new Date(p.createdAt), data: p })),
                  ...timeline.diagnosisLogs.map(d => ({ type: "diagnosis", date: new Date(d.createdAt), data: d })),
                ]
                  .sort((a, b) => b.date - a.date)
                  .map((event, index) => (
                    <div key={index} className="ddash-tl-item">
                      <div className="ddash-tl-rail">
                        <div className={`ddash-tl-icon ${event.type === "appointment" ? "ddash-tl-icon-appt" :
                          event.type === "prescription" ? "ddash-tl-icon-presc" : "ddash-tl-icon-ai"}`}>
                          <Icon
                            name={event.type === "appointment" ? "calendar" : event.type === "prescription" ? "pill" : "sparkle"}
                            size={14}
                            color={event.type === "appointment" ? "#818cf8" : event.type === "prescription" ? "#2dd4bf" : "#f472b6"}
                          />
                        </div>
                        <div className="ddash-tl-line" />
                      </div>

                      <div className="ddash-tl-card">
                        <div className="ddash-tl-head">
                          <span className={`ui-badge ${event.type === "appointment" ? "ui-badge-indigo" :
                            event.type === "prescription" ? "ui-badge-teal" : "ui-badge-pink"}`}>
                            {event.type === "appointment" ? "Appointment" :
                              event.type === "prescription" ? "Prescription" : "AI Diagnosis"}
                          </span>
                          <span className="ddash-tl-date">{event.date.toLocaleDateString()}</span>
                        </div>

                        {event.type === "appointment" && (
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-hi)", margin: "0 0 6px" }}>
                              Dr. {event.data.doctorId?.name}
                            </p>
                            <span className={statusBadge(event.data.status)}>{event.data.status}</span>
                          </div>
                        )}

                        {event.type === "prescription" && (
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-hi)", margin: "0 0 6px" }}>
                              Dr. {event.data.doctorId?.name}
                            </p>
                            <div className="ddash-chip-wrap">
                              {event.data.medicines.map((m, i) => (
                                <span key={i} className="ui-badge ui-badge-teal">{m.name}</span>
                              ))}
                            </div>
                            {event.data.instructions && (
                              <p style={{ fontSize: 11, color: "var(--text-low)", margin: "8px 0 0" }}>
                                {event.data.instructions}
                              </p>
                            )}
                          </div>
                        )}

                        {event.type === "diagnosis" && (
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-hi)", margin: "0 0 6px" }}>
                              Symptoms: {event.data.symptoms}
                            </p>
                            <span className={riskBadge(event.data.riskLevel)}>Risk: {event.data.riskLevel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {timeline.appointments.length === 0 &&
                  timeline.prescriptions.length === 0 &&
                  timeline.diagnosisLogs.length === 0 && (
                    <div className="ui-empty-block">
                      <div className="ui-empty-icon"><Icon name="clipboard" size={30} /></div>
                      <p style={{ margin: 0 }}>No history found for this patient.</p>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
