// src/services/userApi.js
import axiosClient from "./AxiosClient";

const userApi = {
  // 1. Lấy tất cả active users
  getAllUsers() {
    const url = "/users";
    return axiosClient.get(url);
  },

  // 2. Tạo mới user
  createUser(data) {
    const url = "/users";
    return axiosClient.post(url, data);
  },

  // 3. Lấy tất cả user đã bị xóa (deleted users)
  getDeletedUsers() {
    const url = "/users/deleted";
    return axiosClient.get(url);
  },

  // 4. Lấy tất cả user (bao gồm cả active và inactive)
  getAllUsersMixed() {
    const url = "/users/all";
    return axiosClient.get(url);
  },

  // 5. Xóa mềm user theo ID (Soft delete)
  deleteUser(id) {
    const url = `/users/${id}/delete`;
    return axiosClient.delete(url);
  },

  // 6. Khôi phục user đã xóa theo ID
  restoreUser(id) {
    const url = `/users/${id}/restore`;
    return axiosClient.patch(url);
  },

  // 7. Cập nhật thông tin user theo ID (Admin only)
  updateUser(id, data) {
    const url = `/users/${id}`;
    return axiosClient.put(url, data);
  },

  // 8. Lấy thông tin cá nhân hiện tại
  getProfile() {
    const url = "/users/profile";
    return axiosClient.get(url);
  }

};

export default userApi;