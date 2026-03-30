import React from "react";
import { FaTimes, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";

const REPORT_TYPES = [
  "maintenance",
  "kpi",
  "incident",
  "sensor",
  "equipment",
  "custom",
];
const REPORT_FORMATS = ["pdf", "csv"];
const REPORT_TEMPLATES = ["standard", "executive", "detailed"];
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
      (option) => option.value,
    );
    onFormChange(field, selectedValues);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#1e293b",
          color: "#f8fafc",
          width: "100%",
          maxWidth: "750px",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
              Generate New Report
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#94a3b8",
              }}
            >
              Configure and generate a new technical report for your records.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Title */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#94a3b8",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Title
            </label>
            <input
              type="text"
              placeholder="Report title"
              value={reportForm.title || ""}
              onChange={(e) => onFormChange("title", e.target.value)}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#f8fafc",
                fontSize: "14px",
              }}
            />
          </div>

          {/* 2-Column Grid for Selects */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Type */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Type
              </label>
              <select
                value={reportForm.type || "maintenance"}
                onChange={(e) => onFormChange("type", e.target.value)}
                disabled={isGenerating}
                style={{
                  width: "100%",
                  padding: "12px",
                  height: "50px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "14px",
                }}
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Locations (Replaces Category to match Payload) */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Location
              </label>
              <select
                value={reportForm.location || LOCATIONS[0]}
                onChange={(e) => onFormChange("location", e.target.value)}
                disabled={isGenerating}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "14px",
                }}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Format
              </label>
              <select
                value={reportForm.format || "pdf"}
                onChange={(e) => onFormChange("format", e.target.value)}
                disabled={isGenerating}
                style={{
                  width: "100%",
                  padding: "12px",
                  height: "50px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "14px",
                }}
              >
                {REPORT_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Template */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Template & Equipment
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  value={reportForm.template || "standard"}
                  onChange={(e) => onFormChange("template", e.target.value)}
                  disabled={isGenerating}
                  style={{
                    flex: 1,
                    padding: "12px",
                    height: "50px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "14px",
                  }}
                >
                  {REPORT_TEMPLATES.map((tmp) => (
                    <option key={tmp} value={tmp}>
                      {formatLabel(tmp)}
                    </option>
                  ))}
                </select>

                {/* Equipment Types inside the same grid space */}
                <select
                  value={reportForm.equipmentType || EQUIPMENT_TYPES[0]}
                  onChange={(e) => onFormChange("equipmentType", e.target.value)}
                  disabled={isGenerating}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                >
                  {EQUIPMENT_TYPES.map((eq) => (
                    <option key={eq} value={eq}>
                      {formatLabel(eq)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#94a3b8",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Date Range
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="date"
                  value={reportForm.from || ""}
                  onChange={(e) => onFormChange("from", e.target.value)}
                  disabled={isGenerating}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <span style={{ color: "#94a3b8" }}>-</span>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="date"
                  value={reportForm.to || ""}
                  onChange={(e) => onFormChange("to", e.target.value)}
                  disabled={isGenerating}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#94a3b8",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Description
            </label>
            <input
              type="text"
              placeholder="Optional description"
              value={reportForm.description || ""}
              onChange={(e) => onFormChange("description", e.target.value)}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#f8fafc",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #334155",
          }}
        >
          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{
              padding: "10px 20px",
              backgroundColor: "transparent",
              border: "1px solid #334155",
              borderRadius: "6px",
              color: "#f8fafc",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              border: "none",
              borderRadius: "6px",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <FaCheckCircle />{" "}
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
