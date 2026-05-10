import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="navbar">
      <Link to={user?.role === "author" ? "/dashboard" : "/feed"} className="navbar-logo">
        <div className="navbar-logo-dot">I</div>
        <span className="navbar-logo-name">Inkwell</span>
      </Link>

      <div className="navbar-right">
        {user?.role === "author" ? (
          <>
            <Link to="/dashboard" className={"navbar-link" + (location.pathname === "/dashboard" ? " active" : "")}>Dashboard</Link>
            <Link to="/feed"      className={"navbar-link" + (location.pathname === "/feed"      ? " active" : "")}>Feed</Link>
            <Link to="/create"    className="navbar-btn">+ New Post</Link>
          </>
        ) : (
          <Link to="/feed" className={"navbar-link" + (location.pathname === "/feed" ? " active" : "")}>Feed</Link>
        )}

        {/* avatar → profile page */}
        <Link to="/profile" title={user?.name} style={{ textDecoration: "none" }}>
          <div className="navbar-avatar">{initials}</div>
        </Link>

        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}