// src/api/visual3DApi.js
import axiosClient from "./AxiosClient";

const visual3DApi = {
  // --- 3D Visualization Section ---
  // Hiển thị mô hình với các quyền điều khiển Zoom/Rotate/Lighting
  visualizeInstrument(id) {
    const url = `api/3d/instruments/${id}/visualize`;
    return axiosClient.get(url);
  },

  // Cập nhật cài đặt hiển thị 3D
  updateVisualizationSettings(id, settings) {
    const url = `api/3d/instruments/${id}/settings`;
    return axiosClient.put(url, settings);
  },

  // Ghi lại dữ liệu phiên đào tạo (Training session)
  recordTrainingSession(id, data) {
    const url = `api/3d/instruments/${id}/training`;
    return axiosClient.post(url, data);
  },

  // --- 3D Model Management Section ---
  // Upload file mô hình 3D cho thiết bị
  upload3DModel(id, fileData) {
    const url = `api/3d/instruments/${id}/upload`;
    // Thường dùng FormData nếu upload file trực tiếp
    return axiosClient.post(url, fileData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Lấy trạng thái xử lý của mô hình 3D (Processing status)
  getModelProcessingStatus(id) {
    const url = `api/3d/instruments/${id}/status`;
    return axiosClient.get(url);
  },

  // Lấy cấu hình load mô hình cho Frontend
  getModelConfig(id) {
    const url = `api/3d/instruments/${id}/config`;
    return axiosClient.get(url);
  },
};

export default visual3DApi;
