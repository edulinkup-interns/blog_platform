import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { createBlog } from "../api/api";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const CATEGORIES = ["Technology","Lifestyle","Travel","Food","Health","Business","Education","Entertainment","Sports","Other"];

const TINYMCE_KEY = "z2wlhik33yf4l6fx8gm772tw9ipxmijb01iaagdxguernzwx"; // replace with your free key from tiny.cloud

export default function CreatePost() {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [form, setForm] = useState({ title: "", category: "", tags: "", status: "draft" });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editorRef.current ? editorRef.current.getContent() : "";
    if (!form.title || !content || !form.category) {
      setError("Title, content and category are required.");
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title",    form.title);
      fd.append("content",  content);
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

        {error && <div className="auth-error" style={{ marginBottom: 20 }}><span>⚠</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="form-grid">

              <div className="form-field full">
                <label className="form-label">Title *</label>
                <input name="title" type="text" className="form-input" placeholder="Give your post a great title…" value={form.title} onChange={handleChange} />
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
                <input name="tags" type="text" className="form-input" placeholder="react, javascript (comma separated)" value={form.tags} onChange={handleChange} />
              </div>

              {/* ── TinyMCE rich text editor ── */}
              <div className="form-field full">
                <label className="form-label">Content *</label>
                <Editor
                  apiKey={TINYMCE_KEY}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue=""
                  init={{
                    height: 420,
                    menubar: false,
                    plugins: ["advlist","autolink","lists","link","image","charmap","preview","searchreplace","visualblocks","code","fullscreen","insertdatetime","media","table","code","help","wordcount"],
                    toolbar: "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat | help",
                    content_style: "body { font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.7; color: #0a0a0a; }",
                    skin: "oxide",
                    branding: false,
                    statusbar: false,
                    placeholder: "Start writing your post here…",
                  }}
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
                      <div className="image-upload-text"><strong>Click to upload</strong> or drag and drop</div>
                    </>
                  )}
                </div>
              </div>

              <div className="form-field full">
                <label className="form-label">Publish Status</label>
                <div className="status-toggle">
                  <div className={"status-opt" + (form.status === "draft" ? " selected" : "")} onClick={() => setForm((p) => ({ ...p, status: "draft" }))}>
                    <div className="status-opt-icon">📝</div>
                    <div className="status-opt-label">Draft</div>
                    <div className="status-opt-desc">Save privately</div>
                  </div>
                  <div className={"status-opt" + (form.status === "published" ? " selected" : "")} onClick={() => setForm((p) => ({ ...p, status: "published" }))}>
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