import { useState, useCallback, useEffect } from "react";
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
  const [randomData, setRandomData] = useState({});

  // Utility functions for random data
  const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const getRandomFloat = (min, max, decimals = 1) => {
    const val = Math.random() * (max - min) + min;
    return val.toFixed(decimals);
  };
  const pickRandom = (arr) => arr[getRandomInt(0, arr.length - 1)];

  // Generate random data for each part
  const generateRandomData = (partName) => {
    // Metrics
    const controlMetrics = [
      {
        label: "Pressure",
        value: getRandomInt(1800, 3500).toLocaleString(),
        unit: "PSI",
        color: "green",
      },
      {
        label: "Flow Rate",
        value: getRandomFloat(120, 180),
        unit: "BPD",
        color: "blue",
      },
      {
        label: "Temperature",
        value: getRandomInt(120, 180),
        unit: "°F",
        color: "orange",
      },
      {
        label: "Depth",
        value: getRandomInt(7000, 9000).toLocaleString(),
        unit: "ft",
        color: "purple",
      },
    ];

    // Kit Output Modules
    const moduleNames = [
      "Downhole Sensor",
      "Flow Meter",
      "Temperature Probe",
      "Pressure Valve",
      "Pump Controller",
    ];
    const kitOutputModules = Array.from({ length: 3 }, (_, i) => {
      const name = pickRandom(moduleNames);
      const status = pickRandom(["active", "warning"]);
      let value;
      if (name.includes("Sensor") || name.includes("Valve")) {
        value = `${getRandomInt(1800, 3500)} PSI`;
      } else if (name.includes("Flow")) {
        value = `${getRandomFloat(120, 180)} BPD`;
      } else if (name.includes("Temperature")) {
        value = `${getRandomInt(120, 180)}°F`;
      } else {
        value = getRandomInt(1, 100).toString();
      }
      return { id: i + 1, name, value, status };
    });

    // Engineers
    const engineerNames = [
      "John Smith",
      "Sarah Chen",
      "Mike Johnson",
      "Emily Davis",
      "Carlos Ruiz",
      "Anna Petrova",
    ];
    const engineerRoles = [
      "Lead Engineer",
      "Field Supervisor",
      "Field Operator",
      "Technician",
    ];
    const engineersList = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: pickRandom(engineerNames),
      role: pickRandom(engineerRoles),
      status: pickRandom(["online", "offline"]),
    }));

    // System Health
    const overall = getRandomInt(80, 100);
    const systemHealthData = {
      overall,
      subsystems: [
        { name: "Sensors", health: getRandomInt(90, 100) },
        { name: "Communication", health: getRandomInt(85, 100) },
        { name: "Power", health: getRandomInt(80, 100) },
      ],
    };

    // Maintenance Alerts
    const alertTypes = ["planned", "inspection", "warning"];
    const alertTitles = [
      "Routine Maintenance Scheduled",
      "Quarterly Inspection",
      "Sensor Calibration Due",
      "Valve Replacement Needed",
      "System Upgrade Scheduled",
    ];
    const maintenanceAlertsList = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      type: pickRandom(alertTypes),
      title: pickRandom(alertTitles),
      date: `Feb ${getRandomInt(10, 28)}, 2026`,
    }));

    // Oil Output
    const oilOutputData = {
      current: getRandomInt(700, 900).toString(),
      currentUnit: "BPD",
      today: getRandomInt(18000, 22000).toLocaleString(),
      todayUnit: "Barrels",
      thisWeek: getRandomInt(120000, 150000).toLocaleString(),
      thisWeekUnit: "Barrels",
      trend: `${pickRandom(["+", "-"])}${getRandomFloat(0.5, 3.5)}%`,
    };

    // Incident Log
    const severities = ["high", "medium", "low"];
    const incidentTypes = [
      "Equipment Malfunction",
      "Routine Alert",
      "Safety Alert",
      "Power Loss",
      "Sensor Fault",
    ];
    const incidentStatuses = ["resolved", "pending"];
    const incidentDescriptions = [
      "Pressure sensor calibration drift detected",
      "Scheduled maintenance reminder",
      "Pressure exceeded threshold",
      "Unexpected power cycle",
      "Sensor reading out of range",
    ];
    const incidentLog = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      date: `Feb ${getRandomInt(10, 28)}, 2026`,
      severity: pickRandom(severities),
      type: pickRandom(incidentTypes),
      description: pickRandom(incidentDescriptions),
      status: pickRandom(incidentStatuses),
    }));

    return {
      controlMetrics,
      kitOutputModules,
      engineersList,
      systemHealthData,
      maintenanceAlertsList,
      oilOutputData,
      incidentLog,
    };
  };

  // On part click, set selected part and generate new random data
  const handlePartClick = useCallback((partName) => {
    setSelectedPart(partName);
    setRandomData(generateRandomData(partName));
  }, []);

  // On initial mount, generate random data for default (null)
  useEffect(() => {
    setRandomData(generateRandomData(null));
  }, []);

  // Get instrument details based on selected part
  const instrumentDetails = getInstrumentData(selectedPart);
  const {
    controlMetrics = [],
    kitOutputModules = [],
    engineersList = [],
    systemHealthData = { overall: 0, subsystems: [] },
    maintenanceAlertsList = [],
    oilOutputData = {},
    incidentLog = [],
  } = randomData;

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
