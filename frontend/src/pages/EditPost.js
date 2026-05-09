import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSingleBlog, updateBlog, getBlogs } from "../api/api";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const CATEGORIES = ["Technology","Lifestyle","Travel","Food","Health","Business","Education","Entertainment","Sports","Other"];

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", content: "", category: "", tags: "", status: "draft",
  });
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // We have the id but getSingleBlog needs a slug.
        // So fetch all blogs and find by id.
        const { data } = await getBlogs({ limit: 100 });
        const post = data.blogs.find((b) => b._id === id);
        if (!post) { setError("Post not found."); return; }
        setForm({
          title:    post.title    || "",
          content:  post.content  || "",
          category: post.category || "",
          tags:     (post.tags || []).join(", "),
          status:   post.status   || "draft",
        });
        if (post.featuredImage) setExistingImage("http://localhost:5001/uploads/" + post.featuredImage);
      } catch {
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.category) {
      setError("Title, content and category are required.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title:    form.title,
        content:  form.content,
        category: form.category,
        status:   form.status,
        tags:     form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      await updateBlog(id, payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>Loading…</div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">

        <div className="page-header">
          <div className="page-header-left">
            <h1>Edit Post</h1>
            <p>Make your changes and save.</p>
          </div>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: "20px" }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="form-grid">

              <div className="form-field full">
                <label className="form-label">Title *</label>
                <input
                  name="title" type="text" className="form-input"
                  placeholder="Post title…"
                  value={form.title} onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Tags</label>
                <input
                  name="tags" type="text" className="form-input"
                  placeholder="react, javascript (comma separated)"
                  value={form.tags} onChange={handleChange}
                />
              </div>

              <div className="form-field full">
                <label className="form-label">Content *</label>
                <textarea
                  name="content" className="form-textarea"
                  placeholder="Your post content…"
                  value={form.content} onChange={handleChange}
                />
              </div>

              {existingImage && (
                <div className="form-field full">
                  <label className="form-label">Current Image</label>
                  <img src={existingImage} alt="current" className="image-preview" style={{ marginTop: 0 }} />
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                    Image editing not supported — delete and recreate the post to change it.
                  </p>
                </div>
              )}

              <div className="form-field full">
                <label className="form-label">Publish Status</label>
                <div className="status-toggle">
                  <div
                    className={"status-opt" + (form.status === "draft" ? " selected" : "")}
                    onClick={() => setForm((p) => ({ ...p, status: "draft" }))}
                  >
                    <div className="status-opt-icon">📝</div>
                    <div className="status-opt-label">Draft</div>
                    <div className="status-opt-desc">Save privately</div>
                  </div>
                  <div
                    className={"status-opt" + (form.status === "published" ? " selected" : "")}
                    onClick={() => setForm((p) => ({ ...p, status: "published" }))}
                  >
                    <div className="status-opt-icon">🌐</div>
                    <div className="status-opt-label">Published</div>
                    <div className="status-opt-desc">Visible to everyone</div>
                  </div>
                </div>
              </div>

            </div>

            <div className="form-actions">
              <Link to="/dashboard" className="btn-secondary">Cancel</Link>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : null}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}