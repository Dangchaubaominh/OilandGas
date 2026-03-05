// src/services/equipmentApi.js
import axiosClient from "./AxiosClient";

const equipmentApi = {
  // --- Nhóm: Engineer Equipment ---

  /**
   * Lấy danh sách thiết bị (có phân trang và lọc)
   * Yêu cầu quyền: view:equipment
   * @param {Object} params - { name, type, status, location, page, limit }
   */
  getEquipmentList(params) {
    const url = "api/engineer/equipment";
    
    // Logic làm sạch params: chỉ gửi đi những filter có giá trị (khác null, undefined, "")
    const cleanParams = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
          cleanParams[key] = params[key];
        }
      });
    }

    return axiosClient.get(url, { params: cleanParams });
  },

  /**
   * Lấy chi tiết một thiết bị
   * @param {string|number} id - Equipment ID
   */
  getEquipmentDetail(id) {
    const url = `api/engineer/equipment/${id}`;
    return axiosClient.get(url);
  },

  /**
   * Lấy lịch sử bảo trì của thiết bị
   * @param {string|number} id - Equipment ID
   */
  getEquipmentMaintenanceHistory(id) {
    const url = `api/engineer/equipment/${id}/maintenance-history`;
    return axiosClient.get(url);
  },


  // --- Nhóm: Equipment Control ---

  /**
   * Xem thông tin điều khiển thiết bị (operational settings, alarms, current status, alerts)
   * @param {string|number} id - Equipment ID
   * @param {boolean} includeHistory - Bao gồm dữ liệu lịch sử điều khiển (mặc định: false)
   */
  getControlInformation(id, includeHistory = false) {
    const url = `api/control/equipment/${id}`;
    return axiosClient.get(url, { params: { includeHistory } });
  },
};

export default equipmentApi;