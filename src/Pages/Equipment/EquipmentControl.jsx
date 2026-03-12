import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaCogs,
  FaOilCan,
  FaMicrochip,
  FaCog,
  FaCalendarAlt,
} from "react-icons/fa";
import equipmentApi from "../../services/equipmentApi";
import { showToast } from "../../utils/toastHandler";

export default function EquipmentControl() {
  const navigate = useNavigate();

  // --- STATES FOR API & FILTERS ---
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // States for Form Modal
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    equipmentName: "",
    equipmentType: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    location: "",
    installDate: "",
    currentStatus: "",
    technicalSpec: "",
    needsCalibration: false,
  });

  // --- FETCH DATA FROM API ---
  const fetchEquipmentData = useCallback(
    async (isManual = false) => {
      if (!isManual && isLoading) setIsLoading(true);

      try {
        const response = await equipmentApi.getEquipmentList({
          page: 1,
          limit: 100,
          name: searchQuery.trim() || undefined,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        });

        const equipmentList = response.data?.data?.equipment || [];
        setEquipment(Array.isArray(equipmentList) ? equipmentList : []);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, statusFilter, typeFilter],
  );

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipmentData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, typeFilter, fetchEquipmentData]);

  // --- COMPUTED STATS ---
  const stats = useMemo(() => {
    const total = equipment.length;
    const active = equipment.filter(
      (i) =>
        i.status?.toLowerCase() === "active" ||
        i.status?.toLowerCase() === "operational",
    ).length;
    const maintenance = equipment.filter(
      (i) => i.status?.toLowerCase() === "maintenance",
    ).length;
    const faulty = equipment.filter(
      (i) =>
        i.status?.toLowerCase() === "faulty" ||
        i.status?.toLowerCase() === "inactive" ||
        i.status?.toLowerCase() === "offline" ||
        i.status?.toLowerCase() === "out-of-service",
    ).length;
    return { total, active, maintenance, faulty };
  }, [equipment]);

  // --- PAGINATION ---
  const paginatedEquipment = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return equipment.slice(startIndex, startIndex + itemsPerPage);
  }, [equipment, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(equipment.length / itemsPerPage);

  // --- HELPERS ---
  const getTypeIcon = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType === "drilling") return <FaCog />;
    if (lowerType === "pumping") return <FaOilCan />;
    if (lowerType === "safety") return <FaExclamationTriangle />;
    if (lowerType === "measurement") return <FaMicrochip />;
    if (lowerType === "transportation") return <FaCogs />;
    return <FaCogs />;
  };

  const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    switch (lowerStatus) {
      case "operational":
      case "active":
        return "badge-active";
      case "maintenance":
        return "badge-maintenance";
      case "faulty":
      case "inactive":
      case "offline":
      case "out-of-service":
        return "badge-faulty";
      default:
        return "badge-default";
    }
  };

  const getStatusIcon = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    switch (lowerStatus) {
      case "operational":
      case "active":
        return <FaCheckCircle />;
      case "maintenance":
        return <FaExclamationTriangle />;
      case "faulty":
      case "inactive":
      case "offline":
      case "out-of-service":
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const equipmentData = {
        name: formData.equipmentName,
        type: formData.equipmentType,
        serial: formData.serialNumber,
        model: formData.model,
        manufacturer: formData.manufacturer,
        location: formData.location,
        status: formData.currentStatus || "operational",
        technicalSpecs: formData.technicalSpec
          ? { description: formData.technicalSpec }
          : {},
        purchaseDate: formData.installDate || undefined,
      };

      if (editTarget) {
        // Update existing equipment
        await equipmentApi.updateEquipment(editTarget._id, equipmentData);
        showToast("success", "Equipment updated successfully!");
      } else {
        // Create new equipment
        await equipmentApi.createEquipment(equipmentData);
        showToast("success", "Equipment created successfully!");
      }

      handleCancel();
      fetchEquipmentData(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to save equipment";
      showToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditTarget(null);
    setFormData({
      equipmentName: "",
      equipmentType: "",
      serialNumber: "",
      model: "",
      manufacturer: "",
      location: "",
      installDate: "",
      currentStatus: "",
      technicalSpec: "",
      needsCalibration: false,
    });
  };

  const handleEditClick = (item) => {
    setEditTarget(item);
    setFormData({
      equipmentName: item.name || "",
      equipmentType: item.type || "",
      serialNumber: item.serial || "",
      model: item.model || "",
      manufacturer: item.manufacturer || "",
      location: item.location || "",
      installDate: item.purchaseDate ? item.purchaseDate.split("T")[0] : "",
      currentStatus: item.status || "operational",
      technicalSpec: item.technicalSpecs?.description || "",
      needsCalibration: false,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);

    try {
      await equipmentApi.deleteEquipment(deleteTarget._id);
      showToast("success", "Equipment deleted successfully!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchEquipmentData(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete equipment";
      showToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const hasActiveFilters = searchQuery || statusFilter || typeFilter;

  return (
    <div className="equipment-control">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Equipment Management</h1>
          <p className="page-subtitle">
            Monitor equipment status and manage field devices
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn-secondary btn-reload"
            onClick={() => fetchEquipmentData(true)}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          <button className="btn-create" onClick={() => setShowModal(true)}>
            <FaPlus /> Add Equipment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid equipment-stats">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Total Equipment</p>
              <p className="stat-value">{stats.total}</p>
            </div>
            <div className="stat-icon stat-icon-blue">
              <FaCogs />
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
              placeholder="Search by name, serial number, or location..."
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
                <option value="operational">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="faulty">Faulty/Inactive</option>
              </select>
            </div>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="drilling">Drilling</option>
              <option value="pumping">Pumping</option>
              <option value="safety">Safety</option>
              <option value="measurement">Measurement</option>
              <option value="transportation">Transportation</option>
              <option value="other">Other</option>
            </select>

            {hasActiveFilters && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                <FaTimes /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="active-filters-info">
            Showing {equipment.length} result
            {equipment.length !== 1 ? "s" : ""}
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
          <p>Loading equipment data...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table equipment-table">
              <thead>
                <tr>
                  <th>EQUIPMENT ID</th>
                  <th>EQUIPMENT</th>
                  <th>SERIAL NUMBER</th>
                  <th>MANUFACTURER</th>
                  <th>INSTALL DATE</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEquipment.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state">
                        <FaCogs className="empty-icon" />
                        <h3>No Equipment Found</h3>
                        <p>
                          {hasActiveFilters
                            ? "Try adjusting your search or filter criteria"
                            : "Start by adding your first equipment"}
                        </p>
                        {hasActiveFilters ? (
                          <button
                            className="btn-secondary"
                            onClick={clearFilters}
                          >
                            Clear Filters
                          </button>
                        ) : (
                          <button
                            className="btn-create"
                            onClick={() => setShowModal(true)}
                          >
                            <FaPlus /> Add Equipment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEquipment.map((item) => (
                    <tr key={item.id || item._id} className="equipment-row">
                      <td>
                        <span className="tag-id">
                          {(item.id || item._id)?.substring(0, 8)}
                        </span>
                      </td>
                      <td>
                        <div className="equipment-info-cell">
                          <div className="equipment-type-icon">
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="equipment-details-cell">
                            <span className="equipment-name-text">
                              {item.name || "Unknown"}
                            </span>
                            <span className="equipment-type-text">
                              {item.type || "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="serial-text">
                          {item.serial || "-"}
                        </span>
                      </td>
                      <td>
                        <div className="manufacturer-info">
                          <span className="manufacturer-name">
                            {item.manufacturer || "-"}
                          </span>
                          {item.model && (
                            <span className="model-number">{item.model}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="install-date-info">
                          <FaCalendarAlt className="calendar-icon" />
                          <span>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="location-text">
                          {item.location || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-with-icon ${getStatusClass(item.status)}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            title="View Details"
                            onClick={() =>
                              navigate(`/app/equipment/${item.id || item._id}`)
                            }
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            title="Edit"
                            onClick={() => handleEditClick(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            title="Delete"
                            onClick={() => handleDeleteClick(item)}
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
                {Math.min(currentPage * itemsPerPage, equipment.length)} of{" "}
                {equipment.length} equipment
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

      {/* Add New Equipment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="modal-content register-instrument-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editTarget ? "Edit Equipment" : "Add New Equipment"}</h2>
                <p className="modal-subtitle">
                  {editTarget
                    ? "Update equipment information"
                    : "Add a new equipment to the tracking system"}
                </p>
              </div>
              <button className="modal-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-columns">
                  {/* General Information Column */}
                  <div className="form-column">
                    <h3 className="column-title">General Information</h3>

                    <div className="form-group">
                      <label>
                        Equipment Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="equipmentName"
                        className="form-input"
                        placeholder="Enter equipment name"
                        value={formData.equipmentName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Equipment Type <span className="required">*</span>
                      </label>
                      <select
                        name="equipmentType"
                        className="form-select"
                        value={formData.equipmentType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select type</option>
                        <option value="drilling">Drilling</option>
                        <option value="pumping">Pumping</option>
                        <option value="safety">Safety</option>
                        <option value="measurement">Measurement</option>
                        <option value="transportation">Transportation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Serial Number <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="serialNumber"
                        className="form-input"
                        placeholder="Enter serial number"
                        value={formData.serialNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Model</label>
                      <input
                        type="text"
                        name="model"
                        className="form-input"
                        placeholder="Enter model"
                        value={formData.model}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Manufacturer <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="manufacturer"
                        className="form-input"
                        placeholder="e.g. Siemens, ABB, GE"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Status & Location Column */}
                  <div className="form-column">
                    <h3 className="column-title">Status & Location</h3>

                    <div className="form-group">
                      <label>
                        Equipment Location <span className="required">*</span>
                      </label>
                      <select
                        name="location"
                        className="form-select"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select location</option>
                        <option value="Platform X1">Platform X1</option>
                        <option value="Platform Y2">Platform Y2</option>
                        <option value="Platform Z3">Platform Z3</option>
                        <option value="Well Site A">Well Site A</option>
                        <option value="Well Site B">Well Site B</option>
                        <option value="Pipeline B2">Pipeline B2</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Installation Date <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        name="installDate"
                        className="form-input"
                        value={formData.installDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Current Status <span className="required">*</span>
                      </label>
                      <select
                        name="currentStatus"
                        className="form-select"
                        value={formData.currentStatus}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select status</option>
                        <option value="operational">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="faulty">Faulty/Inactive</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Technical Specification</label>
                      <textarea
                        name="technicalSpec"
                        className="form-textarea"
                        placeholder="Enter technical specification, materials, temperature, ductility, resistance, etc."
                        rows="3"
                        value={formData.technicalSpec}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="needsCalibration"
                          checked={formData.needsCalibration}
                          onChange={handleInputChange}
                        />
                        <span>
                          Equipment Needs Initial Calibration and Quality
                          Verification
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSync className="spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaPlus />{" "}
                      {editTarget ? "Update Equipment" : "Save Equipment"}
                    </>
                  )}
                </button>
              </div>
            </form>
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
            <h2>Delete Equipment</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name || "this equipment"}</strong>? This
              action cannot be undone.
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
