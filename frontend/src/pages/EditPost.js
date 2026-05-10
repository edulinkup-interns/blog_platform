import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { updateBlog, getBlogs } from "../api/api";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const CATEGORIES = ["Technology","Lifestyle","Travel","Food","Health","Business","Education","Entertainment","Sports","Other"];
const TINYMCE_KEY = "z2wlhik33yf4l6fx8gm772tw9ipxmijb01iaagdxguernzwx"; // replace with your free key from tiny.cloud

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [form, setForm]           = useState({ title: "", category: "", tags: "", status: "draft" });
  const [initialContent, setInitialContent] = useState("");
  const [existingImage, setExistingImage]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await getBlogs({ limit: 100 });
        const post = data.blogs.find((b) => b._id === id);
        if (!post) { setError("Post not found."); return; }
        setForm({
          title:    post.title    || "",
          category: post.category || "",
          tags:     (post.tags || []).join(", "),
          status:   post.status   || "draft",
        });
        setInitialContent(post.content || "");
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
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editorRef.current ? editorRef.current.getContent() : initialContent;
    if (!form.title || !content || !form.category) {
      setError("Title, content and category are required.");
      return;
    }
    try {
      setSaving(true);
      await updateBlog(id, {
        title:    form.title,
        content,
        category: form.category,
        status:   form.status,
        tags:     form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
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

        {error && <div className="auth-error" style={{ marginBottom: 20 }}><span>⚠</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="form-grid">

              <div className="form-field full">
                <label className="form-label">Title *</label>
                <input name="title" type="text" className="form-input" placeholder="Post title…" value={form.title} onChange={handleChange} />
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

              {/* ── TinyMCE ── */}
              <div className="form-field full">
                <label className="form-label">Content *</label>
                {initialContent !== "" || !loading ? (
                  <Editor
                    apiKey={TINYMCE_KEY}
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    initialValue={initialContent}
                    init={{
                      height: 420,
                      menubar: false,
                      plugins: ["advlist","autolink","lists","link","image","charmap","preview","searchreplace","visualblocks","code","fullscreen","insertdatetime","media","table","code","help","wordcount"],
                      toolbar: "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat | help",
                      content_style: "body { font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.7; color: #0a0a0a; }",
                      skin: "oxide",
                      branding: false,
                      statusbar: false,
                    }}
                  />
                ) : null}
              </div>

              {existingImage && (
                <div className="form-field full">
                  <label className="form-label">Current Image</label>
                  <img src={existingImage} alt="current" className="image-preview" style={{ marginTop: 0 }} />
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>To change image, delete and recreate the post.</p>
                </div>
              )}

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