import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PlansPage from "./pages/plans/PlansPage";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// Role dashboards — we'll build these next
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";

// Reads role from user and redirects to correct dashboard
const RoleRedirect = ({ user }) => {
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" />;
    case "doctor":
      return <Navigate to="/doctor" />;
    case "receptionist":
      return <Navigate to="/receptionist" />;
    case "patient":
      return <Navigate to="/patient" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          // Add inside Routes
          <Route path="/plans" element={
            <PrivateRoute>
              <PlansPage />
            </PrivateRoute>
          } />

          {/* After login — redirect by role */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {({ user }) => <RoleRedirect user={user} />}
              </PrivateRoute>
            }
          />

          {/* Role dashboards */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/*"
            element={
              <PrivateRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/receptionist/*"
            element={
              <PrivateRoute allowedRoles={["receptionist"]}>
                <ReceptionistDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/*"
            element={
              <PrivateRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
