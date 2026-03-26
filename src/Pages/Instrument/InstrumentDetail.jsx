import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCube, FaFileExport, FaSync } from "react-icons/fa";
import adminInstrumentApi from "../../services/adminInstrumentApi";
import maintenanceApi from "../../services/maintenanceApi";
import incidentApi from "../../services/incidentApi";

export default function InstrumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [instrument, setInstrument] = useState(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstrumentDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detailRes, maintenanceRes, incidentRes] = await Promise.allSettled(
        [
          adminInstrumentApi.getById(id),
          maintenanceApi.getByTargetId(id),
          incidentApi.getIncidentsList({ instrumentId: id, limit: 5, page: 1 }),
        ],
      );

      if (detailRes.status === "fulfilled") {
        setInstrument(detailRes.value.data?.data || detailRes.value.data);
      } else {
        throw new Error("Cannot load instrument details.");
      }

      if (maintenanceRes.status === "fulfilled") {
        const records =
          maintenanceRes.value?.data?.records ||
          maintenanceRes.value?.data?.data?.records ||
          maintenanceRes.value?.data?.data ||
          maintenanceRes.value?.data ||
          [];
        setMaintenanceSchedule(
          Array.isArray(records) ? records.slice(0, 5) : [],
        );
      } else {
        setMaintenanceSchedule([]);
      }

      if (incidentRes.status === "fulfilled") {
        const records =
          incidentRes.value?.data?.incidents ||
          incidentRes.value?.data?.data?.incidents ||
          incidentRes.value?.data?.data ||
          incidentRes.value?.data ||
          [];
        setAlerts(Array.isArray(records) ? records.slice(0, 5) : []);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error("Error loading instrument details:", err);
      setError(err.message || "System error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInstrumentDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    if (lowerStatus === "active" || lowerStatus === "operational")
      return "badge-active";
    if (lowerStatus === "faulty") return "badge-faulty";
    return "badge-warning";
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "#64748b" }}>
        <div
          style={{
            fontSize: "40px",
            marginBottom: "16px",
            animation: "spin 1s linear infinite",
          }}
        >
          ⚙️
        </div>
        Loading instrument details...
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "#ef4444" }}>
        <h2>Error</h2>
        <p>{error || "No data found."}</p>
        <button
          className="btn-secondary"
          onClick={() => navigate("/app/instrument")}
          style={{ marginTop: "20px" }}
        >
          Back to list
        </button>
      </div>
    );
  }

  const lastCalibDate =
    instrument.operationalParameters?.calibrationDate ||
    instrument.lastCalibrationDate ||
    instrument.lastCalibrated;
  const nextCalibDate =
    instrument.operationalParameters?.nextCalibrationDate ||
    instrument.nextCalibration ||
    instrument.calibrationDueDate;

  return (
    <div className="instrument-detail-page">
      <div className="detail-header">
        <button
          className="btn-back"
          onClick={() => navigate("/app/instrument")}
        >
          <FaArrowLeft /> Back to Instruments
        </button>

        <div className="instrument-title-section">
          <div className="instrument-title-left">
            <h1>
              {instrument.name || instrument.tagId || "Unknown Instrument"}
            </h1>
            <span className={`badge ${getStatusClass(instrument.status)}`}>
              {instrument.status || "N/A"}
            </span>
          </div>
          <div className="detail-actions">
            <button
              className="btn-secondary"
              onClick={fetchInstrumentDetails}
              title="Reload Data"
            >
              <FaSync />
            </button>
            <button
              className="btn-view-3d"
              onClick={() => navigate(`/app/instrument/${id}/3d-view`)}
            >
              <FaCube /> View in 3D
            </button>
            <button className="btn-export">
              <FaFileExport /> Export Report
            </button>
          </div>
        </div>

        <p className="instrument-subtitle">
          Monitor and manage critical equipment specifications
        </p>
      </div>

      <div className="instrument-content">
        <div className="instrument-left">
          <div className="instrument-card">
            <div className="card-header-with-btn">
              <h3>Instrument Specifications</h3>
              <button className="btn-request-update">Request Update</button>
            </div>

            <div className="spec-grid">
              <div className="spec-item">
                <label>Manufacturer</label>
                <span>{instrument.manufacturer || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Calibrated</label>
                <span
                  className={`badge ${lastCalibDate ? "badge-calibrated" : "badge-warning"}`}
                >
                  {lastCalibDate ? "Calibrated" : "Pending"}
                </span>
              </div>
              <div className="spec-item">
                <label>Model / Rating</label>
                <span>{instrument.model || instrument.modelNumber || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Last Calibrated</label>
                <span>{formatDate(lastCalibDate)}</span>
              </div>
              <div className="spec-item">
                <label>Serial / Tag ID</label>
                <span>
                  {instrument.serial ||
                    instrument.serialNumber ||
                    instrument.tagId ||
                    "-"}
                </span>
              </div>
              <div className="spec-item">
                <label>Next Scheduled Inspection</label>
                <span>{formatDate(nextCalibDate)}</span>
              </div>
              <div className="spec-item">
                <label>Material / Type</label>
                <span>
                  {instrument.type || instrument.instrumentType || "-"}
                </span>
              </div>
              <div className="spec-item">
                <label>Location</label>
                <span>{instrument.location || "-"}</span>
              </div>
              <div className="spec-item spec-item-full">
                <label>Installation Date / Notes</label>
                <span>
                  {formatDate(
                    instrument.installationDate || instrument.createdAt,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="instrument-card">
            <h3>Current Operational Status</h3>

            <div className="status-grid">
              <div className="status-box">
                <label>Equipment Status</label>
                <div className="status-value">
                  <span className="value-large">
                    {instrument.status || "--"}
                  </span>
                  <span
                    className={`badge ${getStatusClass(instrument.status)}`}
                  >
                    {instrument.status || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="status-box">
                <label>Last Calibrated</label>
                <div className="status-value">
                  <span className="value-large">
                    {formatDate(lastCalibDate)}
                  </span>
                </div>
              </div>

              <div className="status-box">
                <label>Next Calibration</label>
                <div className="status-value">
                  <span className="value-large status-success">
                    {formatDate(nextCalibDate)}
                  </span>
                </div>
              </div>

              <div className="status-box">
                <label>Location</label>
                <div className="status-value">
                  <span className="value-large">
                    {instrument.location || "--"}
                  </span>
                </div>
              </div>

              <div className="status-box status-box-full">
                <label>System Telemetry</label>
                <div className="status-value">
                  <span>
                    No telemetry endpoint configured for instrument detail.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="instrument-card">
            <h3>Assigned Equipment</h3>
            <p className="card-subtitle">
              API-linked assets for this instrument
            </p>
            <div className="equipment-list">
              <div className="equipment-item">
                <div className="equipment-icon">🔵</div>
                <div className="equipment-info">
                  <h4>{instrument.name || instrument.tagId || "Instrument"}</h4>
                  <p>{instrument.location || "No location"}</p>
                </div>
                <span className={`badge ${getStatusClass(instrument.status)}`}>
                  {instrument.status || "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="instrument-right">
          <div className="instrument-card">
            <div className="card-header-with-btn">
              <h3>Maintenance Schedule</h3>
            </div>
            <div className="maintenance-list">
              {maintenanceSchedule.length === 0 ? (
                <p style={{ color: "#64748b", fontStyle: "italic" }}>
                  No maintenance records found.
                </p>
              ) : (
                maintenanceSchedule.map((item, index) => (
                  <div key={item._id || index} className="maintenance-item">
                    <div className="maintenance-header">
                      <span className="maintenance-date">
                        {formatDate(
                          item.scheduledDate || item.date || item.createdAt,
                        )}
                      </span>
                      <span
                        className={`badge ${
                          item.status === "Upcoming"
                            ? "badge-upcoming"
                            : item.status === "Delayed"
                              ? "badge-delayed"
                              : "badge-completed"
                        }`}
                      >
                        {item.status || item.type || "Scheduled"}
                      </span>
                    </div>
                    <p className="maintenance-task">
                      {item.description ||
                        item.task ||
                        "No description provided."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="instrument-card">
            <h3>Performance Metrics</h3>
            <div className="metrics-list">
              <div className="metric-item">
                <label>Type</label>
                <div className="metric-value">
                  <span className="metric-percent success">
                    {instrument.type || instrument.instrumentType || "--"}
                  </span>
                </div>
              </div>
              <div className="metric-item">
                <label>Model</label>
                <div className="metric-value">
                  <span>
                    {instrument.model || instrument.modelNumber || "--"}
                  </span>
                </div>
              </div>
              <div className="metric-item">
                <label>Status</label>
                <div className="metric-value">
                  <span className="metric-highlight">
                    {instrument.status || "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="instrument-card">
            <div className="card-header-with-icon">
              <h3>Recent Alerts</h3>
              <span className="alert-count">{alerts.length}</span>
            </div>
            <div className="alerts-list">
              {alerts.length === 0 ? (
                <div className="alert-item alert-info">
                  <div className="alert-icon">🟢</div>
                  <div className="alert-content">
                    <p className="alert-message">
                      No open incidents for this instrument.
                    </p>
                    <span className="alert-time">Loaded from API</span>
                  </div>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert._id || alert.id}
                    className={`alert-item alert-${alert.severity === "critical" ? "error" : "warning"}`}
                  >
                    <div className="alert-icon">
                      {alert.severity === "critical" ? "🔴" : "⚠️"}
                    </div>
                    <div className="alert-content">
                      <p className="alert-message">
                        {alert.description || alert.type || "Incident"}
                      </p>
                      <span className="alert-time">
                        {formatDate(alert.incidentDate || alert.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
