import Sidebar from "./SideBar";

const Layout = ({ children, links, activeTab, setActiveTab }) => {
    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "#060b14",
            position: "relative",
            fontFamily: "'DM Sans', sans-serif",
        }}>
            {/* Global grid texture */}
            <div style={{
                position: "fixed",
                inset: 0,
                backgroundImage:
                    "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                pointerEvents: "none",
                zIndex: 0,
            }} />

            <Sidebar links={links} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main style={{
                marginLeft: 200,
                flex: 1,
                padding: "28px 28px",
                overflow: "auto",
                position: "relative",
                zIndex: 1,
                minHeight: "100vh",
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
