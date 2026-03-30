import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaEye,
  FaExclamationTriangle,
  FaArrowDown,
  FaArrowUp,
  FaWarehouse,
  FaBoxOpen,
} from "react-icons/fa";
import warehouseApi from "../../services/warehouseApi";
import equipmentApi from "../../services/equipmentApi";
import { showToast } from "../../utils/toastHandler";

const EMPTY_WH = { name: "", location: "", capacity: "", description: "" };
const EMPTY_RECEIVE = {
  equipmentId: "",
  warehouseId: "",
  quantity: "",
  supplierOrDestination: "",
  note: "",
};
const EMPTY_DISPATCH = {
  equipmentId: "",
  warehouseId: "",
  quantity: "",
  supplierOrDestination: "",
  actionDate: new Date().toISOString().split("T")[0],
};

const toDisplayText = (value, fallback = "") => {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => toDisplayText(item)).filter(Boolean);
    return parts.join(", ") || fallback;
  }

  if (typeof value === "object") {
    const namedParts = [value.address, value.city, value.country]
      .map((item) => toDisplayText(item))
      .filter(Boolean);

    if (namedParts.length > 0) {
      return namedParts.join(", ");
    }

    return fallback;
  }

  return fallback;
};

const normalizeWarehouses = (payload) => {
  const rows = payload?.data?.warehouses || payload?.warehouses || [];
  return Array.isArray(rows)
    ? rows.map((item) => ({
        _id: item._id,
        warehouseCode: item.warehouseCode,
        name: toDisplayText(item.name, "Unnamed warehouse"),
        location: toDisplayText(item.location, "Unknown location"),
        capacity: Number(item.capacity || 0),
        currentLoad: Number(item.currentLoad || 0),
        description: toDisplayText(item.description),
        status: item.status || "active",
      }))
    : [];
};

const normalizeLogs = (payload) => {
  const logs = payload?.data || payload?.logs || [];
  return Array.isArray(logs) ? logs : [];
};

export default function WarehouseInventory() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [whModal, setWhModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, wh: null });
  const [viewModal, setViewModal] = useState({ open: false, wh: null });
  const [receiveModal, setReceiveModal] = useState(false);
  const [dispatchModal, setDispatchModal] = useState({
    open: false,
    warehouse: null,
  });

  const [whForm, setWhForm] = useState(EMPTY_WH);
  const [receiveForm, setReceiveForm] = useState(EMPTY_RECEIVE);
  const [dispatchForm, setDispatchForm] = useState(EMPTY_DISPATCH);
  const [capAlert, setCapAlert] = useState(null);
  const [viewLogs, setViewLogs] = useState([]);
  const [logFilters, setLogFilters] = useState({
    type: "all",
    minQty: "",
    maxQty: "",
  });
  const [equipments, setEquipments] = useState([]);

  const loadEquipments = async () => {
    try {
      const res = await equipmentApi.getEquipmentList({ limit: 1000 });
      const list =
        res?.data?.data?.equipment ||
        res?.data?.equipment ||
        res?.equipment ||
        [];
      setEquipments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load equipments", err);
    }
  };

  const [warehouseLogs, setWarehouseLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await warehouseApi.getAll({
        page: 1,
        limit: 200,
        search: search || undefined,
      });
      setWarehouses(normalizeWarehouses(response.data));
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to load warehouses",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchWarehouses();
    loadEquipments();
  }, [fetchWarehouses]);

  const stats = useMemo(() => {
    const total = warehouses.length;
    const active = warehouses.filter((w) => w.status === "active").length;
    const totalItems = warehouses.reduce((sum, w) => sum + w.currentLoad, 0);
    const critical = warehouses.filter((w) => {
      if (!w.capacity) return false;
      return (w.currentLoad / w.capacity) * 100 >= 75;
    }).length;
    return { total, active, totalItems, critical };
  }, [warehouses]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return warehouses.filter((w) => {
      const safeName = toDisplayText(w.name).toLowerCase();
      const safeLocation = toDisplayText(w.location).toLowerCase();
      const matchSearch =
        !q ||
        safeName.includes(q) ||
        safeLocation.includes(q) ||
        String(w._id).toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || w.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [warehouses, search, statusFilter]);

  const uniqueLocations = useMemo(() => {
    return [
      ...new Set(warehouses.map((w) => w.location).filter(Boolean)),
      "Main Base",
      "Offshore Platform",
      "Storage Facility A",
      "Storage Facility B",
    ];
  }, [warehouses]);

  const pct = (load, cap) => (cap > 0 ? Math.round((load / cap) * 100) : 0);
  const capClass = (p) =>
    p >= 75
      ? "capacity-critical"
      : p >= 60
        ? "capacity-warning"
        : "capacity-good";
  const statClass = (s) => (s === "active" ? "badge-active" : "badge-inactive");

  const openCreate = () => {
    setWhForm(EMPTY_WH);
    setWhModal({ open: true, mode: "create", data: null });
  };

  const openEdit = (wh) => {
    setWhForm({
      name: wh.name,
      location: wh.location,
      capacity: String(wh.capacity),
      description: wh.description || "",
    });
    setWhModal({ open: true, mode: "edit", data: wh });
  };

  const closeWhModal = () =>
    setWhModal({ open: false, mode: "create", data: null });

  const handleSaveWh = async (e) => {
    e.preventDefault();
    const payload = {
      name: whForm.name?.trim(),
      location: whForm.location?.trim(),
      capacity: {
        total: whForm.capacity,
        used: 0,
        unit: "litres",
      },
      description: whForm.description?.trim() || undefined,
    };

    try {
      if (whModal.mode === "create") {
        await warehouseApi.create(payload);
        showToast("success", "Warehouse created successfully");
      } else {
        await warehouseApi.update(whModal.data._id, payload);
        showToast("success", "Warehouse updated successfully");
      }
      closeWhModal();
      await fetchWarehouses();
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to save warehouse",
      );
    }
  };

  const tryDelete = (wh) => {
    if (Number(wh.currentLoad) > 0) {
      showToast("error", "Cannot delete warehouse: Inventory still exists");
      return;
    }
    setDeleteConfirm({ open: true, wh });
  };
  const confirmDelete = async () => {
    const wh = deleteConfirm.wh;
    if (!wh) return;

    try {
      const shouldForceDelete = Number(wh.currentLoad || 0) > 0;
      await warehouseApi.delete(
        wh._id,
        "Deleted from admin inventory screen",
        shouldForceDelete,
      );
      showToast("success", "Warehouse deleted successfully");
      setDeleteConfirm({ open: false, wh: null });
      await fetchWarehouses();
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to delete warehouse",
      );
    }
  };

  const openReceive = (warehouseId = "") => {
    setReceiveForm({ ...EMPTY_RECEIVE, warehouseId });
    setReceiveModal(true);
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    try {
      // 1. Gom dữ liệu và ép kiểu cho chuẩn Payload
      const payload = {
        warehouseId: receiveForm.warehouseId,
        equipmentId: receiveForm.equipmentId?.trim(),
        quantity: Number(receiveForm.quantity), // Ép kiểu về số nguyên
        supplierOrDestination: receiveForm.supplierOrDestination?.trim(),
        // Chuyển ngày giờ sang chuẩn ISO String, nếu không nhập thì lấy giờ hiện tại
        actionDate: receiveForm.actionDate
          ? new Date(receiveForm.actionDate).toISOString()
          : new Date().toISOString(),
        note: receiveForm.note?.trim() || "string", // Có thể đổi "string" thành "" tùy BE yêu cầu
      };

      // 2. Xóa bỏ equipmentId nếu nó rỗng (để tránh lỗi cast ObjectId dưới Backend)
      if (!payload.equipmentId) {
        delete payload.equipmentId;
      }

      // 3. Gọi API
      await warehouseApi.receive(payload);
      showToast("success", "Inventory received successfully");

      // 4. Xử lý UI sau khi thành công
      setReceiveModal(false);
      await fetchWarehouses();

      if (viewModal.open && viewModal.wh?._id === receiveForm.warehouseId) {
        await loadLogs(viewModal.wh._id);
      }
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to receive inventory",
      );
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchModal.warehouse?._id) return;

    try {
      // 1. Gom dữ liệu và ép kiểu cho chuẩn Payload
      const payload = {
        warehouseId: dispatchModal.warehouse._id,
        equipmentId: dispatchForm.equipmentId?.trim(),
        quantity: Number(dispatchForm.quantity),
        supplierOrDestination: dispatchForm.supplierOrDestination?.trim(),
        // Chuyển ngày giờ sang chuẩn ISO String, nếu không nhập thì lấy giờ hiện tại
        actionDate: dispatchForm.actionDate
          ? new Date(dispatchForm.actionDate).toISOString()
          : new Date().toISOString(),
        note: dispatchForm.note?.trim() || "string",
      };

      // 2. Xóa bỏ equipmentId nếu nó rỗng (để tránh lỗi cast ObjectId dưới Backend)
      if (!payload.equipmentId) {
        delete payload.equipmentId;
      }

      // 3. Gọi API xuất kho
      await warehouseApi.dispatch(payload);
      showToast("success", "Inventory dispatched successfully");

      // 4. Reset form và đóng Modal
      setDispatchModal({ open: false, warehouse: null });
      setDispatchForm({
        quantity: "",
        supplierOrDestination: "",
        note: "",
        equipmentId: "",
        actionDate: "",
      });

      // 5. Cập nhật lại giao diện
      await fetchWarehouses();
      if (viewModal.open && viewModal.wh?._id === dispatchModal.warehouse._id) {
        await loadLogs(dispatchModal.warehouse._id);
      }
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to dispatch inventory",
      );
    }
  };

  const loadLogs = async (warehouseId) => {
    setLogsLoading(true);
    try {
      const response = await warehouseApi.getLogs(warehouseId);
      setWarehouseLogs(normalizeLogs(response));
    } catch (err) {
      setWarehouseLogs([]);
      showToast(
        "error",
        err?.response?.data?.message || "Failed to load warehouse logs",
      );
    } finally {
      setLogsLoading(false);
    }
  };

  const openViewModal = async (warehouse) => {
    setViewModal({ open: true, wh: warehouse });
    await loadLogs(warehouse._id);
  };

  return (
    <div className="warehouse-inventory">
      <div className="page-header">
        <h1>Warehouse Inventory</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-add-warehouse" onClick={openCreate}>
            <FaPlus /> Add Warehouse
          </button>
          <button
            className="btn-equipment-inventory"
            onClick={() => openReceive()}
          >
            <FaArrowDown /> Receive Inventory
          </button>
        </div>
      </div>

      <div className="wh-stats-grid">
        <div className="wh-stat-card">
          <FaWarehouse className="wh-stat-icon blue" />
          <div>
            <div className="wh-stat-value">{stats.total}</div>
            <div className="wh-stat-label">Total Warehouses</div>
          </div>
        </div>
        <div className="wh-stat-card">
          <FaCheckCircle className="wh-stat-icon green" />
          <div>
            <div className="wh-stat-value">{stats.active}</div>
            <div className="wh-stat-label">Active</div>
          </div>
        </div>
        <div className="wh-stat-card">
          <FaBoxOpen className="wh-stat-icon purple" />
          <div>
            <div className="wh-stat-value">
              {stats.totalItems.toLocaleString()}
            </div>
            <div className="wh-stat-label">Total Load</div>
          </div>
        </div>
        <div className="wh-stat-card">
          <FaExclamationTriangle className="wh-stat-icon orange" />
          <div>
            <div className="wh-stat-value">{stats.critical}</div>
            <div className="wh-stat-label">Near Capacity (≥75%)</div>
          </div>
        </div>
      </div>

      <div className="wh-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, name, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="wh-status-filters">
          {["all", "active", "inactive"].map((s) => (
            <button
              key={s}
              className={`wh-filter-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>WAREHOUSE NAME</th>
              <th>LOCATION</th>
              <th>CAPACITY</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "40px 0",
                  }}
                >
                  Loading warehouses...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "40px 0",
                  }}
                >
                  No warehouses found
                </td>
              </tr>
            ) : (
              filtered.map((wh) => {
                const percent = pct(wh.currentLoad, wh.capacity);
                return (
                  <tr key={wh._id}>
                    <td style={{ fontFamily: "monospace", color: "#60a5fa" }}>
                      {wh.warehouseCode}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{wh.name}</div>
                      {wh.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#6b7280",
                            marginTop: 2,
                          }}
                        >
                          {wh.description}
                        </div>
                      )}
                    </td>
                    <td>{toDisplayText(wh.location, "-")}</td>
                    <td>
                      <div className="capacity-cell">
                        <div className="capacity-info">
                          <span className="capacity-text">
                            {wh.currentLoad.toLocaleString()} /{" "}
                            {wh.capacity.toLocaleString()} units
                          </span>
                          <span
                            className={`capacity-percent ${capClass(percent)}`}
                          >
                            {percent}%
                          </span>
                        </div>
                        <div className="capacity-bar-container">
                          <div
                            className={`capacity-bar ${capClass(percent)}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statClass(wh.status)}`}>
                        {wh.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => openViewModal(wh)}
                          title="View Inventory"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => openEdit(wh)}
                          title="Edit warehouse"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => setDeleteConfirm({ open: true, wh })}
                          title="Delete warehouse"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="table-footer-bar">
          Showing {filtered.length} of {warehouses.length} warehouses
        </div>
      </div>

      {whModal.open && (
        <div className="modal-overlay" onClick={closeWhModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480 }}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {whModal.mode === "create"
                    ? "Add New Warehouse"
                    : "Edit Warehouse"}
                </h2>
                <p className="modal-subtitle">
                  {whModal.mode === "create"
                    ? "Create a warehouse in MongoDB"
                    : "Update warehouse details"}
                </p>
              </div>
              <button className="modal-close" onClick={closeWhModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveWh}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Warehouse Name *</label>
                  <input
                    className="form-input"
                    required
                    value={whForm.name}
                    onChange={(e) =>
                      setWhForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <select
                    className="form-input"
                    required
                    value={whForm.location}
                    onChange={(e) =>
                      setWhForm((p) => ({ ...p, location: e.target.value }))
                    }
                  >
                    <option value="">-- Select Location --</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity (units) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    required
                    value={whForm.capacity}
                    onChange={(e) =>
                      setWhForm((p) => ({ ...p, capacity: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={whForm.description}
                    onChange={(e) =>
                      setWhForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeWhModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-confirm">
                  <FaCheckCircle />{" "}
                  {whModal.mode === "create"
                    ? "Create Warehouse"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModal.open && viewModal.wh && (
        <div
          className="modal-overlay"
          onClick={() => setViewModal({ open: false, wh: null })}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{viewModal.wh.name} — Inventory Logs</h2>
                <p className="modal-subtitle">{viewModal.wh._id}</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setViewModal({ open: false, wh: null })}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {/* Capacity bar */}
              {(() => {
                const p = pct(viewModal.wh.currentLoad, viewModal.wh.capacity);
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div className="capacity-info" style={{ marginBottom: 6 }}>
                      <span className="capacity-text">
                        {Number(viewModal.wh.currentLoad || 0).toLocaleString()}{" "}
                        / {Number(viewModal.wh.capacity || 0).toLocaleString()}{" "}
                        units used
                      </span>
                      <span className={`capacity-percent ${capClass(p)}`}>
                        {p}%
                      </span>
                    </div>
                    <div className="capacity-bar-container">
                      <div
                        className={`capacity-bar ${capClass(p)}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div
                style={{ display: "flex", gap: "12px", marginBottom: "16px" }}
              >
                <select
                  className="form-select"
                  style={{ width: "auto" }}
                  value={logFilters.type}
                  onChange={(e) =>
                    setLogFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="all">All Types</option>
                  <option value="RECEIVE">Receive</option>
                  <option value="DISPATCH">Dispatch</option>
                </select>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Min Qty"
                  style={{ width: 100 }}
                  value={logFilters.minQty}
                  onChange={(e) =>
                    setLogFilters((prev) => ({
                      ...prev,
                      minQty: e.target.value,
                    }))
                  }
                />
                <input
                  className="form-input"
                  type="number"
                  placeholder="Max Qty"
                  style={{ width: 100 }}
                  value={logFilters.maxQty}
                  onChange={(e) =>
                    setLogFilters((prev) => ({
                      ...prev,
                      maxQty: e.target.value,
                    }))
                  }
                />
              </div>

              {viewLogs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#6b7280",
                  }}
                >
                  <FaBoxOpen
                    style={{
                      fontSize: 40,
                      marginBottom: 12,
                      opacity: 0.3,
                      display: "block",
                      margin: "0 auto 12px",
                    }}
                  />
                  <p>No inventory logs for this warehouse yet.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TYPE</th>
                      <th>QTY</th>
                      <th>SOURCE / DEST</th>
                      <th>DATE</th>
                      <th>USER</th>
                      <th>NOTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewLogs
                      .filter((item) => {
                        if (
                          logFilters.type !== "all" &&
                          item.type !== logFilters.type
                        )
                          return false;
                        if (
                          logFilters.minQty &&
                          item.quantity < Number(logFilters.minQty)
                        )
                          return false;
                        if (
                          logFilters.maxQty &&
                          item.quantity > Number(logFilters.maxQty)
                        )
                          return false;
                        return true;
                      })
                      .map((item) => (
                        <tr key={item._id}>
                          <td>{item.type}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: "#f9fafb" }}>
                              {item.quantity}
                            </span>
                          </td>
                          <td style={{ color: "#9ca3af" }}>
                            {toDisplayText(item.supplierOrDestination, "-")}
                          </td>
                          <td style={{ color: "#9ca3af" }}>
                            {new Date(item.actionDate).toLocaleString()}
                          </td>
                          <td style={{ color: "#9ca3af" }}>
                            {item.userId?.email || "-"}
                          </td>
                          <td style={{ color: "#9ca3af" }}>
                            {toDisplayText(item.note, "-")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setViewModal({ open: false, wh: null })}
              >
                Close
              </button>
              <button
                className="btn-equipment-inventory"
                onClick={() => openReceive(viewModal.wh._id)}
              >
                <FaArrowDown /> Receive
              </button>
              <button
                className="btn-dispatch-confirm"
                onClick={() => {
                  setDispatchModal({ open: true, warehouse: viewModal.wh });
                  setDispatchForm({
                    quantity: "",
                    supplierOrDestination: "",
                    note: "",
                    equipmentId: "",
                  });
                }}
              >
                <FaArrowUp /> Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Modal: Receive Inventory ══════════ */}
      {receiveModal && (
        <div className="modal-overlay" onClick={() => setReceiveModal(false)}>
          <div
            className="modal-content receive-inventory-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Receive Inventory</h2>
                <p className="modal-subtitle">
                  Add items received from supplier.
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setReceiveModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleReceive}>
              <div className="modal-body">
                {capAlert && (
                  <div className="cap-alert">
                    <FaExclamationTriangle /> {capAlert}
                  </div>
                )}
                <div className="form-group">
                  <label>Warehouse *</label>
                  <select
                    className="form-select"
                    required
                    value={receiveForm.warehouseId}
                    onChange={(e) =>
                      setReceiveForm((p) => ({
                        ...p,
                        warehouseId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({pct(w.currentLoad, w.capacity)}% full)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Equipment</label>
                  <select
                    className="form-select"
                    value={receiveForm.equipmentId}
                    onChange={(e) =>
                      setReceiveForm((p) => ({
                        ...p,
                        equipmentId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select an Equipment (Optional)</option>
                    {equipments.map((eq) => (
                      <option key={eq._id || eq.id} value={eq._id || eq.id}>
                        {eq.name} ({eq.equipmentCode || eq.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Quantity *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      placeholder="0"
                      required
                      value={receiveForm.quantity}
                      onChange={(e) =>
                        setReceiveForm((p) => ({
                          ...p,
                          quantity: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Date</label>
                    <input
                      className="form-input"
                      type="date"
                      required
                      value={receiveForm.actionDate}
                      onChange={(e) =>
                        setReceiveForm((p) => ({
                          ...p,
                          actionDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Supplier / Source *</label>
                  <input
                    className="form-input"
                    placeholder="Enter supplier name"
                    required
                    value={receiveForm.supplierOrDestination}
                    onChange={(e) =>
                      setReceiveForm((p) => ({
                        ...p,
                        supplierOrDestination: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={receiveForm.note}
                    onChange={(e) =>
                      setReceiveForm((p) => ({ ...p, note: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setReceiveModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-confirm">
                  <FaCheckCircle /> Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ Modal: Dispatch ══════════ */}
      {dispatchModal.open && dispatchModal.warehouse && (
        <div
          className="modal-overlay"
          onClick={() => setDispatchModal({ open: false, warehouse: null })}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400 }}
          >
            <div className="modal-header">
              <div>
                <h2>Dispatch Inventory</h2>
                <p className="modal-subtitle">
                  Warehouse: {dispatchModal.warehouse.name}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() =>
                  setDispatchModal({ open: false, warehouse: null })
                }
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleDispatch}>
              <div className="modal-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Quantity *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      required
                      value={dispatchForm.quantity}
                      onChange={(e) =>
                        setDispatchForm((p) => ({
                          ...p,
                          quantity: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Equipment ID</label>
                    <select
                      className="form-select"
                      value={dispatchForm.equipmentId}
                      onChange={(e) =>
                        setDispatchForm((p) => ({
                          ...p,
                          equipmentId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Equipment</option>
                      {equipments.map((eq) => (
                        <option key={eq._id || eq.id} value={eq._id || eq.id}>
                          {eq.name} ({eq.serial || eq.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Destination *</label>
                  <input
                    className="form-input"
                    required
                    value={dispatchForm.supplierOrDestination}
                    onChange={(e) =>
                      setDispatchForm((p) => ({
                        ...p,
                        supplierOrDestination: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Note</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={dispatchForm.note}
                    onChange={(e) =>
                      setDispatchForm((p) => ({ ...p, note: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() =>
                    setDispatchModal({ open: false, warehouse: null })
                  }
                >
                  Cancel
                </button>
                <button type="submit" className="btn-dispatch-confirm">
                  <FaArrowUp /> Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.open && deleteConfirm.wh && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteConfirm({ open: false, wh: null })}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <div className="modal-header">
              <div>
                <h2 style={{ color: "#ef4444" }}>Delete Warehouse</h2>
                <p className="modal-subtitle">This action cannot be undone.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirm({ open: false, wh: null })}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.7 }}>
                Are you sure you want to delete{" "}
                <strong style={{ color: "#f9fafb" }}>
                  {deleteConfirm.wh.name}
                </strong>
                ?
              </p>
              {deleteConfirm.wh.currentLoad > 0 && (
                <div className="cap-alert" style={{ marginTop: 12 }}>
                  <FaExclamationTriangle />
                  This warehouse has existing load. Delete will be forced and
                  remaining inventory will be auto-cleared with an audit log.
                </div>
              )}
            </div>
            <div
              className="modal-footer"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirm({ open: false, wh: null })}
              >
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                <FaTrash /> Delete Warehouse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
