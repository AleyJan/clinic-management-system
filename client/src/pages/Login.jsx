import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import useAuth from "../context/useAuth";
import Icon from "../components/shared/Icon";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Fraunces:ital,wght@0,300;1,300&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #060b14;
          position: relative;
          overflow: hidden;
        }
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .glow-spot { position: absolute; border-radius: 50%; pointer-events: none; }
        .glow-teal {
          width: 420px; height: 420px; top: -120px; left: -100px;
          background: radial-gradient(circle, rgba(20,184,166,0.18), transparent 70%);
        }
        .glow-indigo {
          width: 360px; height: 360px; bottom: -80px; right: -60px;
          background: radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%);
        }
        .panel-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 860px) {
          .panel-left { display: none; }
          .panel-right { flex: 1; }
        }
        .brand-mark { display: flex; align-items: center; gap: 10px; margin-bottom: 80px; }
        .brand-icon {
          width: 32px; height: 32px;
          border: 1.5px solid rgba(20,184,166,0.6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .brand-name {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 18px;
          color: rgba(226,232,240,0.9);
          letter-spacing: 0.02em;
        }
        .tagline {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-style: italic;
          font-size: 44px;
          line-height: 1.2;
          color: rgba(226,232,240,0.9);
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }
        .tagline em { font-style: normal; color: #2dd4bf; }
        .tagline-sub {
          font-size: 14px;
          color: rgba(148,163,184,0.7);
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }
        .feature-list { margin-top: 56px; display: flex; flex-direction: column; gap: 16px; }
        .feature-item { display: flex; align-items: center; gap: 12px; font-size: 13px; color: rgba(148,163,184,0.6); }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(45,212,191,0.5); flex-shrink: 0; }
        .panel-right {
          width: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          position: relative;
          z-index: 1;
        }
        .form-card { width: 100%; max-width: 380px; }
        .mobile-brand { display: none; align-items: center; gap: 8px; margin-bottom: 32px; }
        @media (max-width: 860px) { .mobile-brand { display: flex; } }
        .card-accent {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, #2dd4bf, #818cf8);
          border-radius: 2px;
          margin-bottom: 32px;
        }
        .form-header { margin-bottom: 36px; }
        .form-title {
          font-size: 26px; font-weight: 400;
          color: rgba(226,232,240,0.95);
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }
        .form-subtitle { font-size: 13px; color: rgba(100,116,139,0.9); font-weight: 300; margin: 0; }
        .error-box {
          background: rgba(220,38,38,0.08);
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: rgba(252,165,165,0.9);
          margin-bottom: 18px;
        }
        .field-group { margin-bottom: 18px; }
        .field-label {
          display: block;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(100,116,139,0.8);
          margin-bottom: 8px;
        }
        .field-input {
          width: 100%; box-sizing: border-box;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(51,65,85,0.8);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: rgba(226,232,240,0.9);
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: rgba(71,85,105,0.7); }
        .field-input:focus {
          border-color: rgba(45,212,191,0.4);
          box-shadow: 0 0 0 3px rgba(45,212,191,0.06);
        }
        .submit-btn {
          width: 100%; padding: 13px;
          border-radius: 10px; border: none; cursor: pointer;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; letter-spacing: 0.02em;
          color: #030712;
          background: linear-gradient(135deg, #2dd4bf 0%, #818cf8 100%);
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .sep { height: 1px; background: rgba(51,65,85,0.4); margin: 24px 0; }
        .demo-box {
          padding: 16px;
          background: rgba(15,23,42,0.5);
          border: 1px solid rgba(51,65,85,0.5);
          border-radius: 10px;
        }
        .demo-box-title {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(71,85,105,0.9); margin: 0 0 10px;
        }
        .demo-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; }
        .demo-pill {
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 2px 7px; border-radius: 100px; flex-shrink: 0;
        }
        .pill-admin { background: rgba(129,140,248,0.12); color: rgba(165,180,252,0.8); }
        .pill-doctor { background: rgba(45,212,191,0.1); color: rgba(94,234,212,0.8); }
        .pill-recep { background: rgba(148,163,184,0.1); color: rgba(148,163,184,0.7); }
        .demo-cred { font-size: 11px; color: rgba(100,116,139,0.7); font-family: monospace; }
        .register-link { text-align: center; margin-top: 24px; font-size: 12px; color: rgba(71,85,105,0.8); }
        .register-link a { color: rgba(45,212,191,0.85); text-decoration: none; font-weight: 500; }
        .register-link a:hover { color: #2dd4bf; }
      `}</style>

      <div className="login-root">
        <div className="glow-spot glow-teal" />
        <div className="glow-spot glow-indigo" />

        <div className="panel-left">
          <div className="brand-mark">
            <div className="brand-icon">
              <Icon name="cross" size={15} color="rgba(45,212,191,0.9)" strokeWidth={2} />
            </div>
            <span className="brand-name">ClinicAI</span>
          </div>
          <p className="tagline">
            Clinical care,<br />
            <em>intelligently</em><br />
            managed.
          </p>
          <p className="tagline-sub">
            A unified platform for doctors, staff, and administrators — streamlining every patient interaction.
          </p>
          <div className="feature-list">
            {["Real-time appointment scheduling", "AI-assisted patient records", "Role-based access control", "HIPAA-compliant data handling"].map((f) => (
              <div key={f} className="feature-item">
                <div className="feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="panel-right">
          <div className="form-card">
            <div className="mobile-brand">
              <div className="brand-icon">
                <Icon name="cross" size={15} color="rgba(45,212,191,0.9)" strokeWidth={2} />
              </div>
              <span className="brand-name">ClinicAI</span>
            </div>

            <div className="card-accent" />

            <div className="form-header">
              <h1 className="form-title">Welcome back</h1>
              <p className="form-subtitle">Sign in to continue to your workspace</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="email">Email address</label>
                <input id="email" className="field-input" type="email" name="email"
                  value={form.email} onChange={handleChange} placeholder="you@clinic.com" required />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="password">Password</label>
                <input id="password" className="field-input" type="password" name="password"
                  value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="sep" />

            <div className="demo-box">
              <p className="demo-box-title">Demo accounts</p>
              {[
                { pill: "pill-admin", label: "Admin", cred: "ali@test.com · 123456" },
                { pill: "pill-doctor", label: "Doctor", cred: "doctor@test.com · 123456" },
                { pill: "pill-recep", label: "Staff", cred: "sara@test.com · 123456" },
              ].map(({ pill, label, cred }) => (
                <div key={label} className="demo-row">
                  <span className={`demo-pill ${pill}`}>{label}</span>
                  <span className="demo-cred">{cred}</span>
                </div>
              ))}
            </div>

            <p className="register-link">
              New patient? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;