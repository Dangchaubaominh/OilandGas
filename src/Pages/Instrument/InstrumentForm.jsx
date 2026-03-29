import React from "react";
import { FaTimes, FaPlus, FaSync } from "react-icons/fa";

export default function InstrumentForm({
  showModal,
  formData,
  editTarget,
  isSubmitting,
  onInputChange,
  onSubmit,
  onCancel,
}) {
  if (!showModal) return null;

  const handleAutoCalibrationChange = (e) => {
    const event = {
      target: {
        name: "autoCalibration",
        value: e.target.value === "true",
      },
    };
    onInputChange(event);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content register-instrument-modal"
        style={{ maxWidth: "900px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>
              {editTarget ? "Edit Instrument" : "Register New Instrument"}
            </h2>
            <p className="modal-subtitle">
              {editTarget
                ? "Update instrument information"
                : "Add a new instrument to the registry"}
            </p>
          </div>
          <button className="modal-close" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            
            {/* VÙNG CHIA 2 CỘT */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
              
              {/* ================= CỘT TRÁI ================= */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #374151", paddingBottom: "8px", margin: "0" }}>
                  Basic Information
                </h3>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Name <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g., Flare Gas Analyzer FLW-5"
                    value={formData.name || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Type <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="type"
                    className="form-input"
                    placeholder="e.g., gas"
                    value={formData.type || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Model <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="model"
                    className="form-input"
                    placeholder="e.g., FLW-5A"
                    value={formData.model || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Manufacturer <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="manufacturer"
                    className="form-input"
                    placeholder="e.g., Acme Instruments Ltd."
                    value={formData.manufacturer || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Location <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="e.g., Platform A - Wellhead 12"
                    value={formData.location || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Status</label>
                  <select
                    name="status"
                    className="form-select form-input"
                    value={formData.status || "operational"}
                    onChange={onInputChange}
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="faulty">Faulty</option>
                    <option value="out-of-service">Out of Service</option>
                  </select>
                </div>
              </div>

              {/* ================= CỘT PHẢI ================= */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #374151", paddingBottom: "8px", margin: "0" }}>
                  Calibration & Specifications
                </h3>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Measurement Range <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="measurementRange"
                    className="form-input"
                    placeholder="e.g., 0-1000 ppm"
                    value={formData.measurementRange || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Accuracy <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="accuracy"
                    className="form-input"
                    placeholder="e.g., ±1%"
                    value={formData.accuracy || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Sample Rate <span className="required" style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="sampleRate"
                    className="form-input"
                    placeholder="e.g., 1s"
                    value={formData.sampleRate || ""}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Auto Calibration</label>
                  <select
                    name="autoCalibration"
                    className="form-select form-input"
                    value={String(formData.autoCalibration)}
                    onChange={handleAutoCalibrationChange}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Installation Date</label>
                  <input
                    type="date"
                    name="installationDate"
                    className="form-input"
                    style={{ colorScheme: "dark" }}
                    value={formData.installationDate || ""}
                    onChange={onInputChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Last Calibration Date</label>
                  <input
                    type="date"
                    name="lastCalibrationDate"
                    className="form-input"
                    style={{ colorScheme: "dark" }}
                    value={formData.lastCalibrationDate || ""}
                    onChange={onInputChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Calibration Interval (months)</label>
                  <input
                    type="number"
                    name="calibrationInterval"
                    className="form-input"
                    placeholder="e.g., 12"
                    value={formData.calibrationInterval || ""}
                    onChange={onInputChange}
                  />
                </div>

              </div>
            </div>
            {/* KẾT THÚC VÙNG CHIA CỘT */}

          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSync className="spin" /> Saving...
                </>
              ) : (
                <>
                  <FaPlus /> {editTarget ? "Update Instrument" : "Save Instrument"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}