import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogs, likeBlog } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/feed.css";

const CATEGORIES = ["All","Technology","Lifestyle","Travel","Food","Health","Business","Education","Entertainment","Sports","Other"];

// strip HTML tags (TinyMCE saves HTML), count words, estimate at 200 wpm
function calcReadingTime(content) {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ padding: "14px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 10, width: "25%" }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9" }} />
      <div style={{ padding: "14px 16px" }}>
        <div className="skeleton" style={{ height: 16, width: "80%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 12, width: "100%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: "65%" }} />
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory]   = useState("All");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likeLoading, setLikeLoading] = useState({});

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 5 };
        if (search)              params.search   = search;
        if (category !== "All") params.category = category;
        const { data } = await getBlogs(params);
        setBlogs(data.blogs);
        setTotalPages(data.totalPages);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [search, category, page]);

  // search on Enter
  const handleSearchKey = (e) => {
    if (e.key === "Enter") { setSearch(searchInput); setPage(1); }
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleLike = async (blog) => {
    if (likeLoading[blog._id]) return;
    try {
      setLikeLoading((p) => ({ ...p, [blog._id]: true }));
      await likeBlog(blog._id);
      // optimistic toggle
      setBlogs((prev) =>
        prev.map((b) => {
          if (b._id !== blog._id) return b;
          const alreadyLiked = b.likes?.includes(user?.id);
          return {
            ...b,
            likes: alreadyLiked
              ? b.likes.filter((id) => id !== user?.id)
              : [...(b.likes || []), user?.id],
          };
        })
      );
    } catch {
      // silent
    } finally {
      setLikeLoading((p) => ({ ...p, [blog._id]: false }));
    }
  };

  const initials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="feed-wrapper">
      <Navbar />
      <div className="feed-content">

        {/* ── search ── */}
        <div className="feed-topbar">
          <div className="feed-search-wrap">
            <span className="feed-search-icon">🔍</span>
            <input
              className="feed-search"
              placeholder="Search posts… (press Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKey}
            />
          </div>
        </div>

        {/* ── category pills ── */}
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={"cat-pill" + (category === cat ? " active" : "")}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── blog cards ── */}
        {loading ? (
          [1,2,3].map((n) => <SkeletonCard key={n} />)
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No posts found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          blogs.map((blog, i) => {
            const liked = blog.likes?.includes(user?.id);
            return (
              <div className="blog-card" key={blog._id} style={{ animationDelay: i * 0.06 + "s" }}>

                {/* header */}
                <div className="card-header">
                  <div className="card-author">
                    <div className="card-avatar">{initials(blog.author?.name)}</div>
                    <div>
                      <div className="card-author-name">{blog.author?.name || "Unknown"}</div>
                      <div className="card-date">
                        {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {<span> · {calcReadingTime(blog.content)} min read</span>}
                      </div>
                    </div>
                  </div>
                  <span className="card-category-badge">{blog.category}</span>
                </div>

                {/* image */}
                {blog.featuredImage ? (
                  <img
                    className="card-image"
                    src={"http://localhost:5001/uploads/" + blog.featuredImage}
                    alt={blog.title}
                    onClick={() => navigate("/blog/" + blog.slug)}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <div
                    className="card-image-placeholder"
                    onClick={() => navigate("/blog/" + blog.slug)}
                    style={{ cursor: "pointer" }}
                  >
                    {blog.title}
                  </div>
                )}

                {/* body */}
                <div className="card-body">
                  <div className="card-title" onClick={() => navigate("/blog/" + blog.slug)}>
                    {blog.title}
                  </div>
                  <div className="card-excerpt">
                      <div
                         dangerouslySetInnerHTML={{
                             __html: blog.content || "",
                          }}
                       />
                  </div>
                  {blog.tags?.length > 0 && (
                    <div className="card-tags">
                      {blog.tags.slice(0, 4).map((tag) => (
                        <span className="card-tag" key={tag}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* actions */}
                <div className="card-actions">
                  <button
                    className={"card-action-btn" + (liked ? " liked" : "")}
                    onClick={() => handleLike(blog)}
                    disabled={likeLoading[blog._id]}
                  >
                    <HeartIcon />
                    {blog.likes?.length || 0}
                  </button>

                  <button
                    className="card-action-btn"
                    onClick={() => navigate("/blog/" + blog.slug)}
                  >
                    <CommentIcon />
                    {blog.comments?.length || 0}
                  </button>

                  <div className="card-spacer" />

                  <button
                    className="card-read-btn"
                    onClick={() => navigate("/blog/" + blog.slug)}
                  >
                    Read more
                  </button>
                </div>

              </div>
            );
          })
        )}

        {/* ── pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={"page-btn" + (page === p ? " active" : "")}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        )}

      </div>
    </div>
  );
}