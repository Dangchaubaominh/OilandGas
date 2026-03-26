// src/services/maintenanceApi.js
import axiosClient from "./AxiosClient";

const maintenanceApi = {
  // 1. Stats: total / thisWeek / overdue / completed
  getStats() {
    return axiosClient.get("/admin/maintenance/stats");
  },

  // 2. Lấy danh sách (hỗ trợ dateFrom, dateTo, status, type, priority, page, limit)
  getAll(params) {
    const cleanParams = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
          cleanParams[key] = params[key];
        }
      });
    }
    return axiosClient.get("/admin/maintenance", { params: cleanParams });
  },

  // 3. Chi tiết theo ID
  getById(id) {
    return axiosClient.get(`/admin/maintenance/${id}`);
  },

  // 4. Theo equipment/instrument ID
  getByTargetId(targetId) {
    return axiosClient.get(`/admin/maintenance/target/${targetId}`);
  },

  // 5. Tạo mới
  create(data) {
    return axiosClient.post("/admin/maintenance", data);
  },

  // 6. Cập nhật
  update(id, data) {
    return axiosClient.put(`/admin/maintenance/${id}`, data);
  },

  // 7. Xoá mềm
  delete(id) {
    return axiosClient.delete(`/admin/maintenance/${id}`);
  },
};

export default maintenanceApi;
