import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="ui-spinner" />
          <p className="ui-loading-text">Loading…</p>
        </div>
      </div>
    );

  if (!user) return <Navigate to="/login" />;

  // If roles specified, check if user has permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  // Pass user down if children is a function
  if (typeof children === "function") return children({ user });

  return children;
};

export default PrivateRoute;
