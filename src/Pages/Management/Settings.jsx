import { useState } from "react";
import { FaShieldAlt, FaCog, FaTools } from "react-icons/fa";

export default function Settings() {
  const [formData, setFormData] = useState({
    securityPolicy: "Default Policy",
    sessionTimeout: "30 - minutes",
    passwordExpiry: "90 - days",
    dataRetentionPolicy: "1 week",
    alertThreshold: "At Elevated = +100 psi",
    temperature: "= 30°C",
    autoExcavatory: "30 - Days Of inactivity",
    schedulingFrequency: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving configuration:", formData);
  };

  const handleCancel = () => {
    console.log("Cancelled");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>System Configuration</h1>
        <p className="settings-subtitle">Configure security policies, operational parameters, and maintenance settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          {/* Security Settings */}
          <div className="settings-card">
            <div className="card-header">
              <div className="card-icon card-icon-red">
                <FaShieldAlt />
              </div>
              <div className="card-header-text">
                <h3>Security Settings</h3>
                <p>Ensure data safety and access</p>
              </div>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Security Policy</label>
                <select
                  className="form-input"
                  value={formData.securityPolicy}
                  onChange={(e) =>
                    setFormData({ ...formData, securityPolicy: e.target.value })
                  }
                >
                  <option>Default Policy</option>
                  <option>Strict Policy</option>
                  <option>Custom Policy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Session Timeout</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="30 - minutes"
                  value={formData.sessionTimeout}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionTimeout: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Password Expiry</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="90 - days"
                  value={formData.passwordExpiry}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordExpiry: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Operations Settings */}
          <div className="settings-card">
            <div className="card-header">
              <div className="card-icon card-icon-blue">
                <FaCog />
              </div>
              <div className="card-header-text">
                <h3>Operations Settings</h3>
                <p>Operational parameters</p>
              </div>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Data Retention Policy</label>
                <select
                  className="form-input"
                  value={formData.dataRetentionPolicy}
                  onChange={(e) =>
                    setFormData({ ...formData, dataRetentionPolicy: e.target.value })
                  }
                >
                  <option>1 week</option>
                  <option>1 month</option>
                  <option>3 months</option>
                  <option>6 months</option>
                  <option>1 year</option>
                </select>
              </div>

              <div className="form-group">
                <label>Alert Thresholds</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="At Elevated = +100 psi"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, alertThreshold: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label-icon">
                  <span>Temperature:</span>
                  <span className="label-warning">⚠ Temperature: = 30°C</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Maintenance Settings */}
          <div className="settings-card">
            <div className="card-header">
              <div className="card-icon card-icon-green">
                <FaTools />
              </div>
              <div className="card-header-text">
                <h3>Maintenance Settings</h3>
                <p>Equipment lifecycle management</p>
              </div>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Auto Excavatory / Reset</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="30 - Days Of inactivity"
                  value={formData.autoExcavatory}
                  onChange={(e) =>
                    setFormData({ ...formData, autoExcavatory: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label-help">
                  <span>Scheduling Frequency</span>
                  <span className="label-help">💭 Determines how often the development portal will generate/notify related for maintenance events</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.schedulingFrequency}
                  onChange={(e) =>
                    setFormData({ ...formData, schedulingFrequency: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-save-config">
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
