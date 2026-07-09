import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import API from "../../services/api";
import Icon from "../../components/shared/Icon";

const cleanMsg = (m) => m.replace(/^[✅❌]\s*/, "");

const PlansPage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleUpgrade = async () => {
        setLoading(true);
        setMsg("");
        try {
            await API.put(`/auth/users/${user._id}/plan`, { plan: "pro" });
            // Update local user state
            const updatedUser = { ...user, subscriptionPlan: "pro" };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            login(updatedUser, localStorage.getItem("token"));
            setMsg("✅ Upgraded to Pro successfully!");
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Failed to upgrade"));
        } finally {
            setLoading(false);
        }
    };

    const handleDowngrade = async () => {
        setLoading(true);
        setMsg("");
        try {
            await API.put(`/auth/users/${user._id}/plan`, { plan: "free" });
            const updatedUser = { ...user, subscriptionPlan: "free" };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            login(updatedUser, localStorage.getItem("token"));
            setMsg("✅ Switched to Free plan.");
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Failed"));
        } finally {
            setLoading(false);
        }
    };

    const isPro = user?.subscriptionPlan === "pro";

    return (
        <>
            <style>{`
                .plans-root {
                    min-height: 100vh;
                    padding: 48px 24px;
                    font-family: var(--sans);
                    background: var(--bg);
                    position: relative;
                    overflow: hidden;
                }
                .plans-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px);
                    background-size: 48px 48px;
                    pointer-events: none;
                }
                .plans-glow { position: absolute; border-radius: 50%; pointer-events: none; }
                .plans-glow-teal {
                    width: 420px; height: 420px; top: -140px; left: 15%;
                    background: radial-gradient(circle, rgba(20,184,166,0.14), transparent 70%);
                }
                .plans-glow-indigo {
                    width: 380px; height: 380px; bottom: -100px; right: 10%;
                    background: radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%);
                }
                .plans-inner { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }
                .plans-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: var(--sans);
                    color: rgba(45,212,191,0.85);
                    padding: 0;
                    margin-bottom: 28px;
                }
                .plans-back:hover { color: #2dd4bf; }
                .plans-header { text-align: center; margin-bottom: 36px; }
                .plans-title {
                    font-family: var(--serif);
                    font-weight: 300;
                    font-size: 34px;
                    color: rgba(226,232,240,0.95);
                    letter-spacing: -0.01em;
                    margin: 0 0 8px;
                }
                .plans-title em { font-style: italic; color: #2dd4bf; }
                .plans-sub { font-size: 13px; color: rgba(100,116,139,0.9); font-weight: 300; margin: 0 0 20px; }
                .plans-current {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .plans-current-pro {
                    background: linear-gradient(135deg, rgba(45,212,191,0.15), rgba(129,140,248,0.15));
                    border: 1px solid rgba(45,212,191,0.3);
                    color: #2dd4bf;
                }
                .plans-current-free {
                    background: rgba(148,163,184,0.08);
                    border: 1px solid rgba(148,163,184,0.2);
                    color: rgba(148,163,184,0.9);
                }
                .plans-msg { max-width: 420px; margin: 0 auto 24px; text-align: center; }
                .plans-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                @media (max-width: 760px) { .plans-grid { grid-template-columns: 1fr; } }
                .plan-card {
                    position: relative;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 28px;
                }
                .plan-card-active { border-color: rgba(45,212,191,0.35); }
                .plan-card-pro {
                    background: linear-gradient(160deg, rgba(45,212,191,0.05), rgba(129,140,248,0.05));
                }
                .plan-tag {
                    position: absolute;
                    top: -11px;
                    padding: 3px 12px;
                    border-radius: 100px;
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .plan-tag-current {
                    left: 24px;
                    background: #0d9488;
                    color: #f0fdfa;
                }
                .plan-tag-recommended {
                    right: 24px;
                    background: linear-gradient(135deg, #2dd4bf, #818cf8);
                    color: #030712;
                }
                .plan-name {
                    font-size: 19px;
                    font-weight: 500;
                    color: rgba(226,232,240,0.95);
                    margin: 0 0 4px;
                }
                .plan-desc { font-size: 12px; color: rgba(100,116,139,0.85); font-weight: 300; margin: 0 0 20px; }
                .plan-price { margin-bottom: 24px; }
                .plan-price-val {
                    font-family: var(--serif);
                    font-weight: 300;
                    font-size: 40px;
                    color: rgba(226,232,240,0.95);
                    letter-spacing: -0.02em;
                }
                .plan-price-per { font-size: 12px; color: rgba(100,116,139,0.8); }
                .plan-price-note { font-size: 11px; color: #2dd4bf; margin-top: 4px; }
                .plan-features { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; }
                .plan-feature { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }
                .plan-check {
                    width: 18px; height: 18px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px;
                    flex-shrink: 0;
                }
                .plan-check-ok { background: rgba(45,212,191,0.12); color: #2dd4bf; border: 1px solid rgba(45,212,191,0.25); }
                .plan-check-no { background: rgba(148,163,184,0.06); color: rgba(100,116,139,0.5); border: 1px solid rgba(148,163,184,0.12); }
                .plan-feature-ok { color: rgba(203,213,225,0.9); }
                .plan-feature-no { color: rgba(100,116,139,0.5); }
                .plan-note {
                    margin-top: 28px;
                    padding: 14px;
                    border-radius: 12px;
                    text-align: center;
                    font-size: 12px;
                    color: rgba(100,116,139,0.8);
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                }
            `}</style>

            <div className="plans-root">
                <div className="plans-glow plans-glow-teal" />
                <div className="plans-glow plans-glow-indigo" />

                <div className="plans-inner">
                    <button onClick={() => navigate(-1)} className="plans-back">
                        <span style={{ fontSize: 15, lineHeight: 1 }}>&larr;</span> Back to Dashboard
                    </button>

                    {/* Header */}
                    <div className="plans-header">
                        <h1 className="plans-title">Choose your <em>plan</em></h1>
                        <p className="plans-sub">Upgrade to unlock AI health checkups and smart symptom insights</p>

                        <div className={`plans-current ${isPro ? "plans-current-pro" : "plans-current-free"}`}>
                            {isPro && <Icon name="star" size={12} />}
                            {isPro ? "Current Plan: Pro" : "Current Plan: Free"}
                        </div>
                    </div>

                    {msg && (
                        <div className="plans-msg">
                            <div className={msg.startsWith("✅") ? "ui-msg-ok" : "ui-msg-err"}>{cleanMsg(msg)}</div>
                        </div>
                    )}

                    {/* Plans Grid */}
                    <div className="plans-grid">

                        {/* Free Plan */}
                        <div className={`plan-card${!isPro ? " plan-card-active" : ""}`}>
                            {!isPro && <div className="plan-tag plan-tag-current">Current Plan</div>}

                            <h2 className="plan-name">Free</h2>
                            <p className="plan-desc">Perfect for getting started</p>

                            <div className="plan-price">
                                <span className="plan-price-val">$0</span>
                                <span className="plan-price-per">/month</span>
                            </div>

                            <ul className="plan-features">
                                {[
                                    { text: "Book appointments", ok: true },
                                    { text: "View prescriptions", ok: true },
                                    { text: "Health records access", ok: true },
                                    { text: "Print prescriptions", ok: true },
                                    { text: "AI Health Checkup", ok: false },
                                    { text: "Symptom risk assessment", ok: false },
                                    { text: "Suggested tests & advice", ok: false },
                                    { text: "Priority support", ok: false },
                                ].map((item, i) => (
                                    <li key={i} className="plan-feature">
                                        <span className={`plan-check ${item.ok ? "plan-check-ok" : "plan-check-no"}`}>
                                            <Icon name={item.ok ? "check" : "x"} size={11} strokeWidth={2.5} />
                                        </span>
                                        <span className={item.ok ? "plan-feature-ok" : "plan-feature-no"}>{item.text}</span>
                                    </li>
                                ))}
                            </ul>

                            {isPro ? (
                                <button onClick={handleDowngrade} disabled={loading}
                                    className="ui-btn-ghost" style={{ width: "100%", padding: "11px" }}>
                                    {loading ? "Processing..." : "Switch to Free"}
                                </button>
                            ) : (
                                <button disabled className="ui-btn-ghost"
                                    style={{ width: "100%", padding: "11px", opacity: 0.5, cursor: "not-allowed" }}>
                                    Current Plan
                                </button>
                            )}
                        </div>

                        {/* Pro Plan */}
                        <div className={`plan-card plan-card-pro${isPro ? " plan-card-active" : ""}`}>
                            <div className="plan-tag plan-tag-recommended"><Icon name="star" size={10} strokeWidth={2} /> Recommended</div>
                            {isPro && <div className="plan-tag plan-tag-current">Current Plan</div>}

                            <h2 className="plan-name">Pro</h2>
                            <p className="plan-desc">For professional clinics</p>

                            <div className="plan-price">
                                <span className="plan-price-val">$29</span>
                                <span className="plan-price-per">/month</span>
                                <div className="plan-price-note">Free during hackathon demo</div>
                            </div>

                            <ul className="plan-features">
                                {[
                                    { text: "Book appointments", ok: true },
                                    { text: "View prescriptions", ok: true },
                                    { text: "Health records access", ok: true },
                                    { text: "Print prescriptions", ok: true },
                                    { text: "AI Health Checkup", ok: true },
                                    { text: "Symptom risk assessment", ok: true },
                                    { text: "Suggested tests & advice", ok: true },
                                    { text: "Priority support", ok: true },
                                ].map((item, i) => (
                                    <li key={i} className="plan-feature">
                                        <span className="plan-check plan-check-ok">
                                            <Icon name="check" size={11} strokeWidth={2.5} />
                                        </span>
                                        <span className="plan-feature-ok">{item.text}</span>
                                    </li>
                                ))}
                            </ul>

                            {isPro ? (
                                <button disabled className="ui-btn ui-btn-block" style={{ opacity: 0.6, cursor: "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                    <Icon name="check" size={13} strokeWidth={2.5} /> Active Plan
                                </button>
                            ) : (
                                <button onClick={handleUpgrade} disabled={loading} className="ui-btn ui-btn-block">
                                    {loading ? "Processing..." : "Upgrade to Pro — Free"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Feature comparison note */}
                    <div className="plan-note">
                        This is a simulated SaaS subscription for the hackathon demo. No real payment required.
                        Upgrade is instant and free.
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlansPage;
