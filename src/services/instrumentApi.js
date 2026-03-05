// src/services/instrumentApi.js
import axiosClient from "./AxiosClient";

const instrumentApi = {
  /**
   * 1. Lấy danh sách Instrument (có phân trang và lọc)
   */
  getInstrumentList(params) {
    const url = "api/engineer/instruments";

    // Logic làm sạch params: loại bỏ các filter rỗng để tránh lỗi Backend
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

    return axiosClient.get(url, { params: cleanParams });
  },

  /*** 2. Lấy thông tin chi tiết của một Instrument bằng ID
   */
  getInstrumentDetail(id) {
    const url = `api/engineer/instruments/${id}`;
    return axiosClient.get(url);
  },

  /**
   * 3. Lấy thông tin Instrument dành riêng cho 3D Simulator
   */
  getInstrument3DInfo(id) {
    const url = `api/engineer/instruments/${id}/info`;
    return axiosClient.get(url);
  },

  /**
   * 4. Đặt lịch bảo trì cho một Instrument
   */
  scheduleMaintenance(id, maintenanceData) {
    const url = `api/engineer/instruments/${id}/maintenance`;
    return axiosClient.post(url, maintenanceData);
  },
};

export default instrumentApi;
