import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileAlt, FaFileExport, FaSync } from "react-icons/fa";
import adminEquipmentApi from "../../services/adminEquipmentApi";
export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEquipmentDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [equipRes, maintenanceRes] = await Promise.allSettled([
        adminEquipmentApi.getById(id),
        adminEquipmentApi.getMaintenanceHistory(id),
      ]);

      if (equipRes.status === "fulfilled") {
        setEquipment(equipRes.value.data?.data || equipRes.value.data);
      } else {
        throw new Error("Cannot load equipment details");
      }

      if (maintenanceRes.status === "fulfilled") {
        const records = maintenanceRes.value.data?.data;
        setMaintenanceHistory(Array.isArray(records) ? records : []);
      }
    } catch (err) {
      console.error("Error loading equipment details:", err);
      setError(err.message || "Failed to load equipment details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEquipmentDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dateString) => {
    if (!dateString) return "-";
    const installDate = new Date(dateString);
    const now = new Date();
    const months =
      (now.getFullYear() - installDate.getFullYear()) * 12 +
      (now.getMonth() - installDate.getMonth());
    return `${months} Months`;
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
        Loading equipment details...
      </div>
    );
  }

  // --- EXPORT HANDLERS ---
  const handleExportCSV = () => {
    if (!equipment) return;
    const rows = [
      ["Field", "Value"],
      ["Name", equipment.name || "-"],
      ["Status", equipment.status || "-"],
      ["Equipment ID", equipment.id || equipment._id?.substring(0, 8) || "-"],
      ["Type", equipment.type || "-"],
      ["Location", equipment.location || "-"],
      ["Model / Part No.", equipment.model || "-"],
      ["Serial Number", equipment.serial || "-"],
      ["Manufacturer", equipment.manufacturer || "-"],
      ["Install Date", formatDate(equipment.createdAt)],
      ["Installed Since", calculateAge(equipment.createdAt)],
    ];
    // Add technical specs if available
    if (equipment.technicalSpecs) {
      Object.entries(equipment.technicalSpecs).forEach(([key, value]) => {
        rows.push([
          `Spec: ${key.replace(/([A-Z])/g, " $1").trim()}`,
          value || "--",
        ]);
      });
    }
    const csvContent = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `equipment_${equipment.id || equipment._id || "report"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!equipment) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Equipment Report", 14, 16);
    doc.setFontSize(12);
    const fields = [
      ["Name", equipment.name || "-"],
      ["Status", equipment.status || "-"],
      ["Equipment ID", equipment.id || equipment._id?.substring(0, 8) || "-"],
      ["Type", equipment.type || "-"],
      ["Location", equipment.location || "-"],
      ["Model / Part No.", equipment.model || "-"],
      ["Serial Number", equipment.serial || "-"],
      ["Manufacturer", equipment.manufacturer || "-"],
      ["Install Date", formatDate(equipment.createdAt)],
      ["Installed Since", calculateAge(equipment.createdAt)],
    ];
    let y = 28;
    fields.forEach(([label, value]) => {
      doc.text(`${label}:`, 14, y);
      doc.text(String(value), 70, y);
      y += 8;
    });
    // Add technical specs if available
    if (equipment.technicalSpecs) {
      Object.entries(equipment.technicalSpecs).forEach(([key, value]) => {
        doc.text(`Spec: ${key.replace(/([A-Z])/g, " $1").trim()}:`, 14, y);
        doc.text(String(value || "--"), 70, y);
        y += 8;
      });
    }
    doc.save(`equipment_${equipment.id || equipment._id || "report"}.pdf`);
  };

  if (error || !equipment) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "#ef4444" }}>
        <h2>Error</h2>
        <p>{error || "Equipment not found."}</p>
        <button
          className="btn-secondary"
          onClick={() => navigate("/app/equipment")}
          style={{ marginTop: "20px" }}
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="equipment-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate("/app/equipment")}>
          <FaArrowLeft /> Back to Equipment
        </button>

        <div className="equipment-title-section">
          <div className="equipment-title-left">
            <h1>{equipment.name || "Unknown Equipment"}</h1>
            <span
              className={`badge ${equipment.status?.toLowerCase() === "operational" ? "badge-active" : "badge-warning"}`}
            >
              {equipment.status || "N/A"}
            </span>
          </div>
          <div className="detail-actions">
            <button
              className="btn-secondary"
              onClick={fetchEquipmentDetails}
              style={{ marginRight: "10px" }}
            >
              <FaSync />
            </button>
            <button
              className="btn-view-diagrams"
              onClick={() => navigate(`/app/equipment/${id}/3d-view`)}
            >
              <FaFileAlt /> View 3D Model
            </button>
            <button
              className="btn-order-report"
              onClick={handleExportCSV}
              title="Export as CSV"
            >
              <FaFileExport /> Export CSV
            </button>
            <button
              className="btn-order-report"
              onClick={handleExportPDF}
              title="Export as PDF"
              style={{ marginLeft: 8 }}
            >
              <FaFileExport /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="equipment-content">
        <div className="equipment-left">
          <div className="equipment-card">
            <div className="card-header-with-btn">
              <h3>Equipment Specifications</h3>
            </div>

            <div className="spec-grid">
              <div className="spec-item">
                <label>Equipment ID</label>
                <span>
                  {equipment.id || equipment._id?.substring(0, 8) || "-"}
                </span>
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

          <div className="equipment-card">
            <h3>Operational Status</h3>

            <div className="status-grid">
              <div className="status-box">
                <label>Operating Status</label>
                <div className="status-value">
                  <span
                    className={`value-large ${equipment.status?.toLowerCase() === "operational" ? "status-success" : "status-warning"}`}
                  >
                    {equipment.status || "N/A"}
                  </span>
                </div>
              </div>

              <div className="status-box">
                <label>Location</label>
                <div className="status-value">
                  <span className="value-large">
                    {equipment.location || "--"}
                  </span>
                </div>
              </div>

              <div className="status-box">
                <label>Last Updated</label>
                <div className="status-value">
                  <span className="value-large">
                    {formatDate(equipment.updatedAt || equipment.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="equipment-card">
            <div className="card-header-with-btn">
              <h3>Linked Documents</h3>
            </div>
            <div className="documents-list">
              <div className="document-item">
                <div className="document-icon document-icon-blue">
                  <FaFileAlt />
                </div>
                <div className="document-info">
                  <span className="document-name">
                    No document API data available for this equipment.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="equipment-right">
          <div className="equipment-card">
            <h3>Technical Specifications</h3>
            <div className="condition-grid">
              {equipment.technicalSpecs ? (
                Object.entries(equipment?.technicalSpecs || {}).map(
                  ([key, value]) => (
                    <div className="condition-item" key={key}>
                      <label style={{ textTransform: "capitalize" }}>
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <div className="condition-value">
                        <span>{value || "--"}</span>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="condition-item">
                  <span>No technical specifications available.</span>
                </div>
              )}
            </div>
          </div>

          <div className="equipment-card">
            <h3>Maintenance History</h3>

            <div className="maintenance-list">
              {maintenanceHistory.length === 0 ? (
                <p style={{ color: "#64748b", fontStyle: "italic" }}>
                  No maintenance records found.
                </p>
              ) : (
                (Array.isArray(maintenanceHistory)
                  ? maintenanceHistory
                  : []
                ).map((item, index) => (
                  <div key={item.id || index} className="maintenance-item">
                    <div className="maintenance-header">
                      <span className="maintenance-date">
                        {formatDate(item.date || item.createdAt)}
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
                        {item.status || item.type}
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

          <div className="equipment-card">
            <div className="card-header-with-icon">
              <h3>Recent Alerts</h3>
              <span className="alert-count alert-count-info">0</span>
            </div>

            <div className="alerts-list">
              <div className="alert-item alert-info">
                <div className="alert-icon">🟢</div>
                <div className="alert-content">
                  <p className="alert-message">
                    No alert API endpoint configured for equipment details.
                  </p>
                  <span className="alert-time">
                    Data shown in this page is loaded from backend APIs only.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
