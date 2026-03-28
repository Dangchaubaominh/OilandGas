// src/services/adminInstrumentApi.js
import axiosClient from "./AxiosClient";

const adminInstrumentApi = {
  getStats() {
    return axiosClient.get("/engineer/instruments/stats");
  },

  // 1. Lấy danh sách tất cả instrument (admin)
  getAll(params) {
    const cleanParams = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ""
        ) {
          cleanParams[key] = params[key];
        }
      });
    }
    cleanParams._t = Date.now();
    return axiosClient.get("/admin/instruments", { params: cleanParams });
  },

  // 2. Lấy chi tiết một instrument
  getById(id) {
    return axiosClient.get(`/admin/instruments/${id}`);
  },

  // 3. Tạo mới instrument
  create(data) {
    return axiosClient.post("/admin/instruments", data);
  },

  // 4. Cập nhật instrument
  update(id, data) {
    return axiosClient.put(`/admin/instruments/${id}`, data);
  },

  // 5. Xóa mềm instrument
  delete(id) {
    return axiosClient.delete(`/admin/instruments/${id}`);
  },

  // 6. Gán engineer vào instrument
  assignEngineer(id, engineerId) {
    return axiosClient.post(`/admin/instruments/${id}/engineers`, {
      engineerId,
    });
  },

  // 7. Gỡ engineer khỏi instrument
  removeEngineer(id, engineerId) {
    return axiosClient.delete(
      `/admin/instruments/${id}/engineers/${engineerId}`,
    );
  },
};

export default adminInstrumentApi;
