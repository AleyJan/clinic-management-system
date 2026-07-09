import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import useAuth from "../context/useAuth";
import Icon from "../components/shared/Icon";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" });
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
      const { data } = await registerUser(form);
      login(data, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .reg-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          font-family: var(--sans);
          background: var(--bg);
          position: relative;
          overflow: hidden;
        }
        .reg-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .reg-glow { position: absolute; border-radius: 50%; pointer-events: none; }
        .reg-glow-teal {
          width: 420px; height: 420px; top: -120px; right: -100px;
          background: radial-gradient(circle, rgba(20,184,166,0.16), transparent 70%);
        }
        .reg-glow-indigo {
          width: 360px; height: 360px; bottom: -80px; left: -60px;
          background: radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%);
        }
        .reg-card { width: 100%; max-width: 380px; position: relative; z-index: 1; }
        .reg-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
        .reg-brand-icon {
          width: 32px; height: 32px;
          border: 1.5px solid rgba(20,184,166,0.6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .reg-brand-name {
          font-family: var(--serif);
          font-weight: 300;
          font-size: 18px;
          color: rgba(226,232,240,0.9);
          letter-spacing: 0.02em;
        }
        .reg-accent {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, #2dd4bf, #818cf8);
          border-radius: 2px;
          margin-bottom: 32px;
        }
        .reg-title {
          font-size: 26px; font-weight: 400;
          color: rgba(226,232,240,0.95);
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }
        .reg-subtitle { font-size: 13px; color: rgba(100,116,139,0.9); font-weight: 300; margin: 0 0 32px; }
        .reg-field { margin-bottom: 18px; }
        .reg-field .ui-input { padding: 12px 14px; font-size: 14px; border-radius: 10px; }
        .reg-submit { margin-top: 8px; padding: 13px; border-radius: 10px; font-size: 14px; }
        .reg-login-link { text-align: center; margin-top: 24px; font-size: 12px; color: rgba(71,85,105,0.8); }
        .reg-login-link a { color: rgba(45,212,191,0.85); text-decoration: none; font-weight: 500; }
        .reg-login-link a:hover { color: #2dd4bf; }
      `}</style>

      <div className="reg-root">
        <div className="reg-glow reg-glow-teal" />
        <div className="reg-glow reg-glow-indigo" />

        <div className="reg-card">
          <div className="reg-brand">
            <div className="reg-brand-icon">
              <Icon name="cross" size={15} color="rgba(45,212,191,0.9)" strokeWidth={2} />
            </div>
            <span className="reg-brand-name">ClinicAI</span>
          </div>

          <div className="reg-accent" />

          <h1 className="reg-title">Create your account</h1>
          <p className="reg-subtitle">Join ClinicAI as a patient</p>

          {error && <div className="ui-msg-err">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="reg-field">
              <label className="ui-label" htmlFor="name">Full name</label>
              <input id="name" className="ui-input" type="text" name="name"
                value={form.name} onChange={handleChange} placeholder="Your full name" required />
            </div>
            <div className="reg-field">
              <label className="ui-label" htmlFor="email">Email address</label>
              <input id="email" className="ui-input" type="email" name="email"
                value={form.email} onChange={handleChange} placeholder="you@email.com" required />
            </div>
            <div className="reg-field">
              <label className="ui-label" htmlFor="password">Password</label>
              <input id="password" className="ui-input" type="password" name="password"
                value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
            </div>

            <button type="submit" className="ui-btn ui-btn-block reg-submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="reg-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
