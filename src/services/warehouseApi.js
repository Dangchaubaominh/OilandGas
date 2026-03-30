﻿// src/services/warehouseApi.js
import axiosClient from "./AxiosClient";

const normalizeCapacityPayload = (capacity) => {
  if (capacity && typeof capacity === "object") {
    return {
      total: Number(capacity.total) || 0,
      used: Number(capacity.used) || 0,
      unit: capacity.unit || "units",
    };
  }

  if (capacity === undefined || capacity === null || capacity === "") {
    return capacity;
  }

  return Number(capacity);
};

const warehouseApi = {
  // 1. Get all warehouses
  getAll(params) {
    return axiosClient.get("/admin/warehouses", { params });
  },

  // 2. Get warehouse by ID
  getById(id) {
    return axiosClient.get(`/admin/warehouses/${id}`);
  },

  // 3. Get full inventory report (OK/WARNING/CRITICAL per warehouse)
  getInventoryReport() {
    return axiosClient.get("/admin/warehouses/report");
  },

  getLogs(id, params) {
    return axiosClient.get(`/admin/warehouses/${id}/logs`, { params });
  },

  // 4. Create warehouse
  create(data) {
    return axiosClient.post("/admin/warehouses", {
      ...data,
      capacity: normalizeCapacityPayload(data.capacity),
    });
  },

  // 5. Update warehouse
  update(id, data) {
    return axiosClient.put(`/admin/warehouses/${id}`, {
      ...data,
      capacity: normalizeCapacityPayload(data.capacity),
    });
  },

  // 6. Delete warehouse
  delete(id, reason, force = false) {
    return axiosClient.delete(`/admin/warehouses/${id}`, {
      data: { reason, force },
    });
  },

  // 7. Receive inventory
  receive(data) {
    const supplierOrDestination =
      data.supplierOrDestination ?? data.supplier ?? data.destination ?? "";

    return axiosClient.post("/admin/warehouses/receive", {
      ...data,
      quantity: Number(data.quantity),
      supplierOrDestination,
    });
  },

  // 8. Dispatch inventory
  dispatch(data) {
    const supplierOrDestination =
      data.supplierOrDestination ?? data.supplier ?? data.destination ?? "";

    return axiosClient.post("/admin/warehouses/dispatch", {
      ...data,
      quantity: Number(data.quantity),
      supplierOrDestination,
    });
  },
};

export default warehouseApi;
