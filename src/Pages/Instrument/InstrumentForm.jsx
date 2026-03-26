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
            <div className="form-columns">
              {/* Basic Information Column */}
              <div className="form-column">
                <h3 className="column-title">Basic Information</h3>

                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g., Flare Gas Analyzer FLW-5"
                    value={formData.name}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Type <span className="required">*</span>
                  </label>
                  <select
                    name="type"
                    className="form-select"
                    value={formData.type}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="pressure">Pressure</option>
                    <option value="temperature">Temperature</option>
                    <option value="flow">Flow</option>
                    <option value="level">Level</option>
                    <option value="gas">Gas</option>
                    <option value="safety">Safety</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Model <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    className="form-input"
                    placeholder="e.g., FLW-5A"
                    value={formData.model}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Manufacturer <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    className="form-input"
                    placeholder="e.g., Acme Instruments Ltd."
                    value={formData.manufacturer}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Location <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="e.g., Platform A, Well 3"
                    value={formData.location}
                    onChange={onInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={onInputChange}
                  >
                    <option value="operational">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="calibration">Calibration</option>
                    <option value="faulty">Faulty</option>
                  </select>
                </div>
              </div>

              {/* Calibration & Specs Column */}
              <div className="form-column">
                <h3 className="column-title">Specifications & Operational</h3>

                <div className="form-group">
                  <label>Measurement Range</label>
                  <input
                    type="text"
                    name="measurementRange"
                    className="form-input"
                    placeholder="e.g., 0-1000 ppm"
                    value={formData.measurementRange}
                    onChange={onInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Accuracy</label>
                  <input
                    type="text"
                    name="accuracy"
                    className="form-input"
                    placeholder="e.g., ±1%"
                    value={formData.accuracy}
                    onChange={onInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Sample Rate</label>
                  <input
                    type="text"
                    name="sampleRate"
                    className="form-input"
                    placeholder="e.g., 1s"
                    value={formData.sampleRate}
                    onChange={onInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Auto Calibration</label>
                  <select
                    name="autoCalibration"
                    className="form-select"
                    value={String(formData.autoCalibration)}
                    onChange={handleAutoCalibrationChange}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              </div>
            </div>
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
                  <FaPlus />{" "}
                  {editTarget ? "Update Instrument" : "Save Instrument"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
