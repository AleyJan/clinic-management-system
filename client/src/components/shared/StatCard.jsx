import React from "react";

const StatCard = ({ title, value, icon, color = "#2dd4bf" }) => {
    return (
        <div style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.25s ease",
            cursor: "default",
            position: "relative",
            overflow: "hidden",
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)";
                e.currentTarget.style.borderColor = `${color}33`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
        >
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "2px",
                background: `linear-gradient(90deg, ${color}, transparent 70%)`,
            }} />

            <div style={{
                width: 34, height: 34,
                borderRadius: "9px",
                background: `${color}0D`,
                border: `1px solid ${color}26`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
            }}>
                {icon}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <p style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "rgba(100,116,139,0.7)",
                    margin: 0,
                }}>
                    {title}
                </p>
                <p style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#f8fafc",
                    lineHeight: 1.1,
                    margin: 0,
                    letterSpacing: "-0.02em",
                }}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
