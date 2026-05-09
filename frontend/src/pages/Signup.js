import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import "../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "reader",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      await registerUser(form);
      navigate("/login", { state: { registered: true } });
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
              <div className="mockup-name">Priya Nair</div>
              <div className="mockup-time">Just now</div>
            </div>
          </div>
          <div className="mockup-image">a new chapter</div>
          <div className="mockup-body">
            <div className="mockup-actions">
              <div className="mockup-action-btn" />
              <div className="mockup-action-btn" />
              <div className="mockup-action-btn" />
            </div>
            <div className="mockup-likes">38 likes</div>
            <div className="mockup-caption-line" />
            <div className="mockup-caption-line short" />
          </div>
        </div>

        <div className="brand-tagline">
          <h2>Join a world of <em>ideas</em><br />& storytelling.</h2>
          <p>Read, write, connect — all in one place.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h1 className="auth-form-title">Create account.</h1>
          <p className="auth-form-subtitle">Free forever. No spam, ever.</p>

          {error && (
            <div className="auth-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="auth-input"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
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
                className="auth-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {/* Role selector */}
            <div className="auth-field">
              <label>I want to…</label>
              <div className="role-selector">
                <div
                  className={`role-card${form.role === "reader" ? " selected" : ""}`}
                  onClick={() => handleRole("reader")}
                >
                  <div className="role-icon">📖</div>
                  <div className="role-label">Read</div>
                  <div className="role-desc">Discover &amp; enjoy blogs</div>
                </div>
                <div
                  className={`role-card${form.role === "author" ? " selected" : ""}`}
                  onClick={() => handleRole("author")}
                >
                  <div className="role-icon">✍️</div>
                  <div className="role-label">Write</div>
                  <div className="role-desc">Publish your stories</div>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

    </div>
  );
}