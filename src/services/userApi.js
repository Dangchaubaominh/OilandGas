// src/api/authApi.js
import axiosClient from "./axiosClient";

const userApi = {
  // 1. Hàm Login thật
  getAllUsers() {
    const url = "api/users"; // Endpoint đăng nhập (Backend quy định)
    return axiosClient.get(url);
  },

  // 2. Hàm Register thật
  createUser(data) {
    const url = "api/users"; // Endpoint đăng ký (Backend quy định)
    return axiosClient.post(url, data);
  },

  // 3. Hàm lấy thông tin User (nếu cần)
  getMe() {
    const url = "auth/me";
    return axiosClient.get(url);
  },
};

export default userApi;