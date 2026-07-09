import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import Icon from "./Icon";

const Sidebar = ({ links, activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const initial = user?.name?.charAt(0).toUpperCase();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Fraunces:wght@300&display=swap');

                .sb-root {
                    position: fixed;
                    left: 0; top: 0;
                    height: 100vh;
                    width: 200px;
                    display: flex;
                    flex-direction: column;
                    z-index: 10;
                    font-family: 'DM Sans', sans-serif;
                    background: #070c17;
                    border-right: 1px solid rgba(255,255,255,0.06);
                }
                .sb-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px);
                    background-size: 32px 32px;
                    pointer-events: none;
                }
                .sb-glow {
                    position: absolute;
                    width: 180px; height: 180px;
                    top: -40px; left: -60px;
                    background: radial-gradient(circle, rgba(20,184,166,0.1), transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .sb-logo {
                    padding: 18px 16px 14px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    position: relative; z-index: 1;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .sb-logo-icon {
                    width: 30px; height: 30px;
                    border: 1.5px solid rgba(45,212,191,0.45);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                .sb-logo-name {
                    font-family: 'Fraunces', serif;
                    font-weight: 300;
                    font-size: 15px;
                    color: rgba(226,232,240,0.9);
                    letter-spacing: 0.01em;
                    line-height: 1;
                    margin-bottom: 2px;
                }
                .sb-logo-role {
                    font-size: 9px;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: rgba(45,212,191,0.6);
                }

                .sb-user {
                    padding: 12px 14px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    position: relative; z-index: 1;
                }
                .sb-user-inner {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    padding: 8px 10px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .sb-avatar {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(45,212,191,0.3), rgba(129,140,248,0.3));
                    border: 1px solid rgba(45,212,191,0.25);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(226,232,240,0.9);
                    flex-shrink: 0;
                }
                .sb-user-name {
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(226,232,240,0.88);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 1px;
                }
                .sb-user-email {
                    font-size: 10px;
                    color: rgba(100,116,139,0.65);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sb-nav {
                    flex: 1;
                    padding: 10px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    overflow-y: auto;
                    position: relative; z-index: 1;
                }
                .sb-nav-label {
                    font-size: 9px;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: rgba(71,85,105,0.6);
                    padding: 8px 8px 4px;
                }

                .sb-link {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    padding: 8px 10px;
                    border-radius: 9px;
                    border: 1px solid transparent;
                    background: none;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 400;
                    color: rgba(100,116,139,0.75);
                    transition: all 0.15s;
                    text-align: left;
                    position: relative;
                }
                .sb-link:hover {
                    color: rgba(226,232,240,0.85);
                    background: rgba(255,255,255,0.03);
                }
                .sb-link.active {
                    color: rgba(226,232,240,0.95);
                    font-weight: 500;
                    background: rgba(45,212,191,0.07);
                    border-color: rgba(45,212,191,0.15);
                }
                .sb-link-icon { font-size: 14px; flex-shrink: 0; }
                .sb-link-dot {
                    margin-left: auto;
                    width: 4px; height: 4px;
                    border-radius: 50%;
                    background: #2dd4bf;
                    flex-shrink: 0;
                }
                .sb-link-bar {
                    position: absolute;
                    left: 0; top: 50%;
                    transform: translateY(-50%);
                    width: 2px; height: 14px;
                    background: #2dd4bf;
                    border-radius: 0 2px 2px 0;
                }

                .sb-plans {
                    padding: 8px 10px 4px;
                    position: relative; z-index: 1;
                }
                .sb-plans-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    padding: 8px 10px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 500;
                    text-align: left;
                    transition: all 0.15s;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(45,212,191,0.85);
                }
                .sb-plans-btn:hover { background: rgba(45,212,191,0.07); border-color: rgba(45,212,191,0.2); }
                .sb-plans-btn.pro {
                    background: linear-gradient(135deg, rgba(45,212,191,0.12), rgba(129,140,248,0.12));
                    border-color: rgba(45,212,191,0.3);
                    color: #2dd4bf;
                }
                .sb-plans-btn.pro:hover { border-color: rgba(45,212,191,0.5); }

                .sb-footer {
                    padding: 10px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    position: relative; z-index: 1;
                }
                .sb-logout {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    padding: 8px 10px;
                    border-radius: 9px;
                    border: 1px solid transparent;
                    background: none;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: 'DM Sans', sans-serif;
                    color: rgba(100,116,139,0.6);
                    transition: all 0.15s;
                    text-align: left;
                }
                .sb-logout:hover {
                    color: rgba(244,114,182,0.9);
                    background: rgba(244,114,182,0.06);
                    border-color: rgba(244,114,182,0.12);
                }
                .sb-logout-icon { font-size: 14px; }
            `}</style>

            <div className="sb-root">
                <div className="sb-glow" />

                {/* Logo */}
                <div className="sb-logo">
                    <div className="sb-logo-icon">
                        <Icon name="cross" size={14} color="rgba(45,212,191,0.9)" strokeWidth={2} />
                    </div>
                    <div>
                        <div className="sb-logo-name">ClinicAI</div>
                        <div className="sb-logo-role">{user?.role}</div>
                    </div>
                </div>

                {/* User info */}
                <div className="sb-user">
                    <div className="sb-user-inner">
                        <div className="sb-avatar">{initial}</div>
                        <div style={{ overflow: "hidden" }}>
                            <div className="sb-user-name">{user?.name}</div>
                            <div className="sb-user-email">{user?.email}</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sb-nav">
                    <div className="sb-nav-label">Navigation</div>
                    {links.map((link) => (
                        <button
                            key={link.tab}
                            onClick={() => setActiveTab(link.tab)}
                            className={`sb-link${activeTab === link.tab ? " active" : ""}`}
                        >
                            {activeTab === link.tab && <div className="sb-link-bar" />}
                            <span className="sb-link-icon"><Icon name={link.icon} size={14} /></span>
                            <span>{link.label}</span>
                            {activeTab === link.tab && <div className="sb-link-dot" />}
                        </button>
                    ))}
                </nav>
                {/* Plans Button — subscription plans are for patients only */}
                {user?.role === "patient" && (
                    <div className="sb-plans">
                        <button
                            onClick={() => navigate("/plans")}
                            className={`sb-plans-btn${user?.subscriptionPlan === "pro" ? " pro" : ""}`}
                        >
                            <Icon name={user?.subscriptionPlan === "pro" ? "star" : "lock"} size={13} />
                            <span>{user?.subscriptionPlan === "pro" ? "Pro Plan" : "Upgrade to Pro"}</span>
                        </button>
                    </div>
                )}

                {/* Logout */}
                <div className="sb-footer">
                    <button className="sb-logout" onClick={handleLogout}>
                        <Icon name="logout" size={13} />
                        <span>Sign out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
