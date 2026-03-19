// src/services/userApi.js
import axiosClient from "./AxiosClient";

const userApi = {
  // 1. Lấy tất cả active users
  getActiveUsers(params = {}) {
    const url = "/users";
    return axiosClient.get(url, { params });
  },

  // 2. Tạo mới user
  createUser(data) {
    const url = "/users";
    return axiosClient.post(url, data);
  },

  // 3. Lấy tất cả user đã bị xóa (deleted users)
  getUsersDeleted(params = {}) {
    const url = "/users/deleted";
    return axiosClient.get(url, { params });
  },

  // 4. Lấy tất cả user (bao gồm cả active và inactive)
  getUsersAll(params = {}) {
    const url = "/users/all";
    return axiosClient.get(url, { params });
  },

  // 5. Xóa mềm user theo ID (Soft delete)
  deleteUser(id) {
    if (!id) throw new Error("Missing user id for delete");
    const safeId = encodeURIComponent(id);
    const url = `/users/${safeId}/delete`;
    return axiosClient.delete(url);
  },

  // 6. Khôi phục user đã xóa theo ID
  restoreUser(id) {
    if (!id) throw new Error("Missing user id for restore");
    const safeId = encodeURIComponent(id);
    const url = `/users/${safeId}/restore`;
    return axiosClient.patch(url, {});
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
  },
};

export default userApi;
