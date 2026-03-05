// src/services/userApi.js
import axiosClient from "./AxiosClient";

const userApi = {
  // 1. Lấy tất cả active users
  getAllUsers(params = {}) {
    const url = "api/users";
    return axiosClient.get(url, { params });
  },

  // 2. Tạo mới user
  createUser(data) {
    const url = "api/users";
    return axiosClient.post(url, data);
  },

  // 3. Lấy tất cả user đã bị xóa (deleted users)
  getDeletedUsers(params = {}) {
    const url = "api/users/deleted";
    return axiosClient.get(url, { params });
  },

  // 4. Lấy tất cả user (bao gồm cả active và inactive)
  getAllUsersMixed(params = {}) {
    const url = "api/users/all";
    return axiosClient.get(url, { params });
  },

  // 5. Xóa mềm user theo ID (Soft delete)
  deleteUser(id) {
    const url = `api/users/${id}/delete`;
    return axiosClient.delete(url);
  },

  // 6. Khôi phục user đã xóa theo ID
  restoreUser(id) {
    const url = `api/users/${id}/restore`;
    return axiosClient.patch(url);
  },

  // 7. Cập nhật thông tin user theo ID (Admin only)
  updateUser(id, data) {
    const url = `api/users/${id}`;
    return axiosClient.put(url, data);
  },

  // 8. Lấy thông tin cá nhân hiện tại
};

export default userApi;
