import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/shared/Layout";
import Icon from "../../components/shared/Icon";
import API from "../../services/api";
import useAuth from "../../context/useAuth";

const patientLinks = [
  { tab: "overview", icon: "home", label: "My Overview" },
  { tab: "appointments", icon: "calendar", label: "My Appointments" },
  { tab: "prescriptions", icon: "pill", label: "My Prescriptions" },
  { tab: "bookAppointment", icon: "edit", label: "Book Appointment" },
  { tab: "aiCheckup", icon: "sparkle", label: "AI Checkup" },
];

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

const cleanMsg = (m) => m.replace(/^[✅❌]\s*/, "");

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPro = user?.subscriptionPlan === "pro";
  const [activeTab, setActiveTab] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientRecord, setPatientRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookForm, setBookForm] = useState({ doctorId: "", date: "" });
  const [bookMsg, setBookMsg] = useState("");

  const [aiForm, setAiForm] = useState({ symptoms: "", history: "" });
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [aRes, pRes, dRes, patRes] = await Promise.all([
        API.get("/appointments"),
        API.get("/prescriptions/my"),
        API.get("/auth/users?role=doctor"),
        API.get("/patients/my").catch(() => ({ data: null })),
      ]);
      setAppointments(aRes.data);
      setPrescriptions(pRes.data);
      setDoctors(dRes.data);
      setPatientRecord(patRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookMsg("");
    try {
      if (!patientRecord) {
        setBookMsg("❌ Patient record not found. Contact receptionist first.");
        return;
      }
      await API.post("/appointments", {
        patientId: patientRecord._id,
        doctorId: bookForm.doctorId,
        date: bookForm.date,
      });
      setBookMsg("✅ Appointment booked successfully!");
      setBookForm({ doctorId: "", date: "" });
      fetchAll();
    } catch (err) {
      setBookMsg("❌ " + (err.response?.data?.message || "Failed to book"));
    }
  };

  const handleAICheckup = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiResult(null);
    setAiError("");
    try {
      const res = await API.post("/ai/symptom-check", {
        patientId: patientRecord?._id,
        symptoms: aiForm.symptoms,
        history: aiForm.history,
        age: patientRecord?.age || "",
        gender: patientRecord?.gender || "unknown",
      });
      setAiResult(res.data);
    } catch (err) {
      setAiError(err.response?.data?.message || "AI checkup failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const printPrescription = (presc) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px; }
            .info { margin: 20px 0; }
            .medicine { background: #f0fdfa; padding: 10px; margin: 8px 0; border-radius: 6px; }
            .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <h1>ClinicAI — Prescription</h1>
          <div class="info">
            <p><strong>Doctor:</strong> ${presc.doctorId?.name}</p>
            <p><strong>Patient:</strong> ${presc.patientId?.name || user?.name}</p>
            <p><strong>Date:</strong> ${new Date(presc.createdAt).toLocaleDateString()}</p>
          </div>
          <h3>Medicines:</h3>
          ${presc.medicines.map(m => `
            <div class="medicine">
              <strong>${m.name}</strong> — ${m.dosage} ${m.duration ? `for ${m.duration}` : ""}
            </div>
          `).join("")}
          ${presc.instructions ? `<p><strong>Instructions:</strong> ${presc.instructions}</p>` : ""}
          <div class="footer">Generated by ClinicAI • ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return (
    <Layout links={patientLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="ui-loading-wrap">
        <div style={{ textAlign: "center" }}>
          <div className="ui-spinner" />
          <p className="ui-loading-text">Loading…</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout links={patientLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <style>{`
        .pdash-profile {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px;
          background: rgba(45,212,191,0.05);
          border: 1px solid rgba(45,212,191,0.15);
          border-radius: 14px;
          margin-bottom: 24px;
        }
        .pdash-avatar {
          width: 54px; height: 54px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(45,212,191,0.35), rgba(129,140,248,0.35));
          border: 1px solid rgba(45,212,191,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          font-weight: 500;
          color: var(--text-hi);
          flex-shrink: 0;
        }
        .pdash-profile-name { font-size: 17px; font-weight: 500; color: var(--text-hi); margin: 0 0 2px; }
        .pdash-profile-email { font-size: 12px; color: var(--text-low); margin: 0 0 8px; }
        .pdash-presc-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
          transition: border-color 0.2s;
        }
        .pdash-presc-card:hover { border-color: rgba(45,212,191,0.2); }
        .pdash-presc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .pdash-presc-doc { font-size: 13px; font-weight: 500; color: var(--text-hi); margin: 0 0 2px; }
        .pdash-presc-date { font-size: 11px; color: var(--text-low); margin: 0; }
        .pdash-med-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          background: rgba(45,212,191,0.05);
          border: 1px solid rgba(45,212,191,0.1);
          padding: 8px 12px;
          border-radius: 9px;
          margin-bottom: 6px;
          color: var(--text-mid);
        }
        .pdash-med-name { font-weight: 500; color: var(--text-hi); }
        .pdash-instructions {
          margin-top: 10px;
          font-size: 12px;
          color: var(--amber);
          background: rgba(251,146,60,0.06);
          border: 1px solid rgba(251,146,60,0.15);
          padding: 8px 12px;
          border-radius: 9px;
        }
        .pdash-chip-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
        .pdash-print-btn { display: inline-flex; align-items: center; gap: 6px; }

        .pdash-lock {
          text-align: center;
          padding: 56px 24px;
          max-width: 420px;
          margin: 0 auto;
        }
        .pdash-lock-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(45,212,191,0.07);
          border: 1px solid rgba(45,212,191,0.2);
          color: var(--teal);
        }
        .pdash-lock-title {
          font-family: var(--serif);
          font-weight: 300;
          font-size: 20px;
          color: var(--text-hi);
          margin: 0 0 8px;
        }
        .pdash-lock-sub {
          font-size: 13px;
          color: var(--text-low);
          font-weight: 300;
          line-height: 1.6;
          margin: 0 0 24px;
        }
        .pdash-ai-result {
          margin-top: 24px;
          background: rgba(45,212,191,0.04);
          border: 1px solid rgba(45,212,191,0.15);
          border-radius: 14px;
          padding: 20px;
        }
        .pdash-ai-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgba(100,116,139,0.75);
          margin: 0 0 8px;
        }
        .pdash-advice {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: rgba(203,213,225,0.9);
          line-height: 1.6;
        }
        .pdash-pro-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 100px;
          background: linear-gradient(135deg, rgba(45,212,191,0.12), rgba(129,140,248,0.12));
          border: 1px solid rgba(45,212,191,0.25);
          color: var(--teal);
        }
      `}</style>

      <div className="ui-page-header">
        <h1 className="ui-page-title">Patient Dashboard</h1>
        <p className="ui-page-sub">Welcome, {user?.name}! View your health records.</p>
      </div>

      {/* Stats */}
      <div className="ui-stat-grid">
        {[
          { label: "My Appointments", value: appointments.length, icon: "calendar", cls: "ui-stat-teal" },
          { label: "Completed", value: appointments.filter(a => a.status === "completed").length, icon: "check-circle", cls: "ui-stat-indigo" },
          { label: "Prescriptions", value: prescriptions.length, icon: "pill", cls: "ui-stat-pink" },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className={`ui-stat ${cls}`}>
            <div className="ui-stat-icon"><Icon name={icon} size={15} /></div>
            <div className="ui-stat-val">{value}</div>
            <div className="ui-stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="ui-card">

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="pdash-profile">
              <div className="pdash-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="pdash-profile-name">{user?.name}</p>
                <p className="pdash-profile-email">{user?.email}</p>
                <span className={isPro ? "pdash-pro-chip" : "ui-badge ui-badge-slate"}>
                  {isPro ? <><Icon name="star" size={10} /> Pro Patient</> : "Free Plan"}
                </span>
              </div>
            </div>

            <p className="ui-card-title">Recent Appointments</p>
            {appointments.length === 0 ? (
              <div className="ui-empty-block">
                <div className="ui-empty-icon"><Icon name="calendar" size={30} /></div>
                <p style={{ margin: 0 }}>No appointments yet.</p>
                <p style={{ margin: "4px 0 0", fontSize: 11 }}>Book one from the "Book Appointment" tab.</p>
              </div>
            ) : (
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map(a => (
                    <tr key={a._id}>
                      <td className="td-name">{a.doctorId?.name}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td><span className={statusBadge(a.status)}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {prescriptions.length > 0 && (
              <>
                <p className="ui-card-title" style={{ marginTop: 24 }}>Recent Prescriptions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {prescriptions.slice(0, 2).map(presc => (
                    <div key={presc._id} className="pdash-presc-card">
                      <div className="pdash-presc-head">
                        <div>
                          <p className="pdash-presc-doc">Dr. {presc.doctorId?.name}</p>
                          <p className="pdash-presc-date">{new Date(presc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="pdash-chip-wrap">
                        {presc.medicines.map((m, i) => (
                          <span key={i} className="ui-badge ui-badge-teal">{m.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <p className="ui-card-title">My Appointments</p>
            {appointments.length === 0 ? (
              <div className="ui-empty-block">
                <div className="ui-empty-icon"><Icon name="calendar" size={30} /></div>
                <p style={{ margin: 0 }}>No appointments yet.</p>
                <p style={{ margin: "4px 0 0", fontSize: 11 }}>Book one from the "Book Appointment" tab.</p>
              </div>
            ) : (
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td className="td-name">{a.doctorId?.name}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td><span className={statusBadge(a.status)}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === "prescriptions" && (
          <div>
            <p className="ui-card-title">My Prescriptions</p>
            {prescriptions.length === 0 ? (
              <div className="ui-empty-block">
                <div className="ui-empty-icon"><Icon name="pill" size={30} /></div>
                <p style={{ margin: 0 }}>No prescriptions yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {prescriptions.map(presc => (
                  <div key={presc._id} className="pdash-presc-card">
                    <div className="pdash-presc-head">
                      <div>
                        <p className="pdash-presc-doc">Dr. {presc.doctorId?.name}</p>
                        <p className="pdash-presc-date">{new Date(presc.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => printPrescription(presc)} className="ui-action ui-action-teal pdash-print-btn">
                        <Icon name="printer" size={12} /> Print
                      </button>
                    </div>
                    <div>
                      {presc.medicines.map((m, i) => (
                        <div key={i} className="pdash-med-line">
                          <Icon name="pill" size={13} color="#2dd4bf" />
                          <span className="pdash-med-name">{m.name}</span>
                          <span>— {m.dosage}</span>
                          {m.duration && <span style={{ opacity: 0.7 }}>for {m.duration}</span>}
                        </div>
                      ))}
                    </div>
                    {presc.instructions && (
                      <div className="pdash-instructions">{presc.instructions}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Book Appointment Tab */}
        {activeTab === "bookAppointment" && (
          <div style={{ maxWidth: 420 }}>
            <p className="ui-card-title" style={{ marginBottom: 4 }}>Book an Appointment</p>
            <p className="ui-page-sub" style={{ marginBottom: 20 }}>Select a doctor and preferred date.</p>

            {!patientRecord && (
              <div className="ui-msg-warn">
                Your patient record is not set up yet. Please contact the receptionist first.
              </div>
            )}

            {bookMsg && (
              <div className={bookMsg.startsWith("✅") ? "ui-msg-ok" : "ui-msg-err"}>
                {cleanMsg(bookMsg)}
              </div>
            )}

            <form onSubmit={handleBookAppointment} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="ui-label">Select Doctor</label>
                <select value={bookForm.doctorId}
                  onChange={e => setBookForm({ ...bookForm, doctorId: e.target.value })}
                  className="ui-input" required>
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ui-label">Date & Time</label>
                <input type="datetime-local" value={bookForm.date}
                  onChange={e => setBookForm({ ...bookForm, date: e.target.value })}
                  className="ui-input" required />
              </div>
              <button type="submit" className="ui-btn ui-btn-block">Book Appointment</button>
            </form>
          </div>
        )}

        {/* AI Checkup Tab — Pro feature */}
        {activeTab === "aiCheckup" && (
          !isPro ? (
            <div className="pdash-lock">
              <div className="pdash-lock-icon"><Icon name="lock" size={24} /></div>
              <h2 className="pdash-lock-title">AI Checkup is a Pro feature</h2>
              <p className="pdash-lock-sub">
                Upgrade to the Pro plan to run AI-powered health checkups — describe your
                symptoms and get instant insights, risk assessment, and suggested next steps.
              </p>
              <button onClick={() => navigate("/plans")} className="ui-btn">
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: 520 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <p className="ui-card-title" style={{ margin: 0 }}>AI Health Checkup</p>
                <span className="pdash-pro-chip"><Icon name="star" size={10} /> Pro</span>
              </div>
              <p className="ui-page-sub" style={{ marginBottom: 20 }}>
                Describe your symptoms and get an instant AI-powered preliminary assessment.
              </p>

              {!patientRecord && (
                <div className="ui-msg-warn">
                  Your patient record is not set up yet. Please contact the receptionist first.
                </div>
              )}

              {aiError && <div className="ui-msg-err">{aiError}</div>}

              <form onSubmit={handleAICheckup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="ui-label">Your Symptoms</label>
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
                <button type="submit" disabled={aiLoading || !patientRecord} className="ui-btn ui-btn-block">
                  {aiLoading ? "Analyzing…" : "Run AI Checkup"}
                </button>
              </form>

              {aiResult && (
                <div className="pdash-ai-result">
                  <p className="ui-card-title">Checkup Result</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div>
                      <p className="pdash-ai-label">Risk Level</p>
                      <span className={riskBadge(aiResult.riskLevel)} style={{ fontSize: 12, padding: "4px 14px" }}>
                        {aiResult.riskLevel?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="pdash-ai-label">Possible Conditions</p>
                      <div className="pdash-chip-wrap">
                        {aiResult.possibleConditions?.map((c, i) => (
                          <span key={i} className="ui-badge ui-badge-indigo" style={{ fontSize: 11, padding: "4px 12px" }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    {aiResult.suggestedTests && aiResult.suggestedTests.length > 0 && (
                      <div>
                        <p className="pdash-ai-label">Suggested Tests</p>
                        <div className="pdash-chip-wrap">
                          {aiResult.suggestedTests.map((t, i) => (
                            <span key={i} className="ui-badge ui-badge-amber" style={{ fontSize: 11, padding: "4px 12px" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiResult.advice && (
                      <div>
                        <p className="pdash-ai-label">Advice</p>
                        <div className="pdash-advice">{aiResult.advice}</div>
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: "var(--text-low)", margin: 0 }}>
                      This is a preliminary AI assessment, not a medical diagnosis. Consult a doctor for professional advice.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default PatientDashboard;
