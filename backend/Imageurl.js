const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/api", "")
  : "http://localhost:5001";

export const getImageUrl = (filename) => {
  if (!filename) return null;
  // if already a full URL, return as-is
  if (filename.startsWith("http")) return filename;
  return `${BASE_URL}/uploads/${filename}`;
};