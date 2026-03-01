import { useState } from "react";
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaCog,
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaWrench,
  FaOilCan,
  FaExclamationCircle,
  FaArrowUp,
} from "react-icons/fa";
import OilWellOptimized from "../../components/OilWellOptimized";

export default function Simulator() {
  const [isRunning, setIsRunning] = useState(false);

  // Static data only - no API calls
  const instrumentDetails = {
    name: "Well Monitor X-2",
    type: "Pressure & Flow Monitor",
    serialNumber: "WM-2024-X2-4507",
    status: "Active",
  };

  const controlMetrics = [
    { label: "Pressure", value: "2,345 PSI", color: "green" },
    { label: "Flow Rate", value: "145 BPD", color: "blue" },
    { label: "Temperature", value: "156°F", color: "orange" },
    { label: "Depth", value: "8,240 ft", color: "purple" },
  ];

  const kitOutputModules = [
    { id: 1, name: "Downhole Sensor", value: "2,350 PSI", status: "active" },
    { id: 2, name: "Flow Meter", value: "147.2 BPD", status: "active" },
    { id: 3, name: "Temperature Probe", value: "158°F", status: "warning" },
  ];

  const engineersList = [
    { id: 1, name: "John Smith", role: "Lead Engineer", status: "online" },
    { id: 2, name: "Sarah Chen", role: "Field Supervisor", status: "online" },
    { id: 3, name: "Mike Johnson", role: "Field Operator", status: "offline" },
  ];

  const systemHealthData = {
    overall: 94,
    subsystems: [
      { name: "Sensors", health: 98 },
      { name: "Communication", health: 95 },
      { name: "Power", health: 89 },
    ],
  };

  const maintenanceAlertsList = [
    {
      id: 1,
      type: "planned",
      title: "Routine Maintenance Scheduled",
      date: "Feb 15, 2026",
    },
    {
      id: 2,
      type: "inspection",
      title: "Quarterly Inspection",
      date: "Feb 20, 2026",
    },
    {
      id: 3,
      type: "warning",
      title: "Sensor Calibration Due",
      date: "Feb 10, 2026",
    },
  ];

  const oilOutputData = {
    current: "847 BPD",
    today: "20,328 Barrels",
    thisWeek: "142,296 Barrels",
    trend: "+2.3%",
  };

  const incidentLog = [
    {
      id: 1,
      date: "Feb 20, 2026",
      severity: "medium",
      type: "Equipment Malfunction",
      description: "Pressure sensor calibration drift detected",
      status: "resolved",
    },
    {
      id: 2,
      date: "Feb 18, 2026",
      severity: "low",
      type: "Routine Alert",
      description: "Scheduled maintenance reminder",
      status: "pending",
    },
    {
      id: 3,
      date: "Feb 15, 2026",
      severity: "high",
      type: "Safety Alert",
      description: "Pressure exceeded threshold",
      status: "resolved",
    },
  ];

  return (
    <div className="simulator-page">
      <div className="simulator-layout">
        {/* Main 3D View */}
        <div className="simulator-main">
          <div className="simulator-header">
            <h1>3D Instrument Simulator</h1>
            <div className="simulator-info">
              <span className="info-label">
                Well ID: <strong>WELL-X2-2024</strong>
              </span>
              <span className="info-label">
                Location: <strong>Platform A-12</strong>
              </span>
            </div>
            <div className="simulator-controls">
              <button
                className={`btn-sim-control ${isRunning ? "btn-pause" : "btn-play"}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <FaPause /> Pause
                  </>
                ) : (
                  <>
                    <FaPlay /> Start
                  </>
                )}
              </button>
              <button
                className="btn-sim-control btn-reset"
                onClick={() => setIsRunning(false)}
              >
                <FaRedo /> Reset
              </button>
              <button className="btn-sim-control btn-settings">
                <FaCog /> Settings
              </button>
            </div>
          </div>

          <div
            className="simulator-viewport"
            style={{ position: "relative", zIndex: 50 }}
          >
            <OilWellOptimized isRunning={isRunning} />
          </div>

          <div className="simulator-timeline">
            <div className="timeline-label">Simulation Time: 00:00:00</div>
            <div className="timeline-bar">
              <div className="timeline-progress" style={{ width: "0%" }}></div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="simulator-sidebar">
          {/* Instrument Details */}
          <div className="sim-panel">
            <h3>Instrument Details</h3>
            <div className="sim-detail-grid">
              <div className="sim-detail-item">
                <label>Instrument Name</label>
                <span>{instrumentDetails.name}</span>
              </div>
              <div className="sim-detail-item">
                <label>Type</label>
                <span>{instrumentDetails.type}</span>
              </div>
              <div className="sim-detail-item">
                <label>Serial Number</label>
                <span>{instrumentDetails.serialNumber}</span>
              </div>
              <div className="sim-detail-item">
                <label>Status</label>
                <span className="badge-active">{instrumentDetails.status}</span>
              </div>
            </div>
          </div>

          {/* Equipment Control Panel */}
          <div className="sim-panel">
            <h3>Equipment Control Panel</h3>
            <div className="control-metrics">
              {controlMetrics.map((metric, idx) => (
                <div key={idx} className={`metric-card metric-${metric.color}`}>
                  <div className="metric-label">{metric.label}</div>
                  <div className="metric-value">{metric.value}</div>
                </div>
              ))}
            </div>
            <button className="btn-initialize">
              <FaPlay /> Initialize
            </button>
          </div>

          {/* Kit Output Modules */}
          <div className="sim-panel">
            <h3>Kit Output Modules</h3>
            <div className="modules-list">
              {kitOutputModules.map((module) => (
                <div key={module.id} className="module-item">
                  <div className="module-info">
                    <h4>{module.name}</h4>
                    <p>{module.value}</p>
                  </div>
                  <span className={`module-status status-${module.status}`}>
                    {module.status === "active" ? (
                      <FaCheckCircle />
                    ) : (
                      <FaExclamationTriangle />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Oil Output Monitoring */}
          <div className="sim-panel">
            <h3>
              <FaOilCan /> Oil Output
            </h3>
            <div className="oil-output-grid">
              <div className="output-stat">
                <label>Current Rate</label>
                <div className="output-value primary">
                  {oilOutputData.current}
                </div>
              </div>
              <div className="output-stat">
                <label>Today's Production</label>
                <div className="output-value">{oilOutputData.today}</div>
              </div>
              <div className="output-stat">
                <label>This Week</label>
                <div className="output-value">{oilOutputData.thisWeek}</div>
              </div>
              <div className="output-stat">
                <label>Weekly Trend</label>
                <div className="output-value trend-positive">
                  <FaArrowUp /> {oilOutputData.trend}
                </div>
              </div>
            </div>
            <button className="btn-view-full">View Full Report</button>
          </div>

          {/* Assigned Engineers */}
          <div className="sim-panel">
            <h3>
              <FaUser /> Assigned Engineers
            </h3>
            <div className="engineers-list">
              {engineersList.map((engineer) => (
                <div key={engineer.id} className="engineer-item">
                  <div className="engineer-avatar">
                    <FaUser />
                    <span
                      className={`status-indicator status-${engineer.status}`}
                    ></span>
                  </div>
                  <div className="engineer-info">
                    <h4>{engineer.name}</h4>
                    <p>{engineer.role}</p>
                  </div>
                  <button className="btn-contact">Contact</button>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Log */}
          <div className="sim-panel">
            <h3>
              <FaExclamationCircle /> Incident Log
            </h3>
            <div className="incident-list">
              {incidentLog.map((incident) => (
                <div
                  key={incident.id}
                  className={`incident-item severity-${incident.severity}`}
                >
                  <div className="incident-header">
                    <span className={`severity-badge ${incident.severity}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="incident-date">{incident.date}</span>
                  </div>
                  <div className="incident-type">{incident.type}</div>
                  <div className="incident-desc">{incident.description}</div>
                  <div className="incident-footer">
                    <span className={`status-tag status-${incident.status}`}>
                      {incident.status}
                    </span>
                    <button className="btn-view-incident">Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Monitor */}
          <div className="sim-panel">
            <h3>System Health Monitor</h3>
            <div className="health-overall">
              <div className="health-circle">
                <div className="health-percentage">
                  {systemHealthData.overall}%
                </div>
                <div className="health-label">Overall Health</div>
              </div>
            </div>
            <div className="health-subsystems">
              {systemHealthData.subsystems.map((subsystem, idx) => (
                <div key={idx} className="subsystem-item">
                  <span className="subsystem-name">{subsystem.name}</span>
                  <div className="subsystem-bar">
                    <div
                      className="subsystem-fill"
                      style={{ width: `${subsystem.health}%` }}
                    ></div>
                  </div>
                  <span className="subsystem-percent">{subsystem.health}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Alerts */}
          <div className="sim-panel">
            <h3>Maintenance Alerts / Planned</h3>
            <div className="alerts-list-sim">
              {maintenanceAlertsList.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert-item-sim alert-${alert.type}`}
                >
                  <div className="alert-icon-sim">
                    <FaWrench />
                  </div>
                  <div className="alert-content-sim">
                    <h4>{alert.title}</h4>
                    <p>{alert.date}</p>
                  </div>
                  <button className="btn-view-sim">View</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
