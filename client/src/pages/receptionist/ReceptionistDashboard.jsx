import { useState, useEffect } from "react";
import Layout from "../../components/shared/Layout";
import Icon from "../../components/shared/Icon";
import API from "../../services/api";

const receptionistLinks = [
  { tab: "patients", icon: "users", label: "Patients" },
  { tab: "addPatient", icon: "user-plus", label: "Add Patient" },
  { tab: "appointments", icon: "calendar", label: "Appointments" },
  { tab: "bookAppointment", icon: "edit", label: "Book Appointment" },
];

const cleanMsg = (m) => m.replace(/^[✅❌]\s*/, "");

const statusBadge = (status) => ({
  completed: "ui-badge ui-badge-teal",
  confirmed: "ui-badge ui-badge-indigo",
  cancelled: "ui-badge ui-badge-pink",
  pending: "ui-badge ui-badge-amber",
}[status] || "ui-badge ui-badge-amber");

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState("patients");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [patientForm, setPatientForm] = useState({ name: "", age: "", gender: "male", contact: "" });
  const [patientMsg, setPatientMsg] = useState("");

  const [apptForm, setApptForm] = useState({ patientId: "", doctorId: "", date: "" });
  const [apptMsg, setApptMsg] = useState("");

  // Edit patient state
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", age: "", gender: "male", contact: "" });
  const [editMsg, setEditMsg] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [pRes, aRes, uRes] = await Promise.all([
        API.get("/patients"),
        API.get("/appointments"),
        API.get("/auth/users?role=doctor"),
      ]);
      setPatients(pRes.data);
      setAppointments(aRes.data);
      setDoctors(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setPatientMsg("");
    try {
      await API.post("/patients", patientForm);
      setPatientMsg("✅ Patient added successfully!");
      setPatientForm({ name: "", age: "", gender: "male", contact: "" });
      fetchAll();
    } catch (err) {
      setPatientMsg("❌ " + (err.response?.data?.message || "Failed to add patient"));
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setApptMsg("");
    try {
      await API.post("/appointments", apptForm);
      setApptMsg("✅ Appointment booked successfully!");
      setApptForm({ patientId: "", doctorId: "", date: "" });
      fetchAll();
    } catch (err) {
      setApptMsg("❌ " + (err.response?.data?.message || "Failed to book appointment"));
    }
  };

  const handleCancel = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (patient) => {
    setEditingPatient(patient._id);
    setEditForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
    });
    setEditMsg("");
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    setEditMsg("");
    try {
      await API.put(`/patients/${editingPatient}`, editForm);
      setEditMsg("✅ Patient updated!");
      setEditingPatient(null);
      fetchAll();
    } catch (err) {
      setEditMsg("❌ " + (err.response?.data?.message || "Failed to update"));
    }
  };

  if (loading) return (
    <Layout links={receptionistLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="ui-loading-wrap">
        <div style={{ textAlign: "center" }}>
          <div className="ui-spinner" />
          <p className="ui-loading-text">Loading…</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout links={receptionistLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <style>{`
        .rdash-edit-box {
          background: rgba(129,140,248,0.05);
          border: 1px solid rgba(129,140,248,0.18);
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 22px;
        }
        .rdash-edit-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 700px) { .rdash-edit-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="ui-page-header">
        <h1 className="ui-page-title">Receptionist Dashboard</h1>
        <p className="ui-page-sub">Manage patients and appointments</p>
      </div>

      {/* Stats */}
      <div className="ui-stat-grid">
        {[
          { label: "Total Patients", value: patients.length, icon: "users", cls: "ui-stat-teal" },
          { label: "Pending", value: appointments.filter(a => a.status === "pending").length, icon: "clock", cls: "ui-stat-amber" },
          { label: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length, icon: "calendar", cls: "ui-stat-indigo" },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className={`ui-stat ${cls}`}>
            <div className="ui-stat-icon"><Icon name={icon} size={15} /></div>
            <div className="ui-stat-val">{value}</div>
            <div className="ui-stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="ui-card">

        {/* Patients List */}
        {activeTab === "patients" && (
          <div>
            <p className="ui-card-title">
              All Patients <span className="ui-card-count">({patients.length})</span>
            </p>
            {patients.length === 0 ? (
              <p className="ui-empty">No patients yet. Add one!</p>
            ) : (
              <>
                {/* Edit Form */}
                {editingPatient && (
                  <div className="rdash-edit-box">
                    <p className="ui-card-title">Edit Patient Info</p>
                    {editMsg && (
                      <div className={editMsg.startsWith("✅") ? "ui-msg-ok" : "ui-msg-err"}>
                        {cleanMsg(editMsg)}
                      </div>
                    )}
                    <form onSubmit={handleEditPatient} className="rdash-edit-grid">
                      <input type="text" value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="ui-input" placeholder="Name" required />
                      <input type="number" value={editForm.age}
                        onChange={e => setEditForm({ ...editForm, age: e.target.value })}
                        className="ui-input" placeholder="Age" required />
                      <select value={editForm.gender}
                        onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                        className="ui-input">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <input type="text" value={editForm.contact}
                        onChange={e => setEditForm({ ...editForm, contact: e.target.value })}
                        className="ui-input" placeholder="Contact" required />
                      <button type="submit" className="ui-btn">Save Changes</button>
                      <button type="button" onClick={() => setEditingPatient(null)} className="ui-btn-ghost">
                        Cancel
                      </button>
                    </form>
                  </div>
                )}

                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p._id}>
                        <td className="td-name">{p.name}</td>
                        <td>{p.age === 0 ? "—" : p.age}</td>
                        <td style={{ textTransform: "capitalize" }}>{p.gender}</td>
                        <td>{p.contact}</td>
                        <td>
                          <button onClick={() => startEdit(p)} className="ui-action ui-action-indigo">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* Add Patient */}
        {activeTab === "addPatient" && (
          <div style={{ maxWidth: 420 }}>
            <p className="ui-card-title">Add New Patient</p>
            {patientMsg && (
              <div className={patientMsg.startsWith("✅") ? "ui-msg-ok" : "ui-msg-err"}>
                {cleanMsg(patientMsg)}
              </div>
            )}
            <form onSubmit={handleAddPatient} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="ui-label">Full Name</label>
                <input type="text" value={patientForm.name}
                  onChange={e => setPatientForm({ ...patientForm, name: e.target.value })}
                  className="ui-input" placeholder="Patient full name" required />
              </div>
              <div>
                <label className="ui-label">Age</label>
                <input type="number" value={patientForm.age}
                  onChange={e => setPatientForm({ ...patientForm, age: e.target.value })}
                  className="ui-input" placeholder="Age" required />
              </div>
              <div>
                <label className="ui-label">Gender</label>
                <select value={patientForm.gender}
                  onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                  className="ui-input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="ui-label">Contact</label>
                <input type="text" value={patientForm.contact}
                  onChange={e => setPatientForm({ ...patientForm, contact: e.target.value })}
                  className="ui-input" placeholder="03001234567" required />
              </div>
              <button type="submit" className="ui-btn ui-btn-block">Add Patient</button>
            </form>
          </div>
        )}

        {/* Appointments */}
        {activeTab === "appointments" && (
          <div>
            <p className="ui-card-title">
              All Appointments <span className="ui-card-count">({appointments.length})</span>
            </p>
            {appointments.length === 0 ? (
              <p className="ui-empty">No appointments yet.</p>
            ) : (
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td className="td-name">{a.patientId?.name}</td>
                      <td>{a.doctorId?.name}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td><span className={statusBadge(a.status)}>{a.status}</span></td>
                      <td>
                        {a.status !== "cancelled" && a.status !== "completed" && (
                          <button onClick={() => handleCancel(a._id)} className="ui-action ui-action-pink">
                            Cancel
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

        {/* Book Appointment */}
        {activeTab === "bookAppointment" && (
          <div style={{ maxWidth: 420 }}>
            <p className="ui-card-title">Book Appointment</p>
            {apptMsg && (
              <div className={apptMsg.startsWith("✅") ? "ui-msg-ok" : "ui-msg-err"}>
                {cleanMsg(apptMsg)}
              </div>
            )}
            <form onSubmit={handleBookAppointment} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="ui-label">Select Patient</label>
                <select value={apptForm.patientId}
                  onChange={e => setApptForm({ ...apptForm, patientId: e.target.value })}
                  className="ui-input" required>
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Age: {p.age === 0 ? "N/A" : p.age})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ui-label">Select Doctor</label>
                <select value={apptForm.doctorId}
                  onChange={e => setApptForm({ ...apptForm, doctorId: e.target.value })}
                  className="ui-input" required>
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ui-label">Date & Time</label>
                <input type="datetime-local" value={apptForm.date}
                  onChange={e => setApptForm({ ...apptForm, date: e.target.value })}
                  className="ui-input" required />
              </div>
              <button type="submit" className="ui-btn ui-btn-block">Book Appointment</button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;
