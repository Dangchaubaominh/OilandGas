import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCube, FaFileExport, FaSync, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import instrumentApi from "../../services/instrumentApi"; 

export default function InstrumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATES CHO API ---
  const [instrument, setInstrument] = useState(null);
  const [simulatorInfo, setSimulatorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- MOCK DATA (Giữ tạm chờ Backend có API) ---
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

  // --- FETCH DATA ---
  const fetchInstrumentDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi song song 2 API bằng Promise.allSettled
      const [detailRes, infoRes] = await Promise.allSettled([
        instrumentApi.getInstrumentDetail(id),
        instrumentApi.getInstrument3DInfo(id)
      ]);

      // Xử lý dữ liệu Chi tiết
      if (detailRes.status === "fulfilled") {
        setInstrument(detailRes.value.data?.data || detailRes.value.data);
      } else {
        throw new Error("Không thể tải thông tin Instrument.");
      }

      // Xử lý dữ liệu 3D Simulator (Thông số Live)
      if (infoRes.status === "fulfilled") {
        setSimulatorInfo(infoRes.value.data?.data || infoRes.value.data);
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết Instrument:", err);
      setError(err.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInstrumentDetails();
  }, [id]);

  // --- HELPERS ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    if (lowerStatus === "active" || lowerStatus === "operational") return "badge-active";
    if (lowerStatus === "faulty") return "badge-faulty";
    return "badge-warning";
  };

  // --- RENDER TRẠNG THÁI LOADING/ERROR ---
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "#64748b" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px", animation: "spin 1s linear infinite" }}>⚙️</div>
        Loading instrument details...
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "#ef4444" }}>
        <h2>Lỗi!</h2>
        <p>{error || "Không tìm thấy dữ liệu."}</p>
        <button className="btn-secondary" onClick={() => navigate("/app/instrument")} style={{ marginTop: "20px" }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="instrument-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate("/app/instrument")}>
          <FaArrowLeft /> Back to Instruments
        </button>
        
        <div className="instrument-title-section">
          <div className="instrument-title-left">
            <h1>{instrument.name || instrument.tagId || "Unknown Instrument"}</h1>
            <span className={`badge ${getStatusClass(instrument.status)}`}>
              {instrument.status || "N/A"}
            </span>
          </div>
          <div className="detail-actions">
            <button className="btn-secondary" onClick={fetchInstrumentDetails} title="Reload Data">
              <FaSync />
            </button>
            <button className="btn-view-3d" onClick={() => navigate(`/app/instrument/${id}/3d-view`)}>
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
                <span>{instrument.manufacturer || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Calibrated</label>
                <span className={`badge ${instrument.lastCalibrated ? 'badge-calibrated' : 'badge-warning'}`}>
                  {instrument.lastCalibrated ? "Calibrated" : "Pending"}
                </span>
              </div>
              <div className="spec-item">
                <label>Model / Rating</label>
                <span>{instrument.model || instrument.modelNumber || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Last Calibrated</label>
                <span>{formatDate(instrument.lastCalibrated)}</span>
              </div>
              <div className="spec-item">
                <label>Serial / Tag ID</label>
                <span>{instrument.serialNumber || instrument.tagId || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Next Scheduled Inspection</label>
                <span>{formatDate(instrument.nextCalibration || instrument.calibrationDueDate)}</span>
              </div>
              <div className="spec-item">
                <label>Material / Type</label>
                <span>{instrument.type || instrument.instrumentType || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Location</label>
                <span>{instrument.location || "-"}</span>
              </div>
              <div className="spec-item spec-item-full">
                <label>Installation Date / Notes</label>
                <span>{formatDate(instrument.installationDate || instrument.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Current Operational Status (Mapping with simulatorInfo) */}
          <div className="instrument-card">
            <h3>Current Operational Status</h3>

            <div className="status-grid">
              <div className="status-box">
                <label>Equipment Status</label>
                <div className="status-value">
                  <span className="value-large">{simulatorInfo?.openPercentage || "--"}% Open</span>
                  <span className={`badge ${simulatorInfo?.status === 'Faulty' ? 'badge-faulty' : 'badge-normal'}`}>
                    {simulatorInfo?.status || "Normal"}
                  </span>
                </div>
              </div>

              <div className="status-box">
                <label>Current Pressure</label>
                <div className="status-value">
                  <span className="value-large">{simulatorInfo?.pressure || "--"} PSI</span>
                  <span className="badge badge-normal">Normal</span>
                </div>
              </div>

              <div className="status-box">
                <label>Flow Rate</label>
                <div className="status-value">
                  <span className="value-large status-success">{simulatorInfo?.flowRate || "--"} GPM</span>
                </div>
              </div>

              <div className="status-box">
                <label>Operating Hours</label>
                <div className="status-value">
                  <span className="value-large">{simulatorInfo?.operatingHours || "--"} hours</span>
                </div>
              </div>

              <div className="status-box status-box-full">
                <label>Last Maintenance</label>
                <div className="status-value">
                  <span>{simulatorInfo?.maintenanceInfo || "Data unavailable"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Equipment (Mock Data) */}
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
          {/* Maintenance Schedule (Mock Data) */}
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

          {/* Performance Metrics (Mock/Simulator Data) */}
          <div className="instrument-card">
            <h3>Performance Metrics</h3>
            <div className="metrics-list">
              <div className="metric-item">
                <label>Uptime (24 hrs)</label>
                <div className="metric-value">
                  <span className="metric-percent success">{simulatorInfo?.uptime || "99.8"}%</span>
                </div>
              </div>
              <div className="metric-item">
                <label>Monthly Cycles</label>
                <div className="metric-value">
                  <span>{simulatorInfo?.monthlyCycles || "168,000"}</span>
                </div>
              </div>
              <div className="metric-item">
                <label>Pressure Dev Trhx</label>
                <div className="metric-value">
                  <span className="metric-highlight">{simulatorInfo?.pressureDev || "±10"}psi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts (Mock Data) */}
          <div className="instrument-card">
            <div className="card-header-with-icon">
              <h3>Recent Alerts</h3>
              <span className="alert-count">{alerts.length}</span>
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