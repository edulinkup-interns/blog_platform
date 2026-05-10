import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleBlog, likeBlog, addComment, deleteComment } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/feed.css";

function calcReadingTime(content) {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: "currentColor", fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: "currentColor", fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function initials(name) {
  return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comment, setComment]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
  const commentRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await getSingleBlog(slug);
        setBlog(data);
      } catch {
        showToast("Failed to load post", "error");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  const handleLike = async () => {
    if (likeLoading) return;
    try {
      setLikeLoading(true);
      await likeBlog(blog._id);
      const alreadyLiked = blog.likes?.includes(user?.id);
      setBlog((prev) => ({
        ...prev,
        likes: alreadyLiked
          ? prev.likes.filter((id) => id !== user?.id)
          : [...(prev.likes || []), user?.id],
      }));
    } catch {
      showToast("Failed to like post", "error");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      const { data } = await addComment(blog._id, { text: comment.trim() });
      setBlog((prev) => ({ ...prev, comments: data.comments }));
      setComment("");
    } catch {
      showToast("Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await deleteComment(blog._id, commentId);
      setBlog((prev) => ({ ...prev, comments: data.comments }));
      showToast("Comment deleted");
    } catch {
      showToast("Failed to delete comment", "error");
    }
  };

  const liked = blog?.likes?.includes(user?.id);

  if (loading) return (
    <div className="detail-wrapper">
      <Navbar />
      <div className="detail-content">
        <div className="skeleton-card">
          <div style={{ padding: 20 }}>
            <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 24, width: "80%", marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 14, width: "100%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "70%" }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!blog) return (
    <div className="detail-wrapper">
      <Navbar />
      <div className="detail-content">
        <div className="empty-state">
          <div className="empty-icon">😕</div>
          <h3>Post not found</h3>
          <p>It may have been deleted or moved.</p>
          <button className="btn-primary" onClick={() => navigate("/feed")}>Back to Feed</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="detail-wrapper">
      <Navbar />
      <div className="detail-content">

        <button className="detail-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* ── main post card ── */}
        <div className="detail-card">

          {/* author row */}
          <div className="detail-card-header">
            <div className="detail-author">
              <div className="detail-avatar">{initials(blog.author?.name)}</div>
              <div>
                <div className="detail-author-name">{blog.author?.name || "Unknown"}</div>
                <div className="detail-author-meta">
                  {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  &nbsp;·&nbsp;{blog.category}
                  &nbsp;·&nbsp;{calcReadingTime(blog.content)} min read
                </div>
              </div>
            </div>
            <span className={"status-badge " + blog.status}>{blog.status}</span>
          </div>

          {/* hero image */}
          {blog.featuredImage ? (
            <img
              className="detail-hero"
              src={"http://localhost:5001/uploads/" + blog.featuredImage}
              alt={blog.title}
            />
          ) : (
            <div className="detail-hero-placeholder">{blog.title}</div>
          )}

          {/* body */}
          <div className="detail-body">
            <div className="detail-category">{blog.category}</div>
            <h1 className="detail-title">{blog.title}</h1>
            <div
  className="detail-text"
  dangerouslySetInnerHTML={{ __html: blog.content }}
/>

            {blog.tags?.length > 0 && (
              <div className="detail-tags">
                {blog.tags.map((tag) => (
                  <span className="card-tag" key={tag}>#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* actions */}
          <div className="detail-actions">
            <button
              className={"card-action-btn" + (liked ? " liked" : "")}
              onClick={handleLike}
              disabled={likeLoading}
              style={{ fontSize: 14 }}
            >
              <HeartIcon />
              {blog.likes?.length || 0} {blog.likes?.length === 1 ? "like" : "likes"}
            </button>

            <button
              className="card-action-btn"
              onClick={() => commentRef.current?.focus()}
              style={{ fontSize: 14 }}
            >
              <CommentIcon />
              {blog.comments?.length || 0} {blog.comments?.length === 1 ? "comment" : "comments"}
            </button>
          </div>
        </div>

        {/* ── comments ── */}
        <div className="comments-card">
          <div className="comments-header">
            Comments ({blog.comments?.length || 0})
          </div>

          {/* add comment */}
          <div className="comment-form">
            <div className="comment-form-avatar">{initials(user?.name)}</div>
            <div className="comment-input-wrap">
              <textarea
                ref={commentRef}
                className="comment-input"
                placeholder="Write a comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <button
                className="comment-submit"
                onClick={handleComment}
                disabled={submitting || !comment.trim()}
              >
                {submitting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>

          {/* comment list */}
          <div className="comment-list">
            {blog.comments?.length === 0 ? (
              <div className="no-comments">No comments yet. Be the first to comment!</div>
            ) : (
              [...(blog.comments || [])].reverse().map((c) => (
                <div className="comment-item" key={c._id}>
                  <div className="comment-avatar">{initials(c.user?.name)}</div>
                  <div className="comment-body">
                    <div className="comment-meta">
                      <span className="comment-author">{c.user?.name || "User"}</span>
                      <span className="comment-time">{timeAgo(c.createdAt)}</span>
                    </div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                  {(c.user?._id === user?.id || c.user === user?.id) && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {toast && <div className={"toast " + toast.type}>{toast.msg}</div>}
    </div>
  );
}