import { useState, useEffect } from "react";
import Layout from "../../components/shared/Layout";
import Icon from "../../components/shared/Icon";
import API from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const adminLinks = [
  { tab: "overview", icon: "chart", label: "Overview" },
  { tab: "patients", icon: "users", label: "Patients" },
  { tab: "appointments", icon: "calendar", label: "Appointments" },
  { tab: "addUser", icon: "user-plus", label: "Add Staff" },
  { tab: "analytics", icon: "trend", label: "Analytics" },
];

const cleanMsg = (m) => m.replace(/^[✅❌]\s*/, "");

const COLORS = ["#2dd4bf", "#818cf8", "#fb923c", "#f472b6", "#34d399"];

const badge = (status) => {
  const styles = {
    completed: { background: "rgba(45,212,191,0.12)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.25)" },
    confirmed: { background: "rgba(129,140,248,0.12)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.25)" },
    cancelled: { background: "rgba(244,114,182,0.12)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.25)" },
    pending: { background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" },
  };
  const s = styles[status] || styles.pending;
  return {
    ...s,
    padding: "2px 10px",
    borderRadius: "100px",
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "capitalize",
    display: "inline-block",
  };
};

const roleBadge = (role) => {
  const styles = {
    admin: { background: "rgba(129,140,248,0.12)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" },
    doctor: { background: "rgba(45,212,191,0.12)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.2)" },
    receptionist: { background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" },
  };
  const s = styles[role] || styles.receptionist;
  return {
    ...s,
    padding: "2px 10px",
    borderRadius: "100px",
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "capitalize",
    display: "inline-block",
  };
};

const card = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "14px",
  padding: "20px",
};

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "9px",
  padding: "9px 12px",
  outline: "none",
  color: "rgba(226,232,240,0.9)",
  fontSize: "13px",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "rgba(226,232,240,0.85)",
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "doctor" });
  const [userMsg, setUserMsg] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [pRes, aRes, uRes] = await Promise.all([
        API.get("/patients"),
        API.get("/appointments"),
        API.get("/auth/users"),
      ]);
      setPatients(pRes.data);
      setAppointments(aRes.data);
      setAllUsers(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserMsg("");
    try {
      await API.post("/auth/register", userForm);
      setUserMsg("✅ User added!");
      setUserForm({ name: "", email: "", password: "", role: "doctor" });
      fetchAll();
    } catch (err) {
      setUserMsg("❌ " + (err.response?.data?.message || "Failed"));
    }
  };

  const statusData = [
    { name: "Pending", value: appointments.filter(a => a.status === "pending").length },
    { name: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length },
    { name: "Completed", value: appointments.filter(a => a.status === "completed").length },
    { name: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length },
  ].filter(d => d.value > 0);

  const roleData = [
    { name: "Doctors", value: allUsers.filter(u => u.role === "doctor").length },
    { name: "Receptionists", value: allUsers.filter(u => u.role === "receptionist").length },
    { name: "Patients", value: allUsers.filter(u => u.role === "patient").length },
    { name: "Admins", value: allUsers.filter(u => u.role === "admin").length },
  ].filter(d => d.value > 0);

  const monthlyData = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);
    appointments.forEach(a => { counts[new Date(a.date).getMonth()]++; });
    return months.map((name, i) => ({ name, appointments: counts[i] })).filter(d => d.appointments > 0);
  })();

  const genderData = [
    { name: "Male", value: patients.filter(p => p.gender === "male").length },
    { name: "Female", value: patients.filter(p => p.gender === "female").length },
    { name: "Other", value: patients.filter(p => p.gender === "other").length },
  ].filter(d => d.value > 0);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Fraunces:wght@300&display=swap');

    .adash-root {
      font-family: 'DM Sans', sans-serif;
      color: rgba(226,232,240,0.9);
      min-height: 100vh;
      background: #060b14;
      position: relative;
    }
    .adash-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
      z-index: 0;
    }
    .adash-content { position: relative; z-index: 1; }

    .adash-page-header { margin-bottom: 24px; }
    .adash-page-title {
      font-family: 'Fraunces', serif;
      font-weight: 300;
      font-size: 22px;
      color: rgba(226,232,240,0.95);
      letter-spacing: -0.01em;
      margin: 0 0 4px;
    }
    .adash-page-sub { font-size: 12px; color: rgba(100,116,139,0.8); font-weight: 300; margin: 0; }

    .adash-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    @media (max-width: 900px) { .adash-stat-grid { grid-template-columns: repeat(2, 1fr); } }

    .adash-stat {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 16px;
    }
    .adash-stat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: rgba(255,255,255,0.04);
      margin-bottom: 12px;
    }
    .adash-stat-teal .adash-stat-icon { color: #2dd4bf; }
    .adash-stat-indigo .adash-stat-icon { color: #818cf8; }
    .adash-stat-amber .adash-stat-icon { color: #fb923c; }
    .adash-stat-pink .adash-stat-icon { color: #34d399; }
    .adash-stat-val {
      font-size: 28px;
      font-weight: 500;
      color: rgba(226,232,240,0.95);
      line-height: 1;
      margin-bottom: 4px;
    }
    .adash-stat-label { font-size: 11px; color: rgba(100,116,139,0.75); font-weight: 300; }

    .adash-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 860px) { .adash-two-col { grid-template-columns: 1fr; } }

    .adash-three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    @media (max-width: 900px) { .adash-three-col { grid-template-columns: 1fr; } }

    .adash-four-col { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; }
    @media (max-width: 860px) { .adash-four-col { grid-template-columns: repeat(2, 1fr); } }

    .adash-card-title {
      font-size: 12px;
      font-weight: 500;
      color: rgba(226,232,240,0.85);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin: 0 0 16px;
    }

    .adash-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .adash-table th {
      text-align: left;
      color: rgba(100,116,139,0.7);
      font-weight: 400;
      font-size: 10px;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      padding: 0 0 10px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .adash-table td {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: rgba(148,163,184,0.8);
      vertical-align: middle;
    }
    .adash-table tr:last-child td { border-bottom: none; }
    .adash-table tr:hover td { background: rgba(255,255,255,0.02); }
    .adash-table .td-name { color: rgba(226,232,240,0.9); font-weight: 500; }

    .adash-empty { font-size: 12px; color: rgba(100,116,139,0.5); }

    .adash-mini-stat {
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }
    .adash-mini-val { font-size: 22px; font-weight: 500; line-height: 1; margin-bottom: 4px; }
    .adash-mini-label { font-size: 10px; color: rgba(100,116,139,0.7); font-weight: 300; }

    .adash-label {
      display: block;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: rgba(100,116,139,0.7);
      margin-bottom: 6px;
    }
    .adash-input { transition: border-color 0.2s; }
    .adash-input:focus { border-color: rgba(45,212,191,0.4) !important; }
    .adash-input::placeholder { color: rgba(71,85,105,0.5); }

    .adash-submit {
      width: 100%;
      padding: 10px;
      border-radius: 9px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      color: #030712;
      background: linear-gradient(135deg, #2dd4bf, #818cf8);
      transition: opacity 0.2s;
      letter-spacing: 0.02em;
    }
    .adash-submit:hover { opacity: 0.88; }

    .adash-msg-ok {
      background: rgba(45,212,191,0.08);
      border: 1px solid rgba(45,212,191,0.2);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      color: #2dd4bf;
      margin-bottom: 14px;
    }
    .adash-msg-err {
      background: rgba(244,114,182,0.08);
      border: 1px solid rgba(244,114,182,0.2);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      color: #f472b6;
      margin-bottom: 14px;
    }

    .adash-section-title {
      font-size: 13px;
      font-weight: 400;
      color: rgba(100,116,139,0.7);
      margin: 0 0 16px;
      letter-spacing: 0.02em;
    }
  `;

  const LoadingScreen = () => (
    <Layout links={adminLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <style>{styles}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 32, height: 32, border: "2px solid rgba(45,212,191,0.3)",
            borderTopColor: "#2dd4bf", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
          }} />
          <p style={{ fontSize: 12, color: "rgba(100,116,139,0.6)" }}>Loading…</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  if (loading) return <LoadingScreen />;

  return (
    <Layout links={adminLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
      <style>{styles}</style>
      <div className="adash-root">
        <div className="adash-content">

          <div className="adash-page-header">
            <h1 className="adash-page-title">Admin Dashboard</h1>
            <p className="adash-page-sub">System overview and management</p>
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div>
              <div className="adash-stat-grid">
                {[
                  { label: "Total Patients", value: patients.length, icon: "users", cls: "adash-stat-teal" },
                  { label: "Doctors", value: allUsers.filter(u => u.role === "doctor").length, icon: "activity", cls: "adash-stat-indigo" },
                  { label: "Appointments", value: appointments.length, icon: "calendar", cls: "adash-stat-amber" },
                  { label: "Completed", value: appointments.filter(a => a.status === "completed").length, icon: "check-circle", cls: "adash-stat-pink" },
                ].map(({ label, value, icon, cls }) => (
                  <div key={label} className={`adash-stat ${cls}`}>
                    <div className="adash-stat-icon"><Icon name={icon} size={15} /></div>
                    <div className="adash-stat-val">{value}</div>
                    <div className="adash-stat-label">{label}</div>
                  </div>
                ))}
              </div>

              <div className="adash-two-col">
                <div style={card}>
                  <p className="adash-card-title">Recent Patients</p>
                  {patients.length === 0
                    ? <p className="adash-empty">No patients yet</p>
                    : (
                      <table className="adash-table">
                        <thead><tr>
                          <th>Name</th><th>Age</th><th>Gender</th>
                        </tr></thead>
                        <tbody>
                          {patients.slice(0, 5).map(p => (
                            <tr key={p._id}>
                              <td className="td-name" style={{ color: "rgba(226,232,240,0.9)", fontWeight: 500 }}>{p.name}</td>
                              <td>{p.age || "—"}</td>
                              <td style={{ textTransform: "capitalize" }}>{p.gender}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>

                <div style={card}>
                  <p className="adash-card-title">Recent Appointments</p>
                  {appointments.length === 0
                    ? <p className="adash-empty">No appointments yet</p>
                    : (
                      <table className="adash-table">
                        <thead><tr>
                          <th>Patient</th><th>Doctor</th><th>Status</th>
                        </tr></thead>
                        <tbody>
                          {appointments.slice(0, 5).map(a => (
                            <tr key={a._id}>
                              <td style={{ color: "rgba(226,232,240,0.9)", fontWeight: 500 }}>{a.patientId?.name}</td>
                              <td>{a.doctorId?.name}</td>
                              <td><span style={badge(a.status)}>{a.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={card}>
                <p className="adash-card-title">Monthly Appointments</p>
                {monthlyData.length === 0
                  ? <p className="adash-empty">No data yet</p>
                  : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyData} barSize={24}>
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2dd4bf" />
                            <stop offset="100%" stopColor="#818cf8" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(100,116,139,0.6)" }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "rgba(100,116,139,0.6)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        <Bar dataKey="appointments" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
              </div>

              <div className="adash-three-col">
                {[
                  { title: "Appointment Status", data: statusData },
                  { title: "User Roles", data: roleData },
                  { title: "Patient Gender", data: genderData },
                ].map(({ title, data }) => (
                  <div key={title} style={card}>
                    <p className="adash-card-title">{title}</p>
                    {data.length === 0
                      ? <p className="adash-empty">No data yet</p>
                      : (
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={data} cx="50%" cy="50%" outerRadius={65} innerRadius={28}
                              dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false} fontSize={10}>
                              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                  </div>
                ))}
              </div>

              <div className="adash-four-col">
                {[
                  { label: "Completed", value: appointments.filter(a => a.status === "completed").length, color: "#2dd4bf", bg: "rgba(45,212,191,0.07)", border: "rgba(45,212,191,0.15)" },
                  { label: "Pending", value: appointments.filter(a => a.status === "pending").length, color: "#fb923c", bg: "rgba(251,146,60,0.07)", border: "rgba(251,146,60,0.15)" },
                  { label: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length, color: "#f472b6", bg: "rgba(244,114,182,0.07)", border: "rgba(244,114,182,0.15)" },
                  { label: "Doctors", value: allUsers.filter(u => u.role === "doctor").length, color: "#818cf8", bg: "rgba(129,140,248,0.07)", border: "rgba(129,140,248,0.15)" },
                ].map(({ label, value, color, bg, border }) => (
                  <div key={label} className="adash-mini-stat" style={{ background: bg, border: `1px solid ${border}` }}>
                    <div className="adash-mini-val" style={{ color }}>{value}</div>
                    <div className="adash-mini-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PATIENTS ── */}
          {activeTab === "patients" && (
            <div style={card}>
              <p className="adash-card-title">All Patients <span style={{ color: "rgba(100,116,139,0.5)", fontWeight: 300, textTransform: "none", fontSize: 11, letterSpacing: 0 }}>({patients.length})</span></p>
              {patients.length === 0
                ? <p className="adash-empty">No patients yet</p>
                : (
                  <table className="adash-table">
                    <thead><tr>
                      <th>Name</th><th>Age</th><th>Gender</th><th>Contact</th>
                    </tr></thead>
                    <tbody>
                      {patients.map(p => (
                        <tr key={p._id}>
                          <td style={{ color: "rgba(226,232,240,0.9)", fontWeight: 500 }}>{p.name}</td>
                          <td>{p.age === 0 ? "—" : p.age}</td>
                          <td style={{ textTransform: "capitalize" }}>{p.gender}</td>
                          <td>{p.contact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {activeTab === "appointments" && (
            <div style={card}>
              <p className="adash-card-title">All Appointments <span style={{ color: "rgba(100,116,139,0.5)", fontWeight: 300, textTransform: "none", fontSize: 11, letterSpacing: 0 }}>({appointments.length})</span></p>
              {appointments.length === 0
                ? <p className="adash-empty">No appointments yet</p>
                : (
                  <table className="adash-table">
                    <thead><tr>
                      <th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {appointments.map(a => (
                        <tr key={a._id}>
                          <td style={{ color: "rgba(226,232,240,0.9)", fontWeight: 500 }}>{a.patientId?.name}</td>
                          <td>{a.doctorId?.name}</td>
                          <td>{new Date(a.date).toLocaleDateString()}</td>
                          <td><span style={badge(a.status)}>{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {/* ── ADD USER ── */}
          {activeTab === "addUser" && (
            <div className="adash-two-col">
              <div style={card}>
                <p className="adash-card-title">Add Doctor / Staff</p>
                {userMsg && (
                  <div className={userMsg.startsWith("✅") ? "adash-msg-ok" : "adash-msg-err"}>
                    {cleanMsg(userMsg)}
                  </div>
                )}
                <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {["name", "email", "password"].map(field => (
                    <div key={field}>
                      <label className="adash-label">{field}</label>
                      <input
                        className="adash-input"
                        type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                        value={userForm[field]}
                        onChange={e => setUserForm({ ...userForm, [field]: e.target.value })}
                        style={inputStyle}
                        placeholder={field === "name" ? "Full name" : field === "email" ? "email@clinic.com" : "Min 6 chars"}
                        required
                      />
                    </div>
                  ))}
                  <div>
                    <label className="adash-label">Role</label>
                    <select
                      className="adash-input"
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="adash-submit">Add User</button>
                </form>
              </div>

              <div style={card}>
                <p className="adash-card-title">
                  All Staff <span style={{ color: "rgba(100,116,139,0.5)", fontWeight: 300, textTransform: "none", fontSize: 11, letterSpacing: 0 }}>({allUsers.filter(u => u.role !== "patient").length})</span>
                </p>
                <table className="adash-table">
                  <thead><tr>
                    <th>Name</th><th>Email</th><th>Role</th>
                  </tr></thead>
                  <tbody>
                    {allUsers.filter(u => u.role !== "patient").map(u => (
                      <tr key={u._id}>
                        <td style={{ color: "rgba(226,232,240,0.9)", fontWeight: 500 }}>{u.name}</td>
                        <td style={{ fontSize: 11 }}>{u.email}</td>
                        <td><span style={roleBadge(u.role)}>{u.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
