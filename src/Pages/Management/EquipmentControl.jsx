import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaCheckCircle } from "react-icons/fa";

export default function EquipmentControl() {
  const navigate = useNavigate();
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

  const [equipment] = useState([
    {
      id: "EQ-1001",
      name: "Centrifugal Pump",
      type: "Pump",
      serialNumber: "SN-98432",
      manufacturer: "HydroTech",
      installDate: "2022-01-15",
      location: "Platform X1",
      status: "Active"
    },
    {
      id: "EQ-1002",
      name: "Pressure Valve",
      type: "Valve",
      serialNumber: "SN-87201",
      manufacturer: "ValveCorp",
      installDate: "2022-11-08",
      location: "Well Site A",
      status: "Maintenance"
    },
    {
      id: "EQ-1003",
      name: "Temperature Sensor",
      type: "Sensor",
      serialNumber: "SN-76543",
      manufacturer: "SensorTech",
      installDate: "2023-03-22",
      location: "Pipeline B2",
      status: "Active"
    },
    {
      id: "EQ-1004",
      name: "Hydraulic Pump",
      type: "Pump",
      serialNumber: "SN-65432",
      manufacturer: "HydroTech",
      installDate: "2021-04-16",
      location: "Platform Y3",
      status: "Inactive"
    },
    {
      id: "EQ-1005",
      name: "Control Valve",
      type: "Valve",
      serialNumber: "SN-54321",
      manufacturer: "ValveCorp",
      installDate: "2023-06-30",
      location: "Well Site C",
      status: "Active"
    },
    {
      id: "EQ-1006",
      name: "Flow Sensor",
      type: "Sensor",
      serialNumber: "SN-43210",
      manufacturer: "SensorTech",
      installDate: "2023-10-18",
      location: "Platform Z3",
      status: "Active"
    }
  ]);

  const getTypeClass = (type) => {
    switch(type) {
      case 'Pump': return 'badge-type-pump';
      case 'Valve': return 'badge-type-valve';
      case 'Sensor': return 'badge-type-sensor';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'badge-active';
      case 'Maintenance': return 'badge-warning';
      case 'Inactive': return 'badge-locked';
      default: return '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving equipment:", formData);
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
      <div className="page-header">
        <h1>Equipment Management</h1>
        <button className="btn-create" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Equipment
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search equipment..." />
        </div>
      </div>

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
            {equipment.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  <span className={`badge ${getTypeClass(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td>{item.serialNumber}</td>
                <td>{item.manufacturer}</td>
                <td>{item.installDate}</td>
                <td>{item.location}</td>
                <td>
                  <span className={`badge ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon btn-edit" 
                      title="Edit"
                      onClick={() => navigate(`/app/equipment/${item.id}`)}
                    >
                      <FaEdit />
                    </button>
                    <button className="btn-icon btn-delete" title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Equipment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content add-equipment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Add New Equipment</h2>
                <p className="modal-subtitle">
                  Add a new equipment to tracking system
                </p>
              </div>
              <button className="modal-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="equipment-sections">
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
                        placeholder="Enter technical specification, materials, temperature, ductility, resistance, etc. (e.g., Max current is 80mA)"
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
                            setFormData({ ...formData, needsCalibration: e.target.checked })
                          }
                        />
                        <span>Equipment Needs Initial Calibration and Quality Verification</span>
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
