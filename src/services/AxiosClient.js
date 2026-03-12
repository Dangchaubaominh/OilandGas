import axios from "axios";

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

export default axiosClient;
