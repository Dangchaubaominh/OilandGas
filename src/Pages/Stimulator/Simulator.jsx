import { useState, useCallback } from "react";
import {
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaWrench,
  FaOilCan,
  FaExclamationCircle,
  FaArrowUp,
  FaTachometerAlt,
  FaThermometerHalf,
  FaWater,
  FaRulerVertical,
} from "react-icons/fa";
import Local3DViewer from "./Local3DViewer";
import { showToast } from "../../utils/toastHandler";

const METRIC_ICONS = {
  Pressure: FaTachometerAlt,
  "Flow Rate": FaWater,
  Temperature: FaThermometerHalf,
  Depth: FaRulerVertical,
};

const SEVERITY_CLASSES = {
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
};

const SEVERITY_BORDER = {
  high: "border-high",
  medium: "border-medium",
  low: "border-low",
};

// --- Hard-coded Instrument Data for Model Parts ---
const INSTRUMENT_DATA = {
  Pillar_1: {
    name: "Support Pillar Alpha",
    type: "Structural Support Column",
    serialNumber: "PIL-2024-A1-0001",
    status: "Active",
    description: "Primary load-bearing structure - Northwest position",
  },
  Pillar_2: {
    name: "Support Pillar Beta",
    type: "Structural Support Column",
    serialNumber: "PIL-2024-B2-0002",
    status: "Active",
    description: "Primary load-bearing structure - Northeast position",
  },
  Pillar_3: {
    name: "Support Pillar Gamma",
    type: "Structural Support Column",
    serialNumber: "PIL-2024-G3-0003",
    status: "Warning",
    description: "Primary load-bearing structure - Southwest position",
  },
  Pillar_4: {
    name: "Support Pillar Delta",
    type: "Structural Support Column",
    serialNumber: "PIL-2024-D4-0004",
    status: "Active",
    description: "Primary load-bearing structure - Southeast position",
  },
  Container_1: {
    name: "Equipment Container A",
    type: "Storage & Processing Unit",
    serialNumber: "CNT-2024-A1-1001",
    status: "Active",
    description: "Houses primary processing equipment and control systems",
  },
  Container_2: {
    name: "Equipment Container B",
    type: "Storage & Utility Unit",
    serialNumber: "CNT-2024-B2-1002",
    status: "Maintenance",
    description: "Secondary storage and utility support systems",
  },
  MainStation: {
    name: "Central Control Hub",
    type: "Main Operations Center",
    serialNumber: "MCS-2024-HQ-0100",
    status: "Active",
    description: "Primary control station for all platform operations",
  },
  Floor: {
    name: "Platform Deck",
    type: "Operational Surface",
    serialNumber: "FLR-2024-DK-0001",
    status: "Active",
    description: "Main deck surface - supports equipment and personnel",
  },
  // Default fallback for unrecognized parts
  default: {
    name: "Unknown Component",
    type: "Unidentified",
    serialNumber: "N/A",
    status: "Unknown",
    description: "Click on a named part to view details",
  },
};

// Helper function to get instrument data by part name (case-insensitive matching)
const getInstrumentData = (partName) => {
  if (!partName) return INSTRUMENT_DATA.default;

  // Try exact match first
  if (INSTRUMENT_DATA[partName]) return INSTRUMENT_DATA[partName];

  // Try case-insensitive matching
  const normalizedName = partName.toLowerCase();
  for (const key of Object.keys(INSTRUMENT_DATA)) {
    if (key.toLowerCase() === normalizedName) {
      return INSTRUMENT_DATA[key];
    }
    // Also check if the part name contains the key
    if (normalizedName.includes(key.toLowerCase().replace("_", ""))) {
      return INSTRUMENT_DATA[key];
    }
  }

  // Check for partial matches (e.g., "Pillar1" matches "Pillar_1")
  if (normalizedName.includes("pillar")) {
    const pillarNum = normalizedName.match(/\d+/);
    if (pillarNum) {
      const key = `Pillar_${pillarNum[0]}`;
      if (INSTRUMENT_DATA[key]) return INSTRUMENT_DATA[key];
    }
  }
  if (normalizedName.includes("container")) {
    const containerNum = normalizedName.match(/\d+/);
    if (containerNum) {
      const key = `Container_${containerNum[0]}`;
      if (INSTRUMENT_DATA[key]) return INSTRUMENT_DATA[key];
    }
  }
  if (normalizedName.includes("main") || normalizedName.includes("station")) {
    return INSTRUMENT_DATA.MainStation;
  }
  if (normalizedName.includes("floor") || normalizedName.includes("deck")) {
    return INSTRUMENT_DATA.Floor;
  }

  return INSTRUMENT_DATA.default;
};

export default function Simulator() {
  const [selectedPart, setSelectedPart] = useState(null);

  const handlePartClick = useCallback((partName) => {
    setSelectedPart(partName);
  }, []);

  // Get instrument details based on selected part
  const instrumentDetails = getInstrumentData(selectedPart);

  const controlMetrics = [
    { label: "Pressure", value: "2,345", unit: "PSI", color: "green" },
    { label: "Flow Rate", value: "145", unit: "BPD", color: "blue" },
    { label: "Temperature", value: "156", unit: "°F", color: "orange" },
    { label: "Depth", value: "8,240", unit: "ft", color: "purple" },
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
    current: "847",
    currentUnit: "BPD",
    today: "20,328",
    todayUnit: "Barrels",
    thisWeek: "142,296",
    thisWeekUnit: "Barrels",
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
        {/* ===== Main 3D Viewport ===== */}
        <div className="simulator-main">
          <div className="simulator-header">
            <div className="simulator-header-left">
              <h1>3D Instrument Simulator</h1>
              <div className="simulator-info">
                <span className="info-badge">
                  Well ID: <strong>WELL-X2-2024</strong>
                </span>
                <span className="info-badge">
                  Location: <strong>Platform A-12</strong>
                </span>
                {selectedPart && (
                  <span className="info-badge info-badge-active">
                    Selected: <strong>{selectedPart}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="simulator-viewport">
            <Local3DViewer
              modelPath="/models/OilandGasStation.glb"
              onPartSelect={handlePartClick}
              selectedPart={selectedPart}
            />
          </div>
        </div>

        {/* ===== Right Sidebar ===== */}
        <div className="simulator-sidebar">
          {/* Instrument Details */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">Instrument Details</h3>
            <div className="sim-detail-grid">
              <div className="sim-detail-item">
                <label>Name</label>
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
                <span
                  className={`badge-${instrumentDetails.status.toLowerCase()}`}
                >
                  {instrumentDetails.status}
                </span>
              </div>
              {instrumentDetails.description && (
                <div className="sim-detail-item sim-detail-full">
                  <label>Description</label>
                  <span>{instrumentDetails.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Control Metrics */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">Equipment Control Panel</h3>
            <div className="control-metrics">
              {controlMetrics.map((metric, idx) => {
                const Icon = METRIC_ICONS[metric.label];
                return (
                  <div
                    key={idx}
                    className={`metric-card metric-${metric.color}`}
                  >
                    <div className="metric-icon">{Icon && <Icon />}</div>
                    <div className="metric-body">
                      <div className="metric-label">{metric.label}</div>
                      <div className="metric-value">
                        {metric.value} <small>{metric.unit}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kit Output Modules */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">Kit Output Modules</h3>
            <div className="modules-list">
              {kitOutputModules.map((mod) => (
                <div key={mod.id} className="module-item">
                  <div className="module-info">
                    <h4>{mod.name}</h4>
                    <p>{mod.value}</p>
                  </div>
                  <span className={`module-status module-status-${mod.status}`}>
                    {mod.status === "active" ? (
                      <FaCheckCircle />
                    ) : (
                      <FaExclamationTriangle />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Oil Output */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">
              <FaOilCan className="panel-icon" /> Oil Output
            </h3>
            <div className="oil-output-grid">
              <div className="output-stat output-stat-highlight">
                <label>Current Rate</label>
                <div className="output-value-large">
                  {oilOutputData.current}
                </div>
                <div className="output-unit">{oilOutputData.currentUnit}</div>
              </div>
              <div className="output-stat">
                <label>Today</label>
                <div className="output-value">{oilOutputData.today}</div>
                <div className="output-unit">{oilOutputData.todayUnit}</div>
              </div>
              <div className="output-stat">
                <label>This Week</label>
                <div className="output-value">{oilOutputData.thisWeek}</div>
                <div className="output-unit">{oilOutputData.thisWeekUnit}</div>
              </div>
              <div className="output-stat">
                <label>Weekly Trend</label>
                <div className="output-value output-trend-up">
                  <FaArrowUp /> {oilOutputData.trend}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Engineers */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">
              <FaUser className="panel-icon" /> Assigned Engineers
            </h3>
            <div className="engineers-list">
              {engineersList.map((engineer) => (
                <div key={engineer.id} className="engineer-item">
                  <div className="engineer-info">
                    <div className="engineer-avatar">
                      <FaUser />
                      <span
                        className={`status-dot ${engineer.status === "online" ? "online" : "offline"}`}
                      />
                    </div>
                    <div>
                      <h4>{engineer.name}</h4>
                      <p>{engineer.role}</p>
                    </div>
                  </div>
                  <button className="btn-contact">Contact</button>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Log */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">
              <FaExclamationCircle className="panel-icon" /> Incident Log
            </h3>
            <div className="incident-list">
              {incidentLog.map((incident) => (
                <div
                  key={incident.id}
                  className={`incident-item ${SEVERITY_BORDER[incident.severity]}`}
                >
                  <div className="incident-header">
                    <span
                      className={`incident-severity ${SEVERITY_CLASSES[incident.severity]}`}
                    >
                      {incident.severity.toUpperCase()}
                    </span>
                    <span
                      className={`incident-status status-${incident.status}`}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <div className="incident-type">{incident.type}</div>
                  <div className="incident-desc">{incident.description}</div>
                  <div className="incident-date">{incident.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">System Health Monitor</h3>
            <div className="health-overview">
              <div className="health-circle">
                <svg viewBox="0 0 36 36" className="health-ring">
                  <path
                    className="health-ring-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="health-ring-fill"
                    strokeDasharray={`${systemHealthData.overall}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="health-value">{systemHealthData.overall}%</div>
              </div>
              <div className="health-subsystems">
                {systemHealthData.subsystems.map((sub, idx) => (
                  <div key={idx} className="subsystem-row">
                    <div className="subsystem-header">
                      <span>{sub.name}</span>
                      <span>{sub.health}%</span>
                    </div>
                    <div className="subsystem-bar">
                      <div
                        className={`subsystem-fill ${sub.health >= 95 ? "fill-green" : sub.health >= 90 ? "fill-blue" : "fill-orange"}`}
                        style={{ width: `${sub.health}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Maintenance Alerts */}
          <div className="sim-panel">
            <h3 className="sim-panel-title">
              <FaWrench className="panel-icon" /> Maintenance Alerts
            </h3>
            <div className="maintenance-list">
              {maintenanceAlertsList.map((alert) => (
                <div
                  key={alert.id}
                  className={`maintenance-item maintenance-${alert.type}`}
                >
                  <div className="maintenance-info">
                    <h4>{alert.title}</h4>
                    <p>{alert.date}</p>
                  </div>
                  <span className={`maintenance-badge badge-${alert.type}`}>
                    {alert.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
