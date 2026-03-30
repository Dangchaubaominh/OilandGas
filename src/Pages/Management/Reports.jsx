import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function Reports() {
  const [incidents] = useState([
    {
      id: "INC-0683-001",
      date: "Jan 31, 2025",
      time: "09:45 PM",
      severity: "Critical",
      type: "Pressure",
      description: "Hydraulic pressure exceeded 3400 psi",
      actionsTaken: "Emergency shutdown initiated",
    },
    {
      id: "INC-0542-001",
      date: "Jan 31, 2025",
      time: "08:12 PM",
      severity: "Warning",
      type: "Leak",
      description: "Minor gas leak detected in Valve 11",
      actionsTaken: "Valve replacement scheduled",
    },
    {
      id: "INC-0521-002",
      date: "Jan 30, 2025",
      time: "11:30 AM",
      severity: "Critical",
      type: "Equipment Failure",
      description: "Compressor #2 unexpected shutdown",
      actionsTaken: "Maintenance dispatched for repair",
    },
    {
      id: "INC-0503-004",
      date: "Jan 29, 2025",
      time: "02:45 PM",
      severity: "Critical",
      type: "Equipment Failure",
      description: "Compressor failure at Platform Alpha",
      actionsTaken: "Service contractor dispatched immediately",
    },
    {
      id: "INC-0101-015",
      date: "Jan 28, 2025",
      time: "07:20 AM",
      severity: "Warning",
      type: "Pressure",
      description: "Abnormal pressure fluctuation in Line E",
      actionsTaken: "Pressure relief valve calibration scheduled",
    },
    {
      id: "INC-0093-006",
      date: "Jan 28, 2025",
      time: "01:15 PM",
      severity: "Low",
      type: "Leak",
      description: "Small oil spill detected at Pump-C",
      actionsTaken: "Spill contained and cleaned up",
    },
    {
      id: "INC-0042-007",
      date: "Jan 27, 2025",
      time: "06:50 PM",
      severity: "Warning",
      type: "Equipment Failure",
      description: "SCADA data connection lost for 15 mins",
      actionsTaken: "Connection restored, investigating root cause",
    },
    {
      id: "INC-0002-008",
      date: "Jan 26, 2025",
      time: "03:30 AM",
      severity: "Critical",
      type: "Leak",
      description: "Gas tank ruptured valve at Site D",
      actionsTaken: "Site evacuated and emergency team dispatched",
    },
  ]);

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "severity-critical";
      case "Warning":
        return "severity-warning";
      case "Low":
        return "severity-low";
      default:
        return "";
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Incident Logs</h1>
          <p className="page-subtitle">Incidents that happen in real time and sorted by...</p>
        </div>
        <button className="btn-create">
          <FaPlus /> Create Incident
        </button>
      </div>

      <div className="reports-filters">
        <div className="date-range-filter">
          <input type="date" className="filter-input" defaultValue="2025-01-01" />
          <span className="date-separator">-</span>
          <input type="date" className="filter-input" defaultValue="2025-01-31" />
        </div>
        <select className="filter-select">
          <option>All Severities</option>
          <option>Critical</option>
          <option>Warning</option>
          <option>Low</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>INCIDENT ID</th>
              <th>DATE/TIME (LOGGED)</th>
              <th>SEVERITY</th>
              <th>TYPE</th>
              <th>DESCRIPTION</th>
              <th>ACTIONS TAKEN</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>
                  <div className="datetime-cell">
                    <span>{incident.date}</span>
                    <span className="time-text">{incident.time}</span>
                  </div>
                </td>
                <td>
                  <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </td>
                <td>{incident.type}</td>
                <td>{incident.description}</td>
                <td className="actions-cell">{incident.actionsTaken}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
