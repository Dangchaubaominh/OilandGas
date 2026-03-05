import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
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
  FaCalendarAlt,
} from "react-icons/fa";
import instrumentApi from "../../services/instrumentApi";

export default function InstrumentManagement() {
  const navigate = useNavigate();

  // --- STATES CHO API & BỘ LỌC ---
  const [instruments, setInstruments] = useState([]);
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
  const [formData, setFormData] = useState({
    tagId: "",
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
  });

  // --- FETCH DATA TỪ API ---
  const fetchInstruments = useCallback(
    async (isManual = false) => {
      if (!isManual && isLoading) setIsLoading(true);

      try {
        const params = {
          page: 1,
          limit: 100,
          name: searchQuery.trim() || undefined,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        };

        const response = await instrumentApi.getInstrumentList(params);
        const list =
          response.data?.data?.instruments || response.data?.data || [];
        setInstruments(Array.isArray(list) ? list : []);
        setCurrentPage(1); // Reset to first page when data changes
      } catch (error) {
        console.error("Error fetching instruments:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, statusFilter, typeFilter],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstruments();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, typeFilter, fetchInstruments]);

  // --- COMPUTED STATS ---
  const stats = useMemo(() => {
    const total = instruments.length;
    const active = instruments.filter(
      (i) =>
        i.status?.toLowerCase() === "active" ||
        i.status?.toLowerCase() === "operational",
    ).length;
    const calibrationDue = instruments.filter(
      (i) =>
        i.status?.toLowerCase() === "calibration due" ||
        i.status?.toLowerCase() === "maintenance",
    ).length;
    const faulty = instruments.filter(
      (i) =>
        i.status?.toLowerCase() === "faulty" ||
        i.status?.toLowerCase() === "inactive",
    ).length;
    return { total, active, calibrationDue, faulty };
  }, [instruments]);

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
      case "calibration due":
      case "maintenance":
        return "badge-calibration-due";
      case "faulty":
      case "inactive":
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
      case "calibration due":
      case "maintenance":
        return <FaExclamationTriangle />;
      case "faulty":
      case "inactive":
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("pressure")) return <FaTachometerAlt />;
    if (lowerType.includes("temperature")) return <FaThermometerHalf />;
    if (lowerType.includes("flow")) return <FaWater />;
    if (lowerType.includes("level")) return <FaRulerVertical />;
    return <FaTools />;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving instrument:", formData);
    alert("Add new instrument feature is pending Backend API update!");
    handleCancel();
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      tagId: "",
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
    });
  };

  const handleDeleteClick = (instrument) => {
    setDeleteTarget(instrument);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    console.log("Deleting instrument:", deleteTarget);
    alert("Delete feature is pending Backend API update!");
    setShowDeleteModal(false);
    setDeleteTarget(null);
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
          <button className="btn-create" onClick={() => setShowModal(true)}>
            <FaPlus /> Add Instrument
          </button>
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
              <p className="stat-label">Calibration Due</p>
              <p className="stat-value stat-value-orange">
                {stats.calibrationDue}
              </p>
            </div>
            <div className="stat-icon stat-icon-orange">
              <FaExclamationTriangle />
            </div>
          </div>
          <div
            className="stat-bar stat-bar-orange"
            style={{
              width: `${stats.total ? (stats.calibrationDue / stats.total) * 100 : 0}%`,
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
                <option value="Active">Active</option>
                <option value="Calibration Due">Calibration Due</option>
                <option value="Faulty">Faulty</option>
              </select>
            </div>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Pressure Transmitter">Pressure Transmitter</option>
              <option value="Flow Meter">Flow Meter</option>
              <option value="Temperature Sensor">Temperature Sensor</option>
              <option value="Level Transmitter">Level Transmitter</option>
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
            Showing {instruments.length} result
            {instruments.length !== 1 ? "s" : ""}
            {searchQuery && (
              <span className="filter-tag">Search: "{searchQuery}"</span>
            )}
            {statusFilter && (
              <span className="filter-tag">Status: {statusFilter}</span>
            )}
            {typeFilter && (
              <span className="filter-tag">Type: {typeFilter}</span>
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
                          <button
                            className="btn-create"
                            onClick={() => setShowModal(true)}
                          >
                            <FaPlus /> Add Instrument
                          </button>
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
                          {instrument.tagId ||
                            (instrument.id || instrument._id)?.substring(0, 8)}
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
                            className="btn-icon btn-view"
                            title="View Details"
                            onClick={() =>
                              navigate(
                                `/app/instrument/${instrument.id || instrument._id || instrument.tagId}`,
                              )
                            }
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            title="Edit"
                            onClick={() =>
                              navigate(
                                `/app/instrument/${instrument.id || instrument._id || instrument.tagId}`,
                              )
                            }
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            title="Delete"
                            onClick={() => handleDeleteClick(instrument)}
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

      {/* Add/Edit Instrument Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="modal-content register-instrument-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Register New Instrument</h2>
                <p className="modal-subtitle">
                  Add a new instrument to the registry
                </p>
              </div>
              <button className="modal-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-columns">
                  {/* Basic Information Column */}
                  <div className="form-column">
                    <h3 className="column-title">Basic Information</h3>

                    <div className="form-group">
                      <label>
                        Tag ID <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="tagId"
                        className="form-input"
                        placeholder="e.g., PT-1001"
                        value={formData.tagId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Instrument Type <span className="required">*</span>
                      </label>
                      <select
                        name="instrumentType"
                        className="form-select"
                        value={formData.instrumentType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Pressure Transmitter">
                          Pressure Transmitter
                        </option>
                        <option value="Flow Meter">Flow Meter</option>
                        <option value="Temperature Sensor">
                          Temperature Sensor
                        </option>
                        <option value="Level Transmitter">
                          Level Transmitter
                        </option>
                        <option value="Control Valve">Control Valve</option>
                        <option value="Safety Valve">Safety Valve</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Manufacturer</label>
                      <input
                        type="text"
                        name="manufacturer"
                        className="form-input"
                        placeholder="e.g., Emerson, Siemens"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Model Number</label>
                      <input
                        type="text"
                        name="modelNumber"
                        className="form-input"
                        placeholder="e.g., 3051S"
                        value={formData.modelNumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Serial Number</label>
                      <input
                        type="text"
                        name="serialNumber"
                        className="form-input"
                        placeholder="Enter serial number"
                        value={formData.serialNumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Location <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="form-input"
                        placeholder="e.g., Platform A, Well 3"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Calibration & Specs Column */}
                  <div className="form-column">
                    <h3 className="column-title">
                      Calibration & Specifications
                    </h3>

                    <div className="form-group">
                      <label>Installation Date</label>
                      <input
                        type="date"
                        name="installationDate"
                        className="form-input"
                        value={formData.installationDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Calibration Date</label>
                      <input
                        type="date"
                        name="lastCalibrationDate"
                        className="form-input"
                        value={formData.lastCalibrationDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Calibration Interval (months)</label>
                      <input
                        type="number"
                        name="calibrationInterval"
                        className="form-input"
                        placeholder="e.g., 12"
                        min="1"
                        value={formData.calibrationInterval}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Range Min</label>
                        <input
                          type="number"
                          name="rangeMin"
                          className="form-input"
                          placeholder="0"
                          value={formData.rangeMin}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Range Max</label>
                        <input
                          type="number"
                          name="rangeMax"
                          className="form-input"
                          placeholder="100"
                          value={formData.rangeMax}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit</label>
                        <input
                          type="text"
                          name="unit"
                          className="form-input"
                          placeholder="PSI"
                          value={formData.unit}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description / Notes</label>
                      <textarea
                        name="description"
                        className="form-textarea"
                        placeholder="Additional notes about this instrument..."
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <FaPlus /> Save Instrument
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
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                onClick={handleDeleteConfirm}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
