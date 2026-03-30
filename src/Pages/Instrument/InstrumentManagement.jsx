﻿import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaUserCog,
  FaCalendarPlus,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaSync,
  FaThermometerHalf,
  FaTachometerAlt,
  FaWater,
  FaRulerVertical,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTools,
  FaClock,
  FaFileContract,
  FaCalendarAlt,
} from "react-icons/fa";
import instrumentApi from "../../services/instrumentApi";
import adminInstrumentApi from "../../services/adminInstrumentApi";
import userApi from "../../services/userApi";
import { showToast } from "../../utils/toastHandler";
import useAuthStore from "../../store/useAuthStore";
// 👉 IMPORT COMPONENT FORM Ở ĐÂY
import InstrumentForm from "./InstrumentForm";

export default function InstrumentManagement() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toLowerCase() || "";

  // --- STATES & HANDLERS ---
  const [instruments, setInstruments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States quản lý filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // States cho Form Modal
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [maintenanceTarget, setMaintenanceTarget] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: "preventive",
    date: "",
    priority: "medium",
    description: "",
    engineerId: "",
  });

  const [editTarget, setEditTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    model: "",
    manufacturer: "",
    location: "",
    status: "operational",
    measurementRange: "",
    accuracy: "",
    sampleRate: "",
    autoCalibration: false,
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    faulty: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminInstrumentApi.getStats();
      const payload = response?.data?.data || response?.data || {};
      setStats({
        total: Number(payload.total ?? payload.totalInstruments ?? 0),
        active: Number(payload.active ?? payload.operational ?? 0),
        maintenance: Number(payload.maintenance ?? 0),
        faulty: Number(payload.faulty ?? payload.faultyOrInactive ?? 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // --- DYNAMIC FORM LOGIC ---
  const typeUnitMap = {
    pressure: ["psi", "bar", "Pa", "kPa", "kg/cm2", "atm"],
    temperature: ["°C", "°F", "K"],
    flow: ["m3/h", "L/min", "kg/h", "gal/min", "Nm3/h"],
    level: ["m", "cm", "mm", "%", "ft", "in"],
    analytical: ["pH", "%", "ppm", "mg/L", "mg/m3"],
    safety: ["%LEL", "ppm", "%Vol"],
    control: ["%", "mA", "V"],
    monitoring: ["V", "A", "Hz", "RPM"],
    other: [],
  };

  const typeManufacturerMap = {
    pressure: [
      "Emerson",
      "Rosemount",
      "WIKA",
      "Yokogawa",
      "Endress+Hauser",
      "Siemens",
    ],
    temperature: [
      "Endress+Hauser",
      "WIKA",
      "Emerson",
      "ABB",
      "Yokogawa",
      "Honeywell",
    ],
    flow: [
      "Micro Motion",
      "Krohne",
      "Endress+Hauser",
      "ABB",
      "Siemens",
      "Yokogawa",
    ],
    level: ["Vega", "Endress+Hauser", "Emerson", "Siemens", "Magnetrol"],
    analytical: [
      "Hach",
      "Mettler Toledo",
      "Yokogawa",
      "Endress+Hauser",
      "Rosemount",
    ],
    safety: ["Dräger", "MSA Safety", "Crowcon", "Honeywell", "Det-Tronics"],
    control: ["Fisher", "Masoneilan", "Flowserve", "Samson", "Metso"],
    monitoring: ["Rockwell Automation", "Siemens", "ABB", "Schneider Electric"],
    other: [],
  };

  const currentSuggestedUnits = typeUnitMap[formData.instrumentType] || [];
  const currentSuggestedManufacturers =
    typeManufacturerMap[formData.instrumentType] || [];

  const getNextSequence = (existingStrings, prefixDefault) => {
    let maxNum = 0;
    let foundStr = "";

    existingStrings.forEach((str) => {
      if (!str) return;
      const match = str.match(/(.*?)(\d+)$/);
      if (match) {
        const num = parseInt(match[2], 10);
        if (num > maxNum) {
          maxNum = num;
          foundStr = str;
        }
      }
    });

    if (maxNum > 0 && foundStr) {
      const match = foundStr.match(/(.*?)(\d+)$/);
      const prefix = match[1];
      const digitsLen = match[2].length;
      return `${prefix}${String(maxNum + 1).padStart(digitsLen, "0")}`;
    }
    return `${prefixDefault}001`;
  };

  const currentSuggestedModels = useMemo(() => {
    if (!formData.manufacturer) return [];
    const existing = instruments
      .filter((i) => i.manufacturer === formData.manufacturer)
      .map((i) => i.model)
      .filter(Boolean);
    const initials = formData.manufacturer
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    const nextItem = getNextSequence(existing, `${initials}-M-`);
    const unique = Array.from(new Set(existing));
    if (!unique.includes(nextItem)) unique.unshift(nextItem);
    return unique;
  }, [formData.manufacturer, instruments]);

  const currentSuggestedSerials = useMemo(() => {
    if (!formData.manufacturer) return [];
    const existing = instruments
      .filter((i) => i.manufacturer === formData.manufacturer)
      .map((i) => i.serial || i.serialNumber)
      .filter(Boolean);
    const initials = formData.manufacturer
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    const nextItem = getNextSequence(existing, `${initials}-SN-`);
    const unique = Array.from(new Set(existing));
    if (!unique.includes(nextItem)) unique.unshift(nextItem);
    return unique;
  }, [formData.manufacturer, instruments]);

  const existingLocations = useMemo(() => {
    const locs = instruments.map((i) => i.location).filter(Boolean);
    return Array.from(new Set(locs));
  }, [instruments]);

  // --- FETCH ENGINEERS ---
  const fetchEngineers = useCallback(async () => {
    try {
      const res = await userApi.getActiveUsers({ role: "engineer" });
      const list =
        res?.data?.data?.users || res?.data?.users || res?.data || [];
      setEngineers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch engineers:", error);
    }
  }, []);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  // --- FETCH DATA TỪ API ---
  const fetchInstruments = useCallback(
    async (isManual = false) => {
      setIsLoading(true);

      try {
        const params = {
          page: 1,
          limit: 100,
          name: searchQuery.trim() || undefined,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          useCache: false,
        };

        const response = await instrumentApi.getInstrumentList(params);
        const list =
          response?.data?.instruments ||
          response?.data?.data?.instruments ||
          response?.instruments ||
          [];
        setInstruments(Array.isArray(list) ? list : []);
        setCurrentPage(1);
        fetchStats();
      } catch (error) {
        console.error("Error fetching instruments:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, statusFilter, typeFilter, fetchStats],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstruments();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchInstruments]);

  // --- PAGINATION ---
  const paginatedInstruments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return instruments.slice(startIndex, startIndex + itemsPerPage);
  }, [instruments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(instruments.length / itemsPerPage);

  // --- HELPERS ---
  const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    switch (lowerStatus) {
      case "active":
      case "operational":
        return "badge-active";
      case "maintenance":
      case "calibration":
        return "badge-calibration-due";
      case "faulty":
      case "inactive":
      case "out-of-service":
        return "badge-faulty";
      default:
        return "badge-default";
    }
  };

  const getStatusIcon = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    switch (lowerStatus) {
      case "active":
      case "operational":
        return <FaCheckCircle />;
      case "maintenance":
      case "calibration":
        return <FaExclamationTriangle />;
      case "faulty":
      case "inactive":
      case "out-of-service":
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType === "pressure") return <FaTachometerAlt />;
    if (lowerType === "temperature") return <FaThermometerHalf />;
    if (lowerType === "flow") return <FaWater />;
    if (lowerType === "level") return <FaRulerVertical />;
    if (lowerType === "safety") return <FaExclamationTriangle />;
    if (lowerType === "control") return <FaTools />;
    if (lowerType === "monitoring") return <FaCheckCircle />;
    return <FaTools />;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "instrumentType") {
        const suggestedUnits = typeUnitMap[value] || [];
        if (
          suggestedUnits.length > 0 &&
          !suggestedUnits.includes(newData.unit)
        ) {
          newData.unit = suggestedUnits[0];
        } else if (!value) {
          newData.unit = "";
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editTarget) {
        // --- CHỈ LẤY ĐÚNG 3 TRƯỜNG CHO API UPDATE (PUT) ---
        const updatePayload = {
          name: formData.name,
          type: formData.type,
          model: formData.model,
          manufacturer: formData.manufacturer,
          status: formData.status || "operational",
          location: formData.location,
          // Frontend hiển thị là serialNumber, nhưng gửi đi là serial
        };

        // Gọi API Update
        await adminInstrumentApi.update(
          editTarget._id || editTarget.id,
          updatePayload,
        );
        showToast("success", "Instrument updated successfully!");
      } else {
        // --- LẤY FULL DỮ LIỆU CHO API CREATE (POST) ---

        // 1. Tính toán ngày tháng
        let calibrationDate = undefined;
        let nextCalibrationDate = undefined;

        if (formData.lastCalibrationDate) {
          calibrationDate = new Date(formData.lastCalibrationDate);
          if (formData.calibrationInterval) {
            nextCalibrationDate = new Date(calibrationDate);
            nextCalibrationDate.setMonth(
              nextCalibrationDate.getMonth() +
                Number(formData.calibrationInterval),
            );
          }
        }

        // 2. Gom payload đầy đủ
        const createPayload = {
          name: formData.name,
          type: formData.type,
          serial: formData.serialNumber || `SN-${Date.now()}`,
          model: formData.model,
          manufacturer: formData.manufacturer,
          location: formData.location,
          status: formData.status || "operational",
          specifications: {
            range: formData.measurementRange,
            accuracy: formData.accuracy,
            technicalSpecs: [
              {
                parameter: "Sample Rate",
                value: formData.sampleRate || "",
              },
              {
                parameter: "Auto Calibration",
                value:
                  formData.autoCalibration === "true" ||
                  formData.autoCalibration === true
                    ? "Enabled"
                    : "Disabled",
              },
            ],
          },
          operationalParameters: {
            calibrationDate: calibrationDate,
            nextCalibrationDate: nextCalibrationDate,
          },
          installationDate: formData.installationDate
            ? new Date(formData.installationDate)
            : undefined,
        };

        // Gọi API Create
        await adminInstrumentApi.create(createPayload);
        showToast("success", "Instrument created successfully!");
      }

      handleCancel();
      fetchInstruments(true); // Load lại danh sách thiết bị
    } catch (err) {
      let errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save instrument";

      // Xử lý báo lỗi chi tiết từ Backend
      if (err.response?.data?.error && Array.isArray(err.response.data.error)) {
        errorMessage = err.response.data.error
          .map((e) => `${e.field}: ${e.message}`)
          .join(" | ");
      } else if (err.response?.data?.error) {
        errorMessage = `${errorMessage} - ${err.response.data.error}`;
      }

      showToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditTarget(null);
    setFormData({
      name: "",
      instrumentCode: "",
      instrumentType: "",
      manufacturer: "",
      modelNumber: "",
      location: "",
      installationDate: "",
      lastCalibrationDate: "",
      calibrationInterval: "",
      description: "",
      serialNumber: "",
      rangeMin: "",
      rangeMax: "",
      unit: "",
      status: "operational",
    });
  };

  const handleEditClick = (instrument) => {
    // Lưu lại thiết bị đang được edit để biết là gọi API Update chứ không phải Create
    setEditTarget(instrument);

    // --- 1. XỬ LÝ ĐỊNH DẠNG NGÀY THÁNG (YYYY-MM-DD) CHO THẺ <input type="date"> ---
    const installDate = instrument.installationDate
      ? new Date(instrument.installationDate).toISOString().split("T")[0]
      : "";

    const lastCalibDateStr = instrument.operationalParameters?.calibrationDate;
    const lastCalibDate = lastCalibDateStr
      ? new Date(lastCalibDateStr).toISOString().split("T")[0]
      : "";

    // --- 2. TÍNH TOÁN LẠI CHU KỲ HIỆU CHUẨN (Tháng) ---
    let calcInterval = "";
    if (
      instrument.operationalParameters?.calibrationDate &&
      instrument.operationalParameters?.nextCalibrationDate
    ) {
      const d1 = new Date(instrument.operationalParameters.calibrationDate);
      const d2 = new Date(instrument.operationalParameters.nextCalibrationDate);
      // Lấy năm nhân 12 + độ lệch tháng
      let months =
        (d2.getFullYear() - d1.getFullYear()) * 12 +
        (d2.getMonth() - d1.getMonth());
      calcInterval = months > 0 ? String(months) : "";
    }

    // --- 3. ĐỔ DỮ LIỆU TỪ BACKEND VÀO STATE CỦA FORM ---
    setFormData({
      name: instrument.name || "",
      type: instrument.type || "",
      serialNumber: instrument.serialNumber || "",
      model: instrument.model || "",
      manufacturer: instrument.manufacturer || "",
      location: instrument.location || "",
      status: instrument.status || "open",

      // Bóc tách từ object specifications
      measurementRange: instrument.specifications?.measurementRange || "",
      accuracy: instrument.specifications?.accuracy || "",

      // Bóc tách từ object operationalParameters
      sampleRate: instrument.operationalParameters?.sampleRate || "",
      autoCalibration:
        instrument.operationalParameters?.autoCalibration ?? false,

      // Gắn ngày tháng đã format
      installationDate: installDate,
      lastCalibrationDate: lastCalibDate,
      calibrationInterval: calcInterval,
    });

    // Mở Form lên
    setShowModal(true);
  };

  const handleDeleteClick = (instrument) => {
    setDeleteTarget(instrument);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminInstrumentApi.delete(deleteTarget._id || deleteTarget.id);
      showToast("success", "Instrument deleted successfully!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchInstruments(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete instrument";
      showToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignEngineer = (instrument) => {
    setAssignTarget(instrument);
    if (instrument.assignedTo) {
      setSelectedEngineer(instrument.assignedTo._id || instrument.assignedTo);
    }
    setShowAssignModal(true);
  };

  const onAssignSubmit = async () => {
    // 1. Kiểm tra xem đã chọn ai chưa
    if (!selectedEngineer) {
      showToast("error", "Please select an engineer");
      return;
    }

    // 2. Lấy ID của thiết bị đang được giao việc
    const targetId = assignTarget._id || assignTarget.id;

    setIsSubmitting(true); // Bật trạng thái loading (nếu bạn có dùng)

    try {
      await adminInstrumentApi.assignEngineer(targetId, selectedEngineer);

      showToast("success", `Engineer assigned to ${assignTarget.name}`);
      setShowAssignModal(false); // Đóng popup
      fetchInstruments(true); // Load lại bảng danh sách để cập nhật dữ liệu mới
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to assign engineer",
      );
    } finally {
      setIsSubmitting(false); // Tắt trạng thái loading
    }
  };

  const handleScheduleMaintenance = (instrument) => {
    setMaintenanceTarget(instrument);
    setMaintenanceForm({
      type: "preventive",
      date: "",
      notes: "",
    });
    setShowMaintenanceModal(true);
  };

  const onMaintenanceSubmit = async () => {
    if (!maintenanceForm.date || !maintenanceForm.type) {
      showToast("error", "Please fill in required fields");
      return;
    }
    const targetId = maintenanceTarget._id || maintenanceTarget.id;
    try {
      await instrumentApi.scheduleMaintenance(targetId, maintenanceForm);
      showToast(
        "success",
        `Maintenance scheduled for ${maintenanceTarget.name}`,
      );
      setShowMaintenanceModal(false);
      fetchInstruments(true);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to schedule maintenance",
      );
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const hasActiveFilters = searchQuery || statusFilter || typeFilter;

  return (
    <div className="instrument-management">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Instrument Registry</h1>
          <p className="page-subtitle">
            Monitor calibration status and manage field instruments
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn-secondary btn-reload"
            onClick={() => fetchInstruments(true)}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          {role === "admin" && (
            <button className="btn-create" onClick={() => setShowModal(true)}>
              <FaPlus /> Add Instrument
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid instrument-stats">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Total Instruments</p>
              <p className="stat-value">{stats.total}</p>
            </div>
            <div className="stat-icon stat-icon-blue">
              <FaTools />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Active / Operational</p>
              <p className="stat-value stat-value-green">{stats.active}</p>
            </div>
            <div className="stat-icon stat-icon-green">
              <FaCheckCircle />
            </div>
          </div>
          <div
            className="stat-bar stat-bar-green"
            style={{
              width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Maintenance</p>
              <p className="stat-value stat-value-orange">
                {stats.maintenance}
              </p>
            </div>
            <div className="stat-icon stat-icon-orange">
              <FaExclamationTriangle />
            </div>
          </div>
          <div
            className="stat-bar stat-bar-orange"
            style={{
              width: `${stats.total ? (stats.maintenance / stats.total) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Faulty / Inactive</p>
              <p className="stat-value stat-value-red">{stats.faulty}</p>
            </div>
            <div className="stat-icon stat-icon-red">
              <FaTimesCircle />
            </div>
          </div>
          <div
            className="stat-bar stat-bar-red"
            style={{
              width: `${stats.total ? (stats.faulty / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, Tag ID, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="filter-group">
            <div className="filter-select-wrapper">
              <FaFilter className="filter-icon" />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="operational">Operational</option>
                <option value="calibration">Calibration</option>
                <option value="maintenance">Maintenance</option>
                <option value="faulty">Faulty</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="pressure">Pressure (Áp suất)</option>
              <option value="temperature">Temperature (Nhiệt độ)</option>
              <option value="flow">Flow (Lưu lượng)</option>
              <option value="level">Level (Mức)</option>
              <option value="analytical">Analytical (Phân tích)</option>
              <option value="safety">Safety (An toàn)</option>
              <option value="control">Control (Điều khiển)</option>
              <option value="monitoring">Monitoring (Giám sát)</option>
              <option value="other">Other (Khác)</option>
            </select>

            {(searchQuery || statusFilter || typeFilter) && (
              <button
                className="btn-clear-filters"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setTypeFilter("");
                }}
                title="Clear all filters"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="active-filters-info">
            Showing {instruments.length} result
            {instruments.length !== 1 ? "s" : ""}
            {searchQuery && (
              <span className="filter-tag">Search: "{searchQuery}"</span>
            )}
            {statusFilter && (
              <span className="filter-tag">
                Status:{" "}
                {statusFilter === "operational"
                  ? "Active"
                  : statusFilter === "maintenance"
                    ? "Maintenance"
                    : statusFilter === "faulty"
                      ? "Faulty/Inactive"
                      : statusFilter}
              </span>
            )}
            {typeFilter && (
              <span className="filter-tag">
                Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <FaSync className="spin" />
          </div>
          <p>Loading instruments...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table instrument-table">
              <thead>
                <tr>
                  <th>TAG ID</th>
                  <th>INSTRUMENT</th>
                  <th>LOCATION</th>
                  <th>MANUFACTURER</th>
                  <th>LAST CALIBRATION</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInstruments.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">
                        <FaTools className="empty-icon" />
                        <h3>No Instruments Found</h3>
                        <p>
                          {hasActiveFilters
                            ? "Try adjusting your search or filter criteria"
                            : "Start by adding your first instrument"}
                        </p>
                        {hasActiveFilters ? (
                          <button
                            className="btn-secondary"
                            onClick={clearFilters}
                          >
                            Clear Filters
                          </button>
                        ) : (
                          role === "admin" && (
                            <button
                              className="btn-create"
                              onClick={() => setShowModal(true)}
                            >
                              <FaPlus /> Add Instrument
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInstruments.map((instrument) => (
                    <tr
                      key={instrument.id || instrument._id}
                      className="instrument-row"
                    >
                      <td>
                        <span className="tag-id">
                          {instrument.instrumentCode ||
                            String(
                              instrument.id || instrument._id || "",
                            ).substring(0, 8)}
                        </span>
                      </td>
                      <td>
                        <div className="instrument-info">
                          <div className="instrument-type-icon">
                            {getTypeIcon(
                              instrument.type || instrument.instrumentType,
                            )}
                          </div>
                          <div className="instrument-details">
                            <span className="instrument-name">
                              {instrument.name || instrument.type || "Unknown"}
                            </span>
                            <span className="instrument-type">
                              {instrument.type ||
                                instrument.instrumentType ||
                                "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="location-text">
                          {instrument.location || "-"}
                        </span>
                      </td>
                      <td>
                        <div className="manufacturer-info">
                          <span className="manufacturer-name">
                            {instrument.manufacturer || "-"}
                          </span>
                          {instrument.model && (
                            <span className="model-number">
                              {instrument.model}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="calibration-info">
                          <FaCalendarAlt className="calendar-icon" />
                          <span>
                            {instrument.lastCalibrated
                              ? new Date(
                                  instrument.lastCalibrated,
                                ).toLocaleDateString()
                              : instrument.updatedAt
                                ? new Date(
                                    instrument.updatedAt,
                                  ).toLocaleDateString()
                                : "-"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-with-icon ${getStatusClass(instrument.status)}`}
                        >
                          {getStatusIcon(instrument.status)}
                          {instrument.status || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            title="Assign Engineer"
                            onClick={() => handleAssignEngineer(instrument)}
                            style={{
                              display:
                                role === "admin" || role === "supervisor"
                                  ? "flex"
                                  : "none",
                              color: "#2196F3",
                            }}
                          >
                            <FaUserCog />
                          </button>
                          <button
                            className="btn-icon"
                            title="Schedule Maintenance"
                            onClick={() =>
                              handleScheduleMaintenance(instrument)
                            }
                            style={{
                              display: [
                                "admin",
                                "supervisor",
                                "engineer",
                              ].includes(role)
                                ? "flex"
                                : "none",
                              color: "#FF9800",
                            }}
                          >
                            <FaCalendarPlus />
                          </button>
                          <button
                            className="btn-icon btn-view"
                            title="View Details"
                            onClick={() =>
                              navigate(
                                `/app/instrument/${instrument._id || instrument.id || instrument.tagId}`,
                              )
                            }
                          >
                            <FaEye />
                          </button>

                          <button
                            className="btn-icon btn-edit"
                            title="Edit"
                            onClick={() => handleEditClick(instrument)}
                            style={{
                              display: role === "admin" ? "flex" : "none",
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            title="Delete"
                            onClick={() => handleDeleteClick(instrument)}
                            style={{
                              display: role === "admin" ? "flex" : "none",
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, instruments.length)} of{" "}
                {instruments.length} instruments
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <FaChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <span key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="pagination-ellipsis">...</span>
                      )}
                      <button
                        className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 👉 GỌI COMPONENT FORM Ở ĐÂY THAY CHO FORM CŨ */}
      <InstrumentForm
        showModal={showModal}
        formData={formData}
        editTarget={editTarget}
        isSubmitting={isSubmitting}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      {/* Assign Engineer Modal */}
      {showAssignModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssignModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Engineer</h2>
              <button
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Instrument: <strong>{assignTarget?.name}</strong>
              </p>
              <div className="form-group">
                <label>Select Engineer</label>
                <select
                  className="form-input"
                  value={selectedEngineer}
                  onChange={(e) => setSelectedEngineer(e.target.value)}
                >
                  <option value="">-- Choose Engineer --</option>
                  {engineers.map((eng) => (
                    <option key={eng._id || eng.id} value={eng._id || eng.id}>
                      {eng.username} ({eng.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                disabled={!selectedEngineer}
                onClick={onAssignSubmit}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {showMaintenanceModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMaintenanceModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Maintenance</h2>
              <button
                className="close-btn"
                onClick={() => setShowMaintenanceModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Instrument: <strong>{maintenanceTarget?.name}</strong>
              </p>
              <div className="form-group">
                <label>Maintenance Type</label>
                <select
                  className="form-input"
                  value={maintenanceForm.type}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="calibration">Calibration</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={maintenanceForm.date}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Engineer (Optional)</label>
                <select
                  className="form-input"
                  value={maintenanceForm.engineerId}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      engineerId: e.target.value,
                    })
                  }
                >
                  <option value="">-- Auto Assign / Pending --</option>
                  {engineers.map((eng) => (
                    <option key={eng._id || eng.id} value={eng._id || eng.id}>
                      {eng.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  value={maintenanceForm.description}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowMaintenanceModal(false)}
              >
                Cancel
              </button>
              <button className="btn-submit" onClick={onMaintenanceSubmit}>
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <FaTrash />
            </div>
            <h2>Delete Instrument</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget?.name || deleteTarget?.tagId || "this instrument"}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSync className="spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
