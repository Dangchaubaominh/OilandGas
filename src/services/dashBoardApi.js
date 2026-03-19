// src/services/dashboardApi.js
import axiosClient from "./AxiosClient";

const dashboardApi = {
  // 1. Get general dashboard statistics
  getDashboard(params = {}) {
    const url = "admin/dashboard";
    return axiosClient.get(url, { params });
  },

  // 2. Get oil output data from instruments
  getOilOutput(params = {}) {
    const url = "admin/dashboard/oil-output";
    return axiosClient.get(url, { params });
  },

  // 3. Get audit logs (paginated)
  getAuditLogs(params = {}) {
    const url = "admin/audit-logs";
    return axiosClient.get(url, { params });
  },

  // 4. Get a single audit log by ID
  getAuditLogDetail(id) {
    if (!id) throw new Error("Missing audit log id for detail");
    const safeId = encodeURIComponent(id);
    const url = `admin/audit-logs/${safeId}`;
    return axiosClient.get(url);
  },
};

export default dashboardApi;
