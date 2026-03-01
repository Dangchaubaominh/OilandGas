import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCube, FaFileExport, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function InstrumentDetail() {
  const navigate = useNavigate();

  const [instrument] = useState({
    id: "INST-2847",
    name: "High-Pressure Valve",
    status: "Active",
    manufacturer: "Emerson Process Management",
    model: "3200 PSI",
    serialNumber: "HPV-2000",
    installationDate: "SN-942-2024-EPM",
    stainlessSteel: "316",
    flowRate: "3,200 GPM",
    lastMaintenance: "78% Open",
    nextMaintenance: "2,450 PSI",
    lastInspection: "8,547 hours",
    calibrationStatus: "9 devices ago",
    operatingHours: "March 15, 2024",
    nextCalibration: "March 15, 2024",
    lastCalibrationDate: "June 2, 2024 • Platform Z2"
  });

  const [equipment] = useState([
    { id: 1, name: "Control Module CM-2826A", location: "Platform Z2, Sector 11A", status: "Active" },
    { id: 2, name: "Pressure Transducer PT-947", location: "Adjacent to control node Z23", status: "Active" },
    { id: 3, name: "Temperature Sensor TS-647", location: "Main pipeline junction Z14", status: "Active" }
  ]);

  const [maintenanceSchedule] = useState([
    { date: "February 18, 2024", task: "Routine calibration and valve servicing", status: "Upcoming" },
    { date: "February 16, 2024", task: "System Leak Testing", status: "Delayed" },
    { date: "February 10, 2024", task: "Lubricate Valve Housing", status: "Completed" }
  ]);

  const [alerts] = useState([
    { id: 1, message: "Slightly elevated RPM", time: "2 days ago", type: "warning" },
    { id: 2, message: "Calibration overdue alert", time: "5 days ago", type: "error" }
  ]);

  return (
    <div className="instrument-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate("/app/instrument")}>
          <FaArrowLeft /> Back to Instruments
        </button>
        
        <div className="instrument-title-section">
          <div className="instrument-title-left">
            <h1>{instrument.name}</h1>
            <span className="badge badge-active">{instrument.status}</span>
          </div>
          <div className="detail-actions">
            <button className="btn-view-3d">
              <FaCube /> View in 3D
            </button>
            <button className="btn-export">
              <FaFileExport /> Export Report
            </button>
          </div>
        </div>

        <p className="instrument-subtitle">Monitor and manage critical equipment specifications</p>
      </div>

      <div className="instrument-content">
        {/* Left Column */}
        <div className="instrument-left">
          {/* Instrument Specifications */}
          <div className="instrument-card">
            <div className="card-header-with-btn">
              <h3>Instrument Specifications</h3>
              <button className="btn-request-update">Request Update</button>
            </div>

            <div className="spec-grid">
              <div className="spec-item">
                <label>Manufacturer</label>
                <span>{instrument.manufacturer}</span>
              </div>
              <div className="spec-item">
                <label>Calibrated</label>
                <span className="badge badge-calibrated">Calibrated</span>
              </div>
              <div className="spec-item">
                <label>Model / Rating</label>
                <span>{instrument.model}</span>
              </div>
              <div className="spec-item">
                <label>Last Calibrated</label>
                <span>March 15, 2024</span>
              </div>
              <div className="spec-item">
                <label>Serial Number</label>
                <span>{instrument.serialNumber}</span>
              </div>
              <div className="spec-item">
                <label>Next Scheduled Inspection</label>
                <span>March 15, 2024</span>
              </div>
              <div className="spec-item">
                <label>Material</label>
                <span>4-inch</span>
              </div>
              <div className="spec-item">
                <label>Installation</label>
                <span>June 2, 2024 • Platform Z2</span>
              </div>
              <div className="spec-item spec-item-full">
                <label>Installation Date / Location</label>
                <span>{instrument.installationDate}</span>
              </div>
            </div>
          </div>

          {/* Current Operational Status */}
          <div className="instrument-card">
            <h3>Current Operational Status</h3>

            <div className="status-grid">
              <div className="status-box">
                <label>Equipment Status</label>
                <div className="status-value">
                  <span className="value-large">78% Open</span>
                  <span className="badge badge-normal">Normal</span>
                </div>
              </div>

              <div className="status-box">
                <label>Current Pressure</label>
                <div className="status-value">
                  <span className="value-large">2,450 PSI</span>
                  <span className="badge badge-normal">Normal</span>
                </div>
              </div>

              <div className="status-box">
                <label>Flow Rate</label>
                <div className="status-value">
                  <span className="value-large status-success">3,200 GPM</span>
                </div>
              </div>

              <div className="status-box">
                <label>Operating Hours</label>
                <div className="status-value">
                  <span className="value-large">8,547 hours</span>
                </div>
              </div>

              <div className="status-box status-box-full">
                <label>Last Maintenance</label>
                <div className="status-value">
                  <span>9 devices ago</span>
                  <span className="text-success">≈ Success 8 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Equipment */}
          <div className="instrument-card">
            <h3>Assigned Equipment</h3>
            <p className="card-subtitle">Connected instrumentation in the system</p>

            <div className="equipment-list">
              {equipment.map((item) => (
                <div key={item.id} className="equipment-item">
                  <div className="equipment-icon">
                    {item.id === 1 ? "🔵" : item.id === 2 ? "🟢" : "🟠"}
                  </div>
                  <div className="equipment-info">
                    <h4>{item.name}</h4>
                    <p>{item.location}</p>
                  </div>
                  <span className="badge badge-active">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="instrument-right">
          {/* Maintenance Schedule */}
          <div className="instrument-card">
            <div className="card-header-with-btn">
              <h3>Maintenance Schedule</h3>
              <button className="btn-view-full">View Full Schedule</button>
            </div>

            <div className="maintenance-list">
              {maintenanceSchedule.map((item, index) => (
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
          <div className="instrument-card">
            <h3>Performance Metrics</h3>

            <div className="metrics-list">
              <div className="metric-item">
                <label>Uptime (24 hrs)</label>
                <div className="metric-value">
                  <span className="metric-percent success">99.8%</span>
                </div>
              </div>

              <div className="metric-item">
                <label>Monthly Cycles</label>
                <div className="metric-value">
                  <span>168,000</span>
                </div>
              </div>

              <div className="metric-item">
                <label>Pressure Dev Trhx</label>
                <div className="metric-value">
                  <span className="metric-highlight">±10psi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="instrument-card">
            <div className="card-header-with-icon">
              <h3>Recent Alerts</h3>
              <span className="alert-count">2</span>
            </div>

            <div className="alerts-list">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                  <div className="alert-icon">
                    {alert.type === 'warning' ? '⚠️' : '🔴'}
                  </div>
                  <div className="alert-content">
                    <p className="alert-message">{alert.message}</p>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
