// src/services/roleApi.js
import axiosClient from "./AxiosClient";

const ROLE_BASE_URL = "/admin/roles";

const ensureRoleId = (id, action) => {
  if (!id) throw new Error(`Missing role id for ${action}`);
  return encodeURIComponent(id);
};

const normalizeRolePayload = (data = {}) => {
  const payload = { ...data };

  if (Array.isArray(payload.permissions)) {
    payload.permissions = payload.permissions
      .map((permission) =>
        typeof permission === "string" ? permission.trim() : "",
      )
      .filter(Boolean);
  }

  return payload;
};

const roleApi = {
  // 1. Get roles list
  getRoles(params = {}) {
    return axiosClient.get(ROLE_BASE_URL, { params });
  },

  // 2. Create a new role
  createRole(data) {
    return axiosClient.post(ROLE_BASE_URL, normalizeRolePayload(data));
  },

  // 3. Get role detail by ID
  getRoleDetail(id) {
    const safeId = ensureRoleId(id, "detail");
    return axiosClient.get(`${ROLE_BASE_URL}/${safeId}`);
  },

  // 4. Update role by ID
  updateRole(id, data) {
    const safeId = ensureRoleId(id, "update");
    return axiosClient.put(
      `${ROLE_BASE_URL}/${safeId}`,
      normalizeRolePayload(data),
    );
  },

  // 5. Delete role by ID
  deleteRole(id) {
    const safeId = ensureRoleId(id, "delete");
    return axiosClient.delete(`${ROLE_BASE_URL}/${safeId}`);
  },

  // Aliases for naming consistency across pages
  listRoles(params = {}) {
    return roleApi.getRoles(params);
  },

  getRole(id) {
    return roleApi.getRoleDetail(id);
  },
};

export default roleApi;
