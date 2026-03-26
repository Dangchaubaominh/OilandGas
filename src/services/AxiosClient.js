import axios from "axios";
import { showToast } from "../utils/toastHandler";

const axiosClient = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: "https://oil-gas-omega.vercel.app/api",
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

// Chiều về: Bắt lỗi 401 hoặc InvalidToken
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response && error.response.status === 401;
    const isInvalidToken =
      error.response?.data?.message?.includes("InvalidToken") ||
      error.response?.data?.message?.includes("invalid token") ||
      error.response?.data?.message?.includes("Token expired") ||
      error.response?.data?.error?.includes("InvalidToken");

    // Nếu hết hạn token (401) hoặc token không hợp lệ
    if (isUnauthorized || isInvalidToken) {
      showToast("error", "Session expired. Please log in again.");

      // Xóa hết token cũ
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Clear state và đá văng ra Login
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
export default axiosClient;
