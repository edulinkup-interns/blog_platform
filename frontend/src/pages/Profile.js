import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, getBlogs } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/profile.css";
import "../styles/dashboard.css";

function initials(name) {
  return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
}

export default function Profile() {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const [form, setForm] = useState({
    name: "", bio: "", currentPassword: "", newPassword: "",
  });
  const [avatarFile, setAvatarFile]   = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: prof } = await getProfile();
      setProfile(prof);
      setForm((p) => ({ ...p, name: prof.name || "", bio: prof.bio || "" }));
      if (prof.avatar) setAvatarPreview("http://localhost:5001/uploads/" + prof.avatar);

      if (user?.role === "author") {
        const { data: blogsData } = await getBlogs({ limit: 100 });
        const mine = blogsData.blogs.filter(
          (b) => b.author?._id === user?.id || b.author === user?.id
        );
        setPosts(mine);
      }
    } catch {
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    if (form.newPassword && form.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error"); return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("bio",  form.bio);
      if (form.currentPassword) fd.append("currentPassword", form.currentPassword);
      if (form.newPassword)     fd.append("newPassword",     form.newPassword);
      if (avatarFile)           fd.append("avatar",          avatarFile);

      const { data } = await updateProfile(fd);

      // update auth context so navbar reflects new name
      login(data.user, token);
      setProfile((p) => ({ ...p, ...data.user }));
      setForm((p) => ({ ...p, currentPassword: "", newPassword: "" }));
      showToast("Profile updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const totalLikes    = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  if (loading) return (
    <div className="profile-wrapper">
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>Loading…</div>
    </div>
  );

  return (
    <div className="profile-wrapper">
      <Navbar />
      <div className="profile-content">

        {/* ── profile card ── */}
        <div className="profile-card">
          <div className="profile-card-top">

            {/* avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" />
                  : initials(profile?.name)
                }
              </div>
              <label className="profile-avatar-edit" title="Change photo">
                ✏️
                <input type="file" accept="image/*" className="profile-avatar-input" onChange={handleAvatar} />
              </label>
            </div>

            {/* info */}
            <div className="profile-info">
              <div className="profile-name">{profile?.name}</div>
              <div className="profile-email">{profile?.email}</div>
              <div className="profile-role-badge">{profile?.role}</div>
              {profile?.bio
                ? <div className="profile-bio">"{profile.bio}"</div>
                : <div className="profile-bio-empty">No bio yet — add one below.</div>
              }
            </div>
          </div>

          {/* stats */}
          {user?.role === "author" && (
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{posts.length}</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{posts.filter((p) => p.status === "published").length}</span>
                <span className="profile-stat-label">Published</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{totalLikes}</span>
                <span className="profile-stat-label">Likes</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{totalComments}</span>
                <span className="profile-stat-label">Comments</span>
              </div>
            </div>
          )}
        </div>

        {/* ── edit form ── */}
        <div className="profile-edit-card">
          <div className="profile-edit-header">
            Edit Profile
          </div>
          <div className="profile-edit-body">
            <form onSubmit={handleSave}>

              <div className="profile-form-row">
                <div className="pf-field">
                  <label className="pf-label">Full Name</label>
                  <input name="name" className="pf-input" value={form.name} onChange={handleChange} placeholder="Your name" />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Email</label>
                  <input className="pf-input" value={profile?.email || ""} disabled />
                  <span className="pf-hint">Email cannot be changed</span>
                </div>
              </div>

              <div className="profile-form-row single">
                <div className="pf-field">
                  <label className="pf-label">Bio</label>
                  <textarea
                    name="bio" className="pf-textarea"
                    value={form.bio} onChange={handleChange}
                    placeholder="Tell readers a little about yourself… (max 300 chars)"
                    maxLength={300}
                  />
                  <span className="pf-hint">{form.bio.length}/300 characters</span>
                </div>
              </div>

              <hr className="profile-section-divider" />
              <div className="pf-label" style={{ marginBottom: 12 }}>Change Password (optional)</div>

              <div className="profile-form-row">
                <div className="pf-field">
                  <label className="pf-label">Current Password</label>
                  <input name="currentPassword" type="password" className="pf-input" value={form.currentPassword} onChange={handleChange} placeholder="••••••••" />
                </div>
                <div className="pf-field">
                  <label className="pf-label">New Password</label>
                  <input name="newPassword" type="password" className="pf-input" value={form.newPassword} onChange={handleChange} placeholder="Min. 6 characters" />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 8, paddingTop: 16 }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : null}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* ── posts grid (authors only) ── */}
        {user?.role === "author" && (
          <div className="profile-posts-card">
            <div className="profile-posts-header">
              Posts ({posts.length})
            </div>
            {posts.length === 0 ? (
              <div className="empty-state" style={{ border: "none" }}>
                <div className="empty-icon">📝</div>
                <h3>No posts yet</h3>
                <p>Your published posts will appear here.</p>
              </div>
            ) : (
              <div className="profile-posts-grid">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="profile-post-thumb"
                    onClick={() => navigate("/blog/" + post.slug)}
                  >
                    {post.featuredImage ? (
                      <img src={"http://localhost:5001/uploads/" + post.featuredImage} alt={post.title} />
                    ) : (
                      <div className="profile-post-thumb-placeholder">{post.title}</div>
                    )}
                    <div className="profile-post-overlay">
                      <span>❤ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {toast && <div className={"toast " + toast.type}>{toast.msg}</div>}
    </div>
  );
}