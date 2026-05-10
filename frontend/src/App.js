import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import Home       from "./pages/Home";
import Dashboard  from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import EditPost    from "./pages/EditPost";
import BlogDetail  from "./pages/BlogDetail";
import Profile     from "./pages/Profile";
import "./styles/global.css";

// ─── Route Guards ─────────────────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AuthorRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "author") return <Navigate to="/feed" replace />;
  return children;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public auth routes — redirect if already logged in */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === "author" ? "/dashboard" : "/feed"} replace />
            : <Login />
        }
      />
      <Route
        path="/signup"
        element={
          user
            ? <Navigate to={user.role === "author" ? "/dashboard" : "/feed"} replace />
            : <Signup />
        }
      />

      {/* Readers + Authors */}
      <Route
        path="/feed"
        element={<PrivateRoute><Home /></PrivateRoute>}
      />

      {/* Authors only */}
      <Route
        path="/dashboard"
        element={<AuthorRoute><Dashboard /></AuthorRoute>}
      />
      <Route
        path="/create"
        element={<AuthorRoute><CreatePost /></AuthorRoute>}
      />
      <Route
        path="/edit/:id"
        element={<AuthorRoute><EditPost /></AuthorRoute>}
      />

      {/* Blog detail - both roles */}
      <Route
        path="/blog/:slug"
        element={<PrivateRoute><BlogDetail /></PrivateRoute>}
      />

      {/* Profile - both roles */}
      <Route
        path="/profile"
        element={<PrivateRoute><Profile /></PrivateRoute>}
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={user ? (user.role === "author" ? "/dashboard" : "/feed") : "/login"}
            replace
          />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}