import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await loginUser(form);
      login(data.user, data.token);
      if (data.user.role === "author") {
        navigate("/dashboard");
      } else {
        navigate("/feed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="brand-logo">
          <div className="brand-logo-dot"><span>I</span></div>
          <span className="brand-logo-name">Inkwell</span>
        </div>

        <div className="brand-mockup">
          <div className="mockup-header">
            <div className="mockup-avatar" />
            <div className="mockup-meta">
              <div className="mockup-name">Alex Rivera</div>
              <div className="mockup-time">2 hours ago</div>
            </div>
          </div>
          <div className="mockup-image">thoughts on paper</div>
          <div className="mockup-body">
            <div className="mockup-actions">
              <div className="mockup-action-btn" />
              <div className="mockup-action-btn" />
              <div className="mockup-action-btn" />
            </div>
            <div className="mockup-likes">142 likes</div>
            <div className="mockup-caption-line" />
            <div className="mockup-caption-line short" />
          </div>
        </div>

        <div className="brand-tagline">
          <h2>Where <em>stories</em><br />find their readers.</h2>
          <p>A platform for authors &amp; curious minds.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h1 className="auth-form-title">Welcome back.</h1>
          <p className="auth-form-subtitle">Sign in to continue reading &amp; writing.</p>

          {error && (
            <div className="auth-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`auth-input${error ? " error-input" : ""}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className={`auth-input${error ? " error-input" : ""}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>

    </div>
  );
}