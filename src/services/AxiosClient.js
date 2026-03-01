import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://oil-gas-omega.vercel.app", // Không có /api-docs/ ở cuối
  headers: { "Content-Type": "application/json" },
});

// Thêm interceptor để tự động đính kèm Token (nếu có)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
