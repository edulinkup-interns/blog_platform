import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBlog } from "../api/api";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const CATEGORIES = ["Technology","Lifestyle","Travel","Food","Health","Business","Education","Entertainment","Sports","Other"];

export default function CreatePost() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", content: "", category: "", tags: "", status: "draft",
  });
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.category) {
      setError("Title, content and category are required.");
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title",    form.title);
      fd.append("content",  form.content);
      fd.append("category", form.category);
      fd.append("status",   form.status);
      if (form.tags) {
        form.tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => fd.append("tags", t));
      }
      if (image) fd.append("featuredImage", image);
      await createBlog(fd);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">

        <div className="page-header">
          <div className="page-header-left">
            <h1>New Post</h1>
            <p>Write something worth reading.</p>
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
                  placeholder="Give your post a great title…"
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
                  placeholder="react, javascript, webdev  (comma separated)"
                  value={form.tags} onChange={handleChange}
                />
              </div>

              <div className="form-field full">
                <label className="form-label">Content *</label>
                <textarea
                  name="content" className="form-textarea"
                  placeholder="Start writing your post here…"
                  value={form.content} onChange={handleChange}
                />
              </div>

              <div className="form-field full">
                <label className="form-label">Featured Image</label>
                <div className="image-upload-area">
                  <input type="file" accept="image/*" onChange={handleImage} />
                  {preview ? (
                    <img src={preview} alt="preview" className="image-preview" />
                  ) : (
                    <>
                      <div className="image-upload-icon">🖼</div>
                      <div className="image-upload-text">
                        <strong>Click to upload</strong> or drag and drop
                      </div>
                    </>
                  )}
                </div>
              </div>

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
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {loading ? "Publishing…" : (form.status === "published" ? "Publish Post" : "Save Draft")}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}