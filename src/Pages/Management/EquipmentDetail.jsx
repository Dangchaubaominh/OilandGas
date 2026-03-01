import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileAlt, FaFileExport, FaFolder } from "react-icons/fa";

export default function EquipmentDetail() {
  const navigate = useNavigate();

  const [equipment] = useState({
    id: "EID-0492",
    name: "Control Module CM-2847A",
    status: "Active",
    type: "Control Module",
    model: "CM-820-3000",
    serialNumber: "SN-934-2025-ESS",
    manufacturer: "AVEVA MES",
    installDate: "October 15, 2023",
    location: "Platform Z2",
    warranty: "October 15, 2025",
    warrantyStatus: "Active",
    installedSince: "16 Months"
  });

  const [documents] = useState([
    { id: 1, name: "User manual CM-820 v3.1.docx", icon: "blue" },
    { id: 2, name: "Calibration report RCP-2412", icon: "green" },
    { id: 3, name: "Temperature Report CM-31-V3", icon: "orange" }
  ]);

  const [maintenance] = useState([
    { date: "January 12, 2024", task: "Routine Inspection and Calibration", status: "Completed" },
    { date: "January 10, 2024", task: "Software Update", status: "Delayed" },
    { date: "January 6, 2024", task: "Clean and Lubricate", status: "Upcoming" }
  ]);

  return (
    <div className="equipment-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate("/app/equipment")}>
          <FaArrowLeft /> Back to Equipment
        </button>
        
        <div className="equipment-title-section">
          <div className="equipment-title-left">
            <h1>{equipment.name}</h1>
            <span className="badge badge-active">{equipment.status}</span>
          </div>
          <div className="detail-actions">
            <button className="btn-view-diagrams">
              <FaFileAlt /> View Diagrams
            </button>
            <button className="btn-order-report">
              <FaFileExport /> Order Report
            </button>
          </div>
        </div>
      </div>

      <div className="equipment-content">
        {/* Left Column */}
        <div className="equipment-left">
          {/* Equipment Specifications */}
          <div className="equipment-card">
            <div className="card-header-with-btn">
              <h3>Equipment Specifications</h3>
              <button className="btn-request-update">Request Update</button>
            </div>

            <div className="spec-grid">
              <div className="spec-item">
                <label>EID / Equipment ID</label>
                <span>{equipment.id}</span>
              </div>
              <div className="spec-item">
                <label>Install Date</label>
                <span>{equipment.installDate}</span>
              </div>
              <div className="spec-item">
                <label>Equipment Type</label>
                <span>{equipment.type}</span>
              </div>
              <div className="spec-item">
                <label>Location</label>
                <span>{equipment.location}</span>
              </div>
              <div className="spec-item">
                <label>Model / Part No.</label>
                <span>{equipment.model}</span>
              </div>
              <div className="spec-item">
                <label>Warranty Expiry</label>
                <span>{equipment.warranty}</span>
              </div>
              <div className="spec-item">
                <label>Serial Number</label>
                <span>{equipment.serialNumber}</span>
              </div>
              <div className="spec-item">
                <label>Warranty Status</label>
                <span className="badge badge-warranty-active">{equipment.warrantyStatus}</span>
              </div>
              <div className="spec-item">
                <label>Manufacturer</label>
                <span>{equipment.manufacturer}</span>
              </div>
              <div className="spec-item">
                <label>Installed Since</label>
                <span>{equipment.installedSince}</span>
              </div>
            </div>
          </div>

          {/* Operational Status */}
          <div className="equipment-card">
            <h3>Operational Status</h3>

            <div className="status-grid">
              <div className="status-box">
                <label>Operating Status</label>
                <div className="status-value">
                  <span className="value-large status-success">100%</span>
                  <span className="badge badge-normal">Normal</span>
                </div>
              </div>

              <div className="status-box">
                <label>CPU Usage</label>
                <div className="status-value">
                  <span className="value-large">33%</span>
                  <span className="badge badge-normal">Normal</span>
                </div>
              </div>

              <div className="status-box">
                <label>Temperature</label>
                <div className="status-value">
                  <span className="value-large">62°C</span>
                  <span className="badge badge-normal">Normal</span>
                </div>
              </div>

              <div className="status-box">
                <label>Memory</label>
                <div className="status-value">
                  <span className="value-large">54%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Documents */}
          <div className="equipment-card">
            <div className="card-header-with-btn">
              <h3>Linked Documents</h3>
              <button className="btn-browse">
                <FaFolder /> Browse
              </button>
            </div>

            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className={`document-icon document-icon-${doc.icon}`}>
                    <FaFileAlt />
                  </div>
                  <div className="document-info">
                    <span className="document-name">{doc.name}</span>
                  </div>
                  <span className="badge badge-active">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="equipment-right">
          {/* Current Condition */}
          <div className="equipment-card">
            <h3>Current Condition</h3>

            <div className="condition-grid">
              <div className="condition-item">
                <label>Status Online</label>
                <div className="condition-value">
                  <span className="condition-percent success">98%</span>
                </div>
              </div>

              <div className="condition-item">
                <label>Flow Rate</label>
                <div className="condition-value">
                  <span>--</span>
                </div>
              </div>

              <div className="condition-item">
                <label>Last Maintenance</label>
                <div className="condition-value">
                  <span>January 12, 2024</span>
                </div>
              </div>

              <div className="condition-item">
                <label>Next Scheduled</label>
                <div className="condition-value">
                  <span>March 12, 2024</span>
                </div>
              </div>

              <div className="condition-item">
                <label>Age</label>
                <div className="condition-value">
                  <span>16 months</span>
                </div>
              </div>

              <div className="condition-item">
                <label>Total Runtime</label>
                <div className="condition-value">
                  <span>11,520 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Information */}
          <div className="equipment-card">
            <h3>Maintenance Information</h3>

            <div className="maintenance-list">
              {maintenance.map((item, index) => (
                <div key={index} className="maintenance-item">
                  <div className="maintenance-header">
                    <span className="maintenance-date">{item.date}</span>
                    <span className={`badge ${
                      item.status === 'Upcoming' ? 'badge-upcoming' : 
                      item.status === 'Delayed' ? 'badge-delayed' : 
                      'badge-completed'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="maintenance-task">{item.task}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="equipment-card">
            <h3>Performance Metrics</h3>

            <div className="metrics-list">
              <div className="metric-item">
                <label>Uptime</label>
                <div className="metric-value">
                  <span className="metric-percent success">99.8%</span>
                </div>
              </div>

              <div className="metric-item">
                <label>Efficiency</label>
                <div className="metric-value">
                  <span className="metric-percent">94%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="equipment-card">
            <div className="card-header-with-icon">
              <h3>Recent Alerts</h3>
              <span className="alert-count alert-count-info">1</span>
            </div>

            <div className="alerts-list">
              <div className="alert-item alert-info">
                <div className="alert-icon">
                  🟢
                </div>
                <div className="alert-content">
                  <p className="alert-message">No Critical Alerts</p>
                  <span className="alert-time">All systems operating normally</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
