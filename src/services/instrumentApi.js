// src/services/instrumentApi.js
import axiosClient from "./AxiosClient";

const ADMIN_INSTRUMENTS_URL = "/admin/instruments";
const ENGINEER_INSTRUMENTS_URL = "/engineer/instruments";

const removeEmptyParams = (params = {}) => {
  const cleanParams = {};

  Object.keys(params).forEach((key) => {
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== ""
    ) {
      cleanParams[key] = params[key];
    }
  });

  return cleanParams;
};

const instrumentApi = {
  /**
   * 1. Lấy danh sách Instrument cho Admin (có phân trang và lọc)
   */
  getInstrumentList(params) {
    return axiosClient.get(ADMIN_INSTRUMENTS_URL, {
      params: removeEmptyParams(params),
    });
  },

  /**
   * 2. Lấy thông tin chi tiết của một Instrument bằng ID (Admin)
   */
  getInstrumentDetail(id) {
    const url = `${ADMIN_INSTRUMENTS_URL}/${id}`;
    return axiosClient.get(url);
  },

  /**
   * 3. Lấy thông tin Instrument dành riêng cho 3D Simulator (Engineer endpoint)
   */
  getInstrument3DInfo(id) {
    const url = `${ENGINEER_INSTRUMENTS_URL}/${id}/info`;
    return axiosClient.get(url);
  },

  /**
   * 4. Đặt lịch bảo trì cho một Instrument (Engineer endpoint)
   */
  scheduleMaintenance(id, maintenanceData) {
    const url = `${ENGINEER_INSTRUMENTS_URL}/${id}/maintenance`;
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
    return axiosClient.post(ADMIN_INSTRUMENTS_URL, data);
  },

  /**
   * 6. Cập nhật thông tin Instrument (admin/supervisor only)
   * @param {string|number} id - Instrument ID
   * @param {Object} data - Updated instrument data
   */
  updateInstrument(id, data) {
    const url = `${ADMIN_INSTRUMENTS_URL}/${id}`;
    return axiosClient.put(url, data);
  },

  /**
   * 7. Xóa Instrument (admin only)
   * @param {string|number} id - Instrument ID
   */
  deleteInstrument(id) {
    const url = `${ADMIN_INSTRUMENTS_URL}/${id}`;
    return axiosClient.delete(url);
  },

  /**
   * 8. Gán Engineer vào Instrument (admin only)
   * @param {string|number} id - Instrument ID
   * @param {Object} payload - Assignment payload
   * @param {string} payload.engineerId - Engineer ID
   * @param {string} [payload.assignmentRole] - Assignment role
   */
  assignEngineer(id, payload) {
    const url = `${ADMIN_INSTRUMENTS_URL}/${id}/assign-engineer`;
    return axiosClient.post(url, payload);
  },

  /**
   * 9. Gỡ Engineer khỏi Instrument (admin only)
   * @param {string|number} id - Instrument ID
   * @param {Object} payload - Remove payload
   * @param {string} payload.engineerId - Engineer ID
   */
  removeEngineer(id, payload) {
    const url = `${ADMIN_INSTRUMENTS_URL}/${id}/remove-engineer`;
    return axiosClient.post(url, payload);
  },
};

export default instrumentApi;
