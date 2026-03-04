import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileAlt, FaFileExport, FaFolder, FaSync } from "react-icons/fa";
import equipmentApi from "../../services/e";
quipmentApi
export default function EquipmentDetail() {
  const { id } = useParams(); // Lấy ID thiết bị từ URL (ví dụ: /app/equipment/123)
  const navigate = useNavigate();

  // State quản lý dữ liệu từ API
  const [equipment, setEquipment] = useState(null);
  const [controlInfo, setControlInfo] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  
  // State quản lý trạng thái tải
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dữ liệu tạm cho các phần Backend chưa có API (Tài liệu, Metric)
  const [documents] = useState([
    { id: 1, name: "User manual v3.1.docx", icon: "blue" },
    { id: 2, name: "Calibration report", icon: "green" },
  ]);

  // Hàm gọi API đồng thời
  const fetchEquipmentDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi cả 3 API cùng lúc bằng Promise.all để tăng tốc độ load
      const [equipRes, controlRes, maintenanceRes] = await Promise.allSettled([
        equipmentApi.getEquipmentDetail(id),
        equipmentApi.getControlInformation(id),
        equipmentApi.getEquipmentMaintenanceHistory(id)
      ]);

      // Xử lý dữ liệu Chi tiết thiết bị (Bắt buộc)
      if (equipRes.status === "fulfilled") {
        setEquipment(equipRes.value.data?.data || equipRes.value.data);
      } else {
        throw new Error("Không thể tải thông tin thiết bị");
      }

      // Xử lý dữ liệu Control (Bỏ qua nếu lỗi, vì có thể thiết bị không có dữ liệu live)
      if (controlRes.status === "fulfilled") {
        setControlInfo(controlRes.value.data?.data || controlRes.value.data);
      }

      // Xử lý dữ liệu Maintenance
      if (maintenanceRes.status === "fulfilled") {
        setMaintenanceHistory(maintenanceRes.value.data?.data || []);
      }

    } catch (err) {
      console.error("Lỗi khi tải chi tiết thiết bị:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEquipmentDetails();
    }
  }, [id]);

  // --- HELPERS ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Tính thời gian cài đặt (Age)
  const calculateAge = (dateString) => {
    if (!dateString) return "-";
    const installDate = new Date(dateString);
    const now = new Date();
    const months = (now.getFullYear() - installDate.getFullYear()) * 12 + (now.getMonth() - installDate.getMonth());
    return `${months} Months`;
  };

  // Render trạng thái (Loading/Error)
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "#64748b" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px", animation: "spin 1s linear infinite" }}>⚙️</div>
        Loading equipment details...
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "#ef4444" }}>
        <h2>Lỗi!</h2>
        <p>{error || "Không tìm thấy thiết bị."}</p>
        <button className="btn-secondary" onClick={() => navigate("/app/equipment")} style={{ marginTop: "20px" }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Bắt đầu render giao diện với dữ liệu thực
  return (
    <div className="equipment-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate("/app/equipment")}>
          <FaArrowLeft /> Back to Equipment
        </button>
        
        <div className="equipment-title-section">
          <div className="equipment-title-left">
            <h1>{equipment.name || "Unknown Equipment"}</h1>
            <span className={`badge ${equipment.status?.toLowerCase() === 'operational' ? 'badge-active' : 'badge-warning'}`}>
              {equipment.status || "N/A"}
            </span>
          </div>
          <div className="detail-actions">
            {/* Nút Refresh dữ liệu Live */}
            <button className="btn-secondary" onClick={fetchEquipmentDetails} style={{ marginRight: '10px' }}>
              <FaSync />
            </button>
            <button className="btn-view-diagrams" onClick={() => navigate(`/app/equipment/${id}/3d-view`)}>
              <FaFileAlt /> View 3D Model
            </button>
            <button className="btn-order-report">
              <FaFileExport /> Export Report
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
            </div>

            <div className="spec-grid">
              <div className="spec-item">
                <label>Equipment ID</label>
                <span>{equipment.id || equipment._id?.substring(0,8) || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Install Date</label>
                <span>{formatDate(equipment.createdAt)}</span>
              </div>
              <div className="spec-item">
                <label>Equipment Type</label>
                <span>{equipment.type || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Location</label>
                <span>{equipment.location || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Model / Part No.</label>
                <span>{equipment.model || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Serial Number</label>
                <span>{equipment.serial || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Manufacturer</label>
                <span>{equipment.manufacturer || "-"}</span>
              </div>
              <div className="spec-item">
                <label>Installed Since</label>
                <span>{calculateAge(equipment.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Operational Status (Dữ liệu từ API Control) */}
          <div className="equipment-card">
            <h3>Operational Status (Live)</h3>

            <div className="status-grid">
              <div className="status-box">
                <label>Operating Status</label>
                <div className="status-value">
                  <span className={`value-large ${controlInfo?.status === 'Normal' ? 'status-success' : 'status-warning'}`}>
                    {controlInfo?.status || "N/A"}
                  </span>
                </div>
              </div>

              {/* Map các thông số Live từ API. Ví dụ: controlInfo.settings.temperature */}
              <div className="status-box">
                <label>Temperature</label>
                <div className="status-value">
                  <span className="value-large">{controlInfo?.settings?.temperature || "--"} °C</span>
                </div>
              </div>

              <div className="status-box">
                <label>Pressure</label>
                <div className="status-value">
                  <span className="value-large">{controlInfo?.settings?.pressure || "--"} PSI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Documents (Giữ nguyên Mock Data vì Swagger chưa có) */}
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="equipment-right">
          
          {/* Current Condition & Tech Specs */}
          <div className="equipment-card">
            <h3>Technical Specifications</h3>
            <div className="condition-grid">
              {/* Hiển thị object technicalSpecs từ API Equipment */}
              {equipment.technicalSpecs ? Object.entries(equipment.technicalSpecs).map(([key, value]) => (
                <div className="condition-item" key={key}>
                  <label style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <div className="condition-value">
                    <span>{value || "--"}</span>
                  </div>
                </div>
              )) : (
                <div className="condition-item">
                  <span>No technical specifications available.</span>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Information (Dữ liệu từ API Maintenance) */}
          <div className="equipment-card">
            <h3>Maintenance History</h3>

            <div className="maintenance-list">
              {maintenanceHistory.length === 0 ? (
                <p style={{ color: "#64748b", fontStyle: "italic" }}>No maintenance records found.</p>
              ) : (
                maintenanceHistory.map((item, index) => (
                  <div key={item.id || index} className="maintenance-item">
                    <div className="maintenance-header">
                      <span className="maintenance-date">{formatDate(item.date || item.createdAt)}</span>
                      <span className={`badge ${
                        item.status === 'Upcoming' ? 'badge-upcoming' : 
                        item.status === 'Delayed' ? 'badge-delayed' : 
                        'badge-completed'
                      }`}>
                        {item.status || item.type}
                      </span>
                    </div>
                    <p className="maintenance-task">{item.description || item.task || "No description provided."}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Alerts (Dữ liệu từ API Control) */}
          <div className="equipment-card">
            <div className="card-header-with-icon">
              <h3>Recent Alerts</h3>
              <span className={`alert-count ${controlInfo?.alerts?.length > 0 ? 'alert-count-danger' : 'alert-count-info'}`}>
                {controlInfo?.alerts?.length || 0}
              </span>
            </div>

            <div className="alerts-list">
              {controlInfo?.alerts && controlInfo.alerts.length > 0 ? (
                controlInfo.alerts.map((alert, idx) => (
                  <div key={idx} className="alert-item alert-danger">
                    <div className="alert-icon">🔴</div>
                    <div className="alert-content">
                      <p className="alert-message">{alert.message || "Alert Triggered"}</p>
                      <span className="alert-time">{formatDate(alert.timestamp)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="alert-item alert-info">
                  <div className="alert-icon">🟢</div>
                  <div className="alert-content">
                    <p className="alert-message">No Critical Alerts</p>
                    <span className="alert-time">All systems operating normally</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}