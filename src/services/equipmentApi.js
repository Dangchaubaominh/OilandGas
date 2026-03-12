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
    const url = "engineer/equipment";

    // Logic làm sạch params: chỉ gửi đi những filter có giá trị (khác null, undefined, "")
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

  /**
   * Lấy chi tiết một thiết bị
   * @param {string|number} id - Equipment ID
   */
  getEquipmentDetail(id) {
    const url = `/engineer/equipment/${id}`;
    return axiosClient.get(url);
  },

  /**
   * Lấy lịch sử bảo trì của thiết bị
   * @param {string|number} id - Equipment ID
   */
  getEquipmentMaintenanceHistory(id) {
    const url = `/engineer/equipment/${id}/maintenance-history`;
    return axiosClient.get(url);
  },

  /**
   * Tạo thiết bị mới (admin only)
   * @param {Object} data - Equipment data
   * @param {string} data.name - Equipment name
   * @param {string} data.type - Equipment type (drilling, pumping, safety, measurement, transportation, other)
   * @param {string} data.serial - Serial number
   * @param {string} data.model - Model name
   * @param {string} data.manufacturer - Manufacturer name
   * @param {string} data.location - Location
   * @param {string} [data.status] - Status (operational, maintenance, faulty)
   * @param {Object} [data.technicalSpecs] - Technical specifications
   * @param {string} [data.purchaseDate] - Purchase date
   * @param {string} [data.warrantyExpiry] - Warranty expiry date
   * @param {string} [data.nextScheduledMaintenance] - Next maintenance date
   * @param {number} [data.assignedTo] - Assigned engineer user ID
   */
  createEquipment(data) {
    const url = "/engineer/equipment";
    return axiosClient.post(url, data);
  },

  /**
   * Cập nhật thông tin thiết bị (admin/supervisor only)
   * @param {string|number} id - Equipment ID
   * @param {Object} data - Updated equipment data
   */
  updateEquipment(id, data) {
    const url = `/engineer/equipment/${id}`;
    return axiosClient.put(url, data);
  },

  /**
   * Xóa thiết bị (soft delete, admin only)
   * @param {string|number} id - Equipment ID
   */
  deleteEquipment(id) {
    const url = `/engineer/equipment/${id}`;
    return axiosClient.delete(url);
  },

  /**
   * Khôi phục thiết bị đã xóa (admin only)
   * @param {string|number} id - Equipment ID
   */
  restoreEquipment(id) {
    const url = `/engineer/equipment/${id}/restore`;
    return axiosClient.patch(url);
  },

  // --- Nhóm: Equipment Control ---

  /**
   * Xem thông tin điều khiển thiết bị (operational settings, alarms, current status, alerts)
   * @param {string|number} id - Equipment ID
   * @param {boolean} includeHistory - Bao gồm dữ liệu lịch sử điều khiển (mặc định: false)
   */
  getControlInformation(id, includeHistory = false) {
    const url = `/control/equipment/${id}`;
    return axiosClient.get(url, { params: { includeHistory } });
  },
};

export default equipmentApi;
