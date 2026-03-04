import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaCheckCircle, FaSync } from "react-icons/fa";
import equipmentApi from "../../services/equipmentApi"; // Đảm bảo đường dẫn chính xác

export default function EquipmentControl() {
  const navigate = useNavigate();

  // States cho dữ liệu API
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // States cho Form Modal
  const [showModal, setShowModal] = useState(false);
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

  // --- FETCH DATA TỪ API ---
  const fetchEquipmentData = useCallback(async (isManual = false) => {
    if (!isManual && isLoading) setIsLoading(true);

    try {
      const response = await equipmentApi.getEquipmentList({
        page: 1,
        limit: 50, // Lấy tối đa 50 thiết bị
        name: searchQuery.trim() || undefined,
      });

      const equipmentList = response.data?.data?.equipment || [];
      setEquipment(equipmentList);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thiết bị:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipmentData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchEquipmentData]);

  // --- HELPERS ---
  const getTypeClass = (type) => {
    const lowerType = type?.toLowerCase() || "";
    switch (lowerType) {
      case "pump":
      case "pumping":
        return "badge-type-pump";
      case "valve":
        return "badge-type-valve";
      case "sensor":
        return "badge-type-sensor";
      default:
        return "badge-type-default";
    }
  };

  const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    switch (lowerStatus) {
      case "operational":
      case "active":
        return "badge-active";
      case "maintenance":
        return "badge-warning";
      case "inactive":
      case "offline":
        return "badge-locked";
      default:
        return "badge-default";
    }
  };

  // --- FORM HANDLERS ---
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving equipment:", formData);
    alert("Tính năng thêm mới (POST) đang chờ Backend cập nhật API!");
    handleCancel();
  };

  const handleCancel = () => {
    setShowModal(false);
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

  return (
    <div className="equipment-control">
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h1>Equipment Management</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-secondary"
            onClick={() => fetchEquipmentData(true)}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            <FaSync className={isLoading ? "spin" : ""} /> Reload
          </button>
          <button className="btn-create" onClick={() => setShowModal(true)}>
            <FaPlus /> Add Equipment
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search equipment by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <div
            style={{
              fontSize: "32px",
              marginBottom: "12px",
              animation: "spin 1s linear infinite",
            }}
          >
            ⚙️
          </div>
          Loading equipment data...
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>EQUIPMENT ID</th>
                <th>NAME</th>
                <th>TYPE</th>
                <th>SERIAL NUMBER</th>
                <th>MANUFACTURER</th>
                <th>INSTALL DATE</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {equipment.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}
                  >
                    Không tìm thấy thiết bị nào.
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr key={item.id || item._id}>
                    <td>
                      <span title={item.id || item._id}>
                        {(item.id || item._id)?.substring(0, 8)}...
                      </span>
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <span className={`badge ${getTypeClass(item.type)}`}>
                        {item.type || "N/A"}
                      </span>
                    </td>
                    <td>{item.serial || "-"}</td>
                    <td>{item.manufacturer || "-"}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{item.location || "-"}</td>
                    <td>
                      <span className={`badge ${getStatusClass(item.status)}`}>
                        {item.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          title="Edit"
                          onClick={() =>
                            navigate(`/app/equipment/${item.id || item._id}`)
                          }
                        >
                          <FaEdit />
                        </button>
                        <button className="btn-icon btn-delete" title="Delete">
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
      )}

      {/* Add New Equipment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="modal-content add-equipment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Add New Equipment</h2>
                <p className="modal-subtitle">Add a new equipment to tracking system</p>
              </div>
              <button className="modal-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="equipment-sections">
                  {/* General Information Section */}
                  <div className="equipment-section">
                    <div className="section-header">
                      <div className="section-icon section-icon-green">1</div>
                      <h3>General Information</h3>
                    </div>

                    <div className="form-group">
                      <label>Equipment Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter equipment name"
                        value={formData.equipmentName}
                        onChange={(e) =>
                          setFormData({ ...formData, equipmentName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Equipment Type</label>
                      <select
                        className="form-select"
                        value={formData.equipmentType}
                        onChange={(e) =>
                          setFormData({ ...formData, equipmentType: e.target.value })
                        }
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Pump">Pump</option>
                        <option value="Valve">Valve</option>
                        <option value="Sensor">Sensor</option>
                        <option value="Compressor">Compressor</option>
                        <option value="Motor">Motor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Serial Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter serial number"
                        value={formData.serialNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, serialNumber: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Model</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter model"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Manufacturer</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. All Manufacturers, Make..."
                        value={formData.manufacturer}
                        onChange={(e) =>
                          setFormData({ ...formData, manufacturer: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Status & Location Section */}
                  <div className="equipment-section">
                    <div className="section-header">
                      <div className="section-icon section-icon-orange">2</div>
                      <h3>Status & Location</h3>
                    </div>

                    <div className="form-group">
                      <label>Equipment Location</label>
                      <select
                        className="form-select"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
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
                      <label>Installation Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.installDate}
                        onChange={(e) =>
                          setFormData({ ...formData, installDate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Current Status</label>
                      <select
                        className="form-select"
                        value={formData.currentStatus}
                        onChange={(e) =>
                          setFormData({ ...formData, currentStatus: e.target.value })
                        }
                        required
                      >
                        <option value="">Select status</option>
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Technical Specification</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Enter technical specification, materials, temperature, ductility, resistance, etc."
                        rows="4"
                        value={formData.technicalSpec}
                        onChange={(e) =>
                          setFormData({ ...formData, technicalSpec: e.target.value })
                        }
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.needsCalibration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              needsCalibration: e.target.checked,
                            })
                          }
                        />
                        <span>
                          Equipment Needs Initial Calibration and Quality Verification
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit btn-submit-green">
                  <FaCheckCircle /> Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}