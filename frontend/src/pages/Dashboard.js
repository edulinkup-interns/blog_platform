import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBlogs, deleteBlog } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getBlogs({ limit: 100 });
      const mine = data.blogs.filter(
        (b) => b.author?._id === user?.id || b.author === user?.id
      );
      setPosts(mine);
    } catch {
      showToast("Failed to load posts", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteBlog(deleteTarget._id);
      setPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      showToast("Post deleted successfully");
    } catch {
      showToast("Failed to delete post", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const totalPosts     = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const totalLikes     = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments  = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">

        <div className="page-header">
          <div className="page-header-left">
            <h1>Your Dashboard</h1>
            <p>Welcome back, {user?.name?.split(" ")[0]} 👋</p>
          </div>
          <Link to="/create" className="navbar-btn" style={{ textDecoration: "none" }}>
            + New Post
          </Link>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Total Posts</span>
            <span className="stat-value">{totalPosts}</span>
            <span className="stat-sub">{publishedPosts} published</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Likes</span>
            <span className="stat-value">{totalLikes}</span>
            <span className="stat-sub">across all posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Comments</span>
            <span className="stat-value">{totalComments}</span>
            <span className="stat-sub">from readers</span>
          </div>
        </div>

        <div className="section-title">Your Posts</div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✍️</div>
            <h3>No posts yet</h3>
            <p>Start writing and share your ideas with the world.</p>
            <Link to="/create" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
              + Write your first post
            </Link>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post, i) => (
              <div className="post-item" key={post._id} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="post-item-img">
                  {post.featuredImage ? (
                    <img src={`http://localhost:5001/uploads/${post.featuredImage}`} alt={post.title} />
                  ) : "📝"}
                </div>
                <div className="post-item-body">
                  <div className="post-item-title">{post.title}</div>
                  <div className="post-item-meta">
                    <span className={"status-badge " + post.status}>{post.status}</span>
                    <span>{post.category}</span>
                    <span>❤ {post.likes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="post-item-actions">
                  <button className="action-btn" onClick={() => navigate("/edit/" + post._id)}>Edit</button>
                  <button className="action-btn danger" onClick={() => setDeleteTarget(post)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete post?</h3>
            <p>"<strong>{deleteTarget.title}</strong>" will be permanently deleted. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="modal-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={"toast " + toast.type}>{toast.msg}</div>}
    </div>
  );
}