// src/services/instrumentApi.js
import axiosClient from "./AxiosClient";

const instrumentApi = {
  /**
   * 1. Lấy danh sách Instrument (có phân trang và lọc)
   */
  getInstrumentList(params) {
    const url = "/engineer/instruments";

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
    const url = `/engineer/instruments/${id}`;
    return axiosClient.get(url);
  },

  /**
   * 3. Lấy thông tin Instrument dành riêng cho 3D Simulator
   */
  getInstrument3DInfo(id) {
    const url = `/engineer/instruments/${id}/info`;
    return axiosClient.get(url);
  },

  /**
   * 4. Đặt lịch bảo trì cho một Instrument
   */
  scheduleMaintenance(id, maintenanceData) {
    const url = `/engineer/instruments/${id}/maintenance`;
    return axiosClient.post(url, maintenanceData);
  },

  /**
   * 5. Tạo Instrument mới (admin only)
   * @param {Object} data - Instrument data
   * @param {string} data.name - Instrument name
   * @param {string} data.type - Type (pressure, temperature, flow, level, analytical, safety, control, monitoring, other)
   * @param {string} data.serial - Serial number
   * @param {string} data.model - Model name
   * @param {string} data.manufacturer - Manufacturer name
   * @param {string} data.location - Location
   * @param {string} [data.status] - Status (operational, maintenance, faulty)
   * @param {Object} [data.specifications] - Technical specifications
   * @param {Object} [data.operationalParameters] - Operational parameters
   * @param {string} [data.installationDate] - Installation date
   * @param {string} [data.warrantyExpiry] - Warranty expiry date
   */
  createInstrument(data) {
    const url = "/engineer/instruments";
    return axiosClient.post(url, data);
  },

  /**
   * 6. Cập nhật thông tin Instrument (admin/supervisor only)
   * @param {string|number} id - Instrument ID
   * @param {Object} data - Updated instrument data
   */
  updateInstrument(id, data) {
    const url = `/engineer/instruments/${id}`;
    return axiosClient.put(url, data);
  },

  /**
   * 7. Xóa Instrument (soft delete, admin only)
   * @param {string|number} id - Instrument ID
   */
  deleteInstrument(id) {
    const url = `/engineer/instruments/${id}`;
    return axiosClient.delete(url);
  },

  /**
   * 8. Khôi phục Instrument đã xóa (admin only)
   * @param {string|number} id - Instrument ID
   */
  restoreInstrument(id) {
    const url = `/engineer/instruments/${id}/restore`;
    return axiosClient.patch(url);
  },
};

export default instrumentApi;
