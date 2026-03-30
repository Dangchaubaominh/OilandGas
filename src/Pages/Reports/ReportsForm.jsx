import React from "react";
import { 
  FaTimes, 
  FaCheckCircle, 
  FaFileAlt, 
  FaCogs, 
  FaCalendarAlt, 
  FaFilter 
} from "react-icons/fa";

const REPORT_TYPES = [
  "kpi",
  "maintenance",
  "incident",
  "sensor",
  "equipment",
  "custom",
];

const LOCATIONS = [
  "Platform A",
  "Platform B",
  "Platform C",
  "Onshore Facility",
];

const EQUIPMENT_TYPES = [
  "drilling",
  "pumping",
  "measurement",
  "safety",
  "transportation",
  "other",
];

const REPORT_FORMATS = ["pdf", "csv"];
const REPORT_TEMPLATES = ["standard", "executive", "detailed"];

const formatLabel = (value = "") =>
  value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function ReportsModal({
  isOpen,
  isGenerating,
  reportForm,
  onFormChange,
  onGenerate,
  onClose,
}) {
  if (!isOpen) return null;

  const handleMultiSelectChange = (field, event) => {
    const selectedValues = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    onFormChange(field, selectedValues);
  };

  // Inline styles cho cấu trúc Card/Section mới
  const sectionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    border: "1px solid var(--border-color, #e2e8f0)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px"
  };

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "var(--text-color, #334155)"
  };

  const grid2Col = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
  const grid3Col = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content reports-generator-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }} // Nới rộng form ra một chút để chứa 3 cột
      >
        <div className="modal-header">
          <div>
            <h2>Generate New Report</h2>
            <p className="modal-subtitle">
              Configure parameters to generate a comprehensive system report.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isGenerating}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}>
          <div className="report-generator">
            
            {/* ---- SECTION 1: GENERAL INFO ---- */}
            <div style={sectionStyle}>
              <h3 style={sectionHeaderStyle}>
                <FaFileAlt style={{ color: "#3b82f6" }} /> General Information
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className="field-group">
                  <span className="field-label">Report Title</span>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. Monthly Maintenance Overview"
                    value={reportForm.title || ""}
                    onChange={(e) => onFormChange("title", e.target.value)}
                    disabled={isGenerating}
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">Description (Optional)</span>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Brief details about this report..."
                    value={reportForm.description || ""}
                    onChange={(e) => onFormChange("description", e.target.value)}
                    disabled={isGenerating}
                  />
                </label>
              </div>
            </div>

            {/* ---- SECTION 2: CONFIGURATION & TIMEFRAME ---- */}
            <div style={sectionStyle}>
              <h3 style={sectionHeaderStyle}>
                <FaCogs style={{ color: "#8b5cf6" }} /> Report Settings
              </h3>
              <div style={grid3Col}>
                <label className="field-group">
                  <span className="field-label">Report Type</span>
                  <select
                    className="filter-select"
                    value={reportForm.type || "maintenance"}
                    onChange={(e) => onFormChange("type", e.target.value)}
                    disabled={isGenerating}
                  >
                    {REPORT_TYPES.map((type) => (
                      <option key={type} value={type}>{formatLabel(type)}</option>
                    ))}
                  </select>
                </label>

                <label className="field-group">
                  <span className="field-label">Format</span>
                  <select
                    className="filter-select"
                    value={reportForm.format || "pdf"}
                    onChange={(e) => onFormChange("format", e.target.value)}
                    disabled={isGenerating}
                  >
                    {REPORT_FORMATS.map((fmt) => (
                      <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                    ))}
                  </select>
                </label>

                <label className="field-group">
                  <span className="field-label">Template</span>
                  <select
                    className="filter-select"
                    value={reportForm.template || "standard"}
                    onChange={(e) => onFormChange("template", e.target.value)}
                    disabled={isGenerating}
                  >
                    {REPORT_TEMPLATES.map((tmp) => (
                      <option key={tmp} value={tmp}>{formatLabel(tmp)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px dashed #cbd5e1" }} />

              <h3 style={sectionHeaderStyle}>
                <FaCalendarAlt style={{ color: "#10b981" }} /> Timeframe
              </h3>
              <div style={grid2Col}>
                <label className="field-group">
                  <span className="field-label">Start Date</span>
                  <input
                    type="date"
                    className="filter-input"
                    value={reportForm.from || ""}
                    onChange={(e) => onFormChange("from", e.target.value)}
                    disabled={isGenerating}
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">End Date</span>
                  <input
                    type="date"
                    className="filter-input"
                    value={reportForm.to || ""}
                    onChange={(e) => onFormChange("to", e.target.value)}
                    disabled={isGenerating}
                  />
                </label>
              </div>
            </div>

            {/* ---- SECTION 3: DATA FILTERS ---- */}
            <div style={sectionStyle}>
              <h3 style={sectionHeaderStyle}>
                <FaFilter style={{ color: "#f59e0b" }} /> Data Filters
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal", marginLeft: "auto" }}>
                  (Hold Ctrl/Cmd to select multiple)
                </span>
              </h3>
              <div style={grid2Col}>
                <label className="field-group">
                  <span className="field-label">Target Locations</span>
                  <select
                    multiple
                    className="filter-select"
                    value={reportForm.locations || []}
                    onChange={(e) => handleMultiSelectChange("locations", e)}
                    disabled={isGenerating}
                    style={{ height: "120px", padding: "8px", borderRadius: "6px" }}
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </label>

                <label className="field-group">
                  <span className="field-label">Target Equipment</span>
                  <select
                    multiple
                    className="filter-select"
                    value={reportForm.equipmentTypes || []}
                    onChange={(e) => handleMultiSelectChange("equipmentTypes", e)}
                    disabled={isGenerating}
                    style={{ height: "120px", padding: "8px", borderRadius: "6px" }}
                  >
                    {EQUIPMENT_TYPES.map((eq) => (
                      <option key={eq} value={eq}>{formatLabel(eq)}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
          <button className="btn-cancel" onClick={onClose} disabled={isGenerating}>
            Cancel
          </button>
          <button className="btn-submit" onClick={onGenerate} disabled={isGenerating}>
            <FaCheckCircle /> {isGenerating ? "Processing Data..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}