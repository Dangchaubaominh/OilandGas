import { FaTimes, FaCheckCircle } from "react-icons/fa";

const REPORT_TYPES = [
  "kpi",
  "maintenance",
  "incident",
  "sensor",
  "equipment",
  "custom",
];
const REPORT_CATEGORIES = [
  "operational",
  "technical",
  "safety",
  "environmental",
  "financial",
  "regulatory",
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content reports-generator-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Generate New Report</h2>
            <p className="modal-subtitle">
              Configure and generate a new technical report for your records.
            </p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isGenerating}
          >
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="report-generator">
            <label className="field-group reports-title-input">
              <span className="field-label">Title</span>
              <input
                type="text"
                className="filter-input"
                placeholder="Report title"
                value={reportForm.title}
                onChange={(event) => onFormChange("title", event.target.value)}
                disabled={isGenerating}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Type</span>
              <select
                className="filter-select"
                value={reportForm.type}
                onChange={(event) => onFormChange("type", event.target.value)}
                disabled={isGenerating}
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Category</span>
              <select
                className="filter-select"
                value={reportForm.category}
                onChange={(event) =>
                  onFormChange("category", event.target.value)
                }
                disabled={isGenerating}
              >
                {REPORT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatLabel(category)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Format</span>
              <select
                className="filter-select"
                value={reportForm.format}
                onChange={(event) => onFormChange("format", event.target.value)}
                disabled={isGenerating}
              >
                {REPORT_FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Template</span>
              <select
                className="filter-select"
                value={reportForm.template}
                onChange={(event) =>
                  onFormChange("template", event.target.value)
                }
                disabled={isGenerating}
              >
                {REPORT_TEMPLATES.map((template) => (
                  <option key={template} value={template}>
                    {formatLabel(template)}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-group date-range-filter">
              <span className="field-label">Date Range</span>
              <div className="date-range-inputs">
                <input
                  type="date"
                  className="filter-input"
                  value={reportForm.from}
                  onChange={(event) => onFormChange("from", event.target.value)}
                  disabled={isGenerating}
                />
                <span className="date-separator">-</span>
                <input
                  type="date"
                  className="filter-input"
                  value={reportForm.to}
                  onChange={(event) => onFormChange("to", event.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <label className="field-group reports-description-input">
              <span className="field-label">Description</span>
              <input
                type="text"
                className="filter-input"
                placeholder="Optional description"
                value={reportForm.description}
                onChange={(event) =>
                  onFormChange("description", event.target.value)
                }
                disabled={isGenerating}
              />
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            className="btn-submit"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            <FaCheckCircle />{" "}
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
