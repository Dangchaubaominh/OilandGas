// src/api/authApi.js
import axiosClient from "./axiosClient";

const authApi = {
  // 1. Hàm Login thật
  login(data) {
    const url = "api/auth/login"; // Endpoint đăng nhập (Backend quy định)
    return axiosClient.post(url, data);
  },

  // 2. Hàm Register thật
  register(data) {
    const url = "auth/register";
    return axiosClient.post(url, data);
  },

  // 3. Hàm lấy thông tin User (nếu cần)
  getMe() {
    const url = "auth/me";
    return axiosClient.get(url);
  },
};

export default authApi;