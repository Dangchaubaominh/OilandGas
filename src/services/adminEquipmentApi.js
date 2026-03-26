// src/services/adminEquipmentApi.js
import axiosClient from "./AxiosClient";

const adminEquipmentApi = {
  // 0. Lấy thống kê
  getStats() {
    return axiosClient.get("/admin/equipment/stats");
  },

  // 1. Lấy danh sách tất cả equipment (admin)
  getAll(params) {
    const cleanParams = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
          cleanParams[key] = params[key];
        }
      });
    }
    cleanParams._t = Date.now();
    cleanParams._t = Date.now();
    return axiosClient.get("/admin/equipment", { params: cleanParams });
  },

  // 2. Lấy chi tiết một equipment
  getById(id) {
    return axiosClient.get(`/admin/equipment/${id}`);
  },

  // 3. Tạo mới equipment
  create(data) {
    return axiosClient.post("/admin/equipment", data);
  },

  // 4. Cập nhật equipment
  update(id, data) {
    return axiosClient.put(`/admin/equipment/${id}`, data);
  },

  // 5. Xóa mềm equipment
  delete(id) {
    return axiosClient.delete(`/admin/equipment/${id}`);
  },

  // 6. Lấy lịch sử bảo trì của equipment
  getMaintenanceHistory(id) {
    return axiosClient.get(`/admin/equipment/${id}/maintenance-history`);
  },
};

export default adminEquipmentApi;
