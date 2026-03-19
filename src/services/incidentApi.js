// src/services/incidentApi.js
import axiosClient from "./AxiosClient";

const incidentApi = {
  // 1. Get incidents list with filters and pagination
  getIncidentsList(params = {}) {
    const url = "engineer/incidents";
    return axiosClient.get(url, { params });
  },

  // 2. Create a new incident
  createIncident(data) {
    const url = "engineer/incidents";
    return axiosClient.post(url, data);
  },

  // 3. Get incident by ID
  getIncidentDetail(id) {
    if (!id) throw new Error("Missing incident id for detail");
    const safeId = encodeURIComponent(id);
    const url = `engineer/incidents/${safeId}`;
    return axiosClient.get(url);
  },

  // 4. Update an incident
  updateIncident(id, data) {
    if (!id) throw new Error("Missing incident id for update");
    const safeId = encodeURIComponent(id);
    const url = `engineer/incidents/${safeId}`;
    return axiosClient.put(url, data);
  },

  // 5. Delete an incident (soft delete)
  deleteIncident(id) {
    if (!id) throw new Error("Missing incident id for delete");
    const safeId = encodeURIComponent(id);
    const url = `engineer/incidents/${safeId}`;
    return axiosClient.delete(url);
  },

  // 6. Add a comment to an incident
  addIncidentComment(id, data) {
    if (!id) throw new Error("Missing incident id for adding comment");
    const safeId = encodeURIComponent(id);
    const url = `engineer/incidents/${safeId}/comments`;
    return axiosClient.post(url, data);
  },

  // 7. Get comments for an incident
  getIncidentComments(id) {
    if (!id) throw new Error("Missing incident id for fetching comments");
    const safeId = encodeURIComponent(id);
    const url = `engineer/incidents/${safeId}/comments`;
    return axiosClient.get(url);
  },
};

export default incidentApi;
