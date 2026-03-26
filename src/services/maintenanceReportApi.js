import axiosClient from "./AxiosClient";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

const maintenanceReportApi = {
  // Get all maintenance records with optional filters and pagination.
  getMaintenanceReports(params = {}) {
    const url = "/admin/maintenance";
    return axiosClient.get(url, { params: cleanParams(params) });
  },

  // Get a single maintenance record by id.
  getMaintenanceReportById(id) {
    if (!id) throw new Error("Missing maintenance record id");
    const safeId = encodeURIComponent(id);
    const url = `/admin/maintenance/${safeId}`;
    return axiosClient.get(url);
  },

  // Create a maintenance record.
  createMaintenanceReport(data = {}) {
    const url = "/admin/maintenance";
    return axiosClient.post(url, data);
  },

  // Update a maintenance record by id.
  updateMaintenanceReport(id, data = {}) {
    if (!id) throw new Error("Missing maintenance record id");
    const safeId = encodeURIComponent(id);
    const url = `/admin/maintenance/${safeId}`;
    return axiosClient.put(url, data);
  },

  // Get maintenance records by equipment/instrument id.
  getMaintenanceReportsByTarget(targetId, params = {}) {
    if (!targetId) throw new Error("Missing maintenance target id");
    const safeTargetId = encodeURIComponent(targetId);
    const url = `/admin/maintenance/target/${safeTargetId}`;
    return axiosClient.get(url, { params: cleanParams(params) });
  },

  // Delete (soft delete) a maintenance record.
  deleteMaintenanceReport(id, data = {}) {
    if (!id) throw new Error("Missing maintenance record id");
    const safeId = encodeURIComponent(id);
    const url = `/admin/maintenance/${safeId}`;
    return axiosClient.delete(url, { data });
  },
};

export default maintenanceReportApi;
