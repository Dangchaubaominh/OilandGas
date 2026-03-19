// src/services/equipmentApi.js
import axiosClient from "./AxiosClient";

const equipmentApi = {
  // 1. Lấy danh sách thiết bị (có phân trang và lọc)
  getEquipmentList(params = {}) {
    const url = "/engineer/equipment";
    return axiosClient.get(url, { params });
  },

  // 2. Lấy chi tiết một thiết bị
  getEquipmentDetail(id) {
    if (!id) throw new Error("Missing equipment id for detail");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/equipment/${safeId}`;
    return axiosClient.get(url);
  },

  // 3. Lấy lịch sử bảo trì của thiết bị
  getEquipmentMaintenanceHistory(id) {
    if (!id) throw new Error("Missing equipment id for maintenance history");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/equipment/${safeId}/maintenance-history`;
    return axiosClient.get(url);
  },

  // 4. Tạo thiết bị mới (admin only)
  createEquipment(data) {
    const url = "/engineer/equipment";
    return axiosClient.post(url, data);
  },

  // 5. Cập nhật thông tin thiết bị (admin/supervisor only)
  updateEquipment(id, data) {
    if (!id) throw new Error("Missing equipment id for update");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/equipment/${safeId}`;
    return axiosClient.put(url, data);
  },

  // 6. Xóa thiết bị (soft delete, admin only)
  deleteEquipment(id) {
    if (!id) throw new Error("Missing equipment id for delete");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/equipment/${safeId}`;
    return axiosClient.delete(url);
  },

  // 7. Khôi phục thiết bị đã xóa (admin only)
  restoreEquipment(id) {
    if (!id) throw new Error("Missing equipment id for restore");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/equipment/${safeId}/restore`;
    return axiosClient.patch(url);
  },

  // 8. Xem thông tin điều khiển thiết bị
  getControlInformation(id, includeHistory = false) {
    if (!id) throw new Error("Missing equipment id for control information");
    const safeId = encodeURIComponent(id);
    const url = `/control/equipment/${safeId}`;
    return axiosClient.get(url, { params: { includeHistory } });
  },
};

export default equipmentApi;
