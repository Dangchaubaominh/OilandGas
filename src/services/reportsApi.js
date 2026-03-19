import axiosClient from "./AxiosClient";

const reportsApi = {
  // 1. Lấy danh sách reports với filtering, sorting, và pagination
  getReports(params = {}) {
    const url = "/engineer/reports";
    return axiosClient.get(url, { params });
  },

  // 2. Tạo mới technical report
  generateReport(data) {
    const url = "/engineer/reports";
    return axiosClient.post(url, data);
  },

  // 3. Kiểm tra trạng thái tạo report
  getReportStatus(id) {
    if (!id) throw new Error("Missing report id");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/reports/${safeId}/status`;
    return axiosClient.get(url);
  },

  // 4. Tải xuống file report
  downloadReport(id) {
    if (!id) throw new Error("Missing report id");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/reports/${safeId}/download`;
    return axiosClient.get(url, { responseType: "blob" });
  },

  // 5. Xóa mềm report theo ID
  deleteReport(id) {
    if (!id) throw new Error("Missing report id");
    const safeId = encodeURIComponent(id);
    const url = `/engineer/reports/${safeId}`;
    return axiosClient.delete(url);
  },
};

export default reportsApi;
