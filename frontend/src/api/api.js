import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Attach token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── AUTH ─────────────────────────────────────────────
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser    = (data) => API.post("/auth/login", data);

// ─── BLOGS ────────────────────────────────────────────
export const getBlogs      = (params)     => API.get("/blogs", { params });
export const getSingleBlog = (slug)       => API.get(`/blogs/${slug}`);
export const createBlog    = (data)       => API.post("/blogs", data);
export const updateBlog    = (id, data)   => API.put(`/blogs/${id}`, data);
export const deleteBlog    = (id)         => API.delete(`/blogs/${id}`);

// ─── SOCIAL ───────────────────────────────────────────
export const likeBlog      = (id)                    => API.put(`/blogs/like/${id}`);
export const addComment    = (id, data)              => API.post(`/blogs/comment/${id}`, data);
export const deleteComment = (blogId, commentId)     => API.delete(`/blogs/comment/${blogId}/${commentId}`);

export default API;