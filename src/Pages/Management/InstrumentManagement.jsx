import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from "react-icons/fa";

export default function InstrumentManagement() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tagId: "",
    instrumentType: "",
    manufacturer: "",
    modelNumber: "",
    location: "",
    installationDate: "",
    lastCalibrationDate: "",
    calibrationInterval: "",
  });

  const [instruments] = useState([
    {
      id: 1,
      tagId: "PT-100-A",
      name: "Pressure Transmitter",
      location: "Wellhead Platform III",
      manufacturer: "Rosemount 3051S",
      lastCalibrated: "Jan 16, 2024",
      status: "Active",
    },
    {
      id: 2,
      tagId: "FT-009-C",
      name: "Flow Meter",
      location: "Pipeline Section 7",
      manufacturer: "Yokogawa AAF",
      lastCalibrated: "Nov 28, 2023",
      status: "Calibration Due",
    },
    {
      id: 3,
      tagId: "TT-203-B",
      name: "Temperature Sensor",
      location: "Separator Tank A",
      manufacturer: "Honeywell 104723",
      lastCalibrated: "Mar 02, 2024",
      status: "Faulty",
    },
    {
      id: 4,
      tagId: "LT-410-D",
      name: "Level Transmitter",
      location: "Storage Tank A/3",
      manufacturer: "ABB 2600TDR",
      lastCalibrated: "Oct 25, 2023",
      status: "Faulty",
    },
    {
      id: 5,
      tagId: "PT-570-E",
      name: "Differential Pressure",
      location: "Compressor Station",
      manufacturer: "Honeywell 971DT4",
      lastCalibrated: "Jan 20, 2024",
      status: "Active",
    },
    {
      id: 6,
      tagId: "AT-822-F",
      name: "Gas Analyzer",
      location: "Wellhead Platform C",
      manufacturer: "Siemens ULTRAMAT 23",
      lastCalibrated: "Dec 01, 2023",
      status: "Calibration Due",
    },
    {
      id: 7,
      tagId: "VT-725-G",
      name: "Vibration Sensor",
      location: "Turbine Unit 2",
      manufacturer: "SKF Baker CM-200-1",
      lastCalibrated: "Jan 28, 2024",
      status: "Active",
    },
    {
      id: 8,
      tagId: "CT-804-H",
      name: "Conductivity Meter",
      location: "Water Treatment Unit",
      manufacturer: "Emerson 3095",
      lastCalibrated: "Jan 17, 2024",
      status: "Active",
    },
  ]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "badge-active";
      case "Calibration Due":
        return "badge-calibration-due";
      case "Faulty":
        return "badge-faulty";
      default:
        return "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving instrument:", formData);
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
    });
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
    });
  };

  return (
    <div className="instrument-management">
      <div className="page-header">
        <h1>Instrument Registry & Calibration Status</h1>
        <button className="btn-create" onClick={() => setShowModal(true)}>
          <FaPlus /> Add New Instrument
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search by Tag ID..." />
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option>Filter by Status</option>
            <option>Active</option>
            <option>Calibration Due</option>
            <option>Faulty</option>
          </select>
          <select className="filter-select">
            <option>Filter by Type</option>
            <option>Pressure Transmitter</option>
            <option>Flow Meter</option>
            <option>Temperature Sensor</option>
            <option>Level Transmitter</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>TAG ID</th>
              <th>INSTRUMENT NAME/TYPE</th>
              <th>LOCATION</th>
              <th>MANUFACTURER & MODEL</th>
              <th>LAST CALIBRATED</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map((instrument) => (
              <tr key={instrument.id}>
                <td>{instrument.tagId}</td>
                <td>{instrument.name}</td>
                <td>{instrument.location}</td>
                <td>{instrument.manufacturer}</td>
                <td>{instrument.lastCalibrated}</td>
                <td>
                  <span className={`badge ${getStatusClass(instrument.status)}`}>
                    {instrument.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon btn-edit" 
                      title="Edit"
                      onClick={() => navigate(`/app/instrument/${instrument.tagId}`)}
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

      {/* Register New Instrument Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content register-instrument-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Register New Instrument</h2>
              </div>
              <button className="modal-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-columns">
                  <div className="form-column">
                    <h3 className="column-title">General Information</h3>
                    
                    <div className="form-group">
                      <label>Tag ID*</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., FC-02"
                        value={formData.tagId}
                        onChange={(e) =>
                          setFormData({ ...formData, tagId: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Instrument Type*</label>
                      <select
                        className="form-select"
                        value={formData.instrumentType}
                        onChange={(e) =>
                          setFormData({ ...formData, instrumentType: e.target.value })
                        }
                        required
                      >
                        <option value="">Select type...</option>
                        <option value="Pressure Transmitter">Pressure Transmitter</option>
                        <option value="Flow Meter">Flow Meter</option>
                        <option value="Temperature Sensor">Temperature Sensor</option>
                        <option value="Level Transmitter">Level Transmitter</option>
                        <option value="Gas Analyzer">Gas Analyzer</option>
                        <option value="Vibration Sensor">Vibration Sensor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Manufacturer*</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter manufacturer name"
                        value={formData.manufacturer}
                        onChange={(e) =>
                          setFormData({ ...formData, manufacturer: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Model Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter model number"
                        value={formData.modelNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, modelNumber: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-column">
                    <h3 className="column-title">Operational Information</h3>
                    
                    <div className="form-group">
                      <label>Limited Access/Location*</label>
                      <select
                        className="form-select"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        required
                      >
                        <option value="">Select current assignment or area</option>
                        <option value="Wellhead Platform III">Wellhead Platform III</option>
                        <option value="Pipeline Section 7">Pipeline Section 7</option>
                        <option value="Separator Tank A">Separator Tank A</option>
                        <option value="Storage Tank A/3">Storage Tank A/3</option>
                        <option value="Compressor Station">Compressor Station</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Installation Date*</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.installationDate}
                        onChange={(e) =>
                          setFormData({ ...formData, installationDate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Calibration Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.lastCalibrationDate}
                        onChange={(e) =>
                          setFormData({ ...formData, lastCalibrationDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Calibration Interval*</label>
                      <select
                        className="form-select"
                        value={formData.calibrationInterval}
                        onChange={(e) =>
                          setFormData({ ...formData, calibrationInterval: e.target.value })
                        }
                        required
                      >
                        <option value="">Select interval</option>
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="12 months">12 months</option>
                        <option value="24 months">24 months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
