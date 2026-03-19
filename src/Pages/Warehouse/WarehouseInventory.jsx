import { useState } from "react";
import { FaSearch, FaPlus, FaTimes, FaCheckCircle } from "react-icons/fa";

export default function WarehouseInventory() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: "",
    supplierName: "",
    warehouseId: "",
    quantity: "",
    dateReceived: "",
  });

  const [warehouses] = useState([
    {
      id: "WH-001",
      name: "Central Storage A",
      location: "Platform X1",
      capacity: 7200,
      max: 10000,
      percent: 72,
      status: "Active"
    },
    {
      id: "WH-002",
      name: "North Wing B",
      location: "Platform Y2",
      capacity: 5400,
      max: 8000,
      percent: 68,
      status: "Maintenance"
    },
    {
      id: "WH-003",
      name: "East Facility C",
      location: "Platform Z3",
      capacity: 11600,
      max: 15000,
      percent: 77,
      status: "Active"
    },
    {
      id: "WH-004",
      name: "South Depot D",
      location: "Platform W4",
      capacity: 6100,
      max: 8200,
      percent: 74,
      status: "Active"
    },
    {
      id: "WH-005",
      name: "West Storage E",
      location: "Platform V5",
      capacity: 450,
      max: 6100,
      percent: 7,
      status: "Active"
    }
  ]);

  const getCapacityClass = (percent) => {
    if (percent >= 75) return "capacity-critical";
    if (percent >= 65) return "capacity-warning";
    return "capacity-good";
  };

  const getStatusBadgeClass = (status) => {
    return status === "Active" ? "badge-active" : "badge-warning";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Receiving inventory:", formData);
    setShowModal(false);
    setFormData({
      equipmentId: "",
      supplierName: "",
      warehouseId: "",
      quantity: "",
      dateReceived: "",
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      equipmentId: "",
      supplierName: "",
      warehouseId: "",
      quantity: "",
      dateReceived: "",
    });
  };

  return (
    <div className="warehouse-inventory">
      <div className="page-header">
        <h1>Warehouse Inventory</h1>
        <button className="btn-equipment-inventory" onClick={() => setShowModal(true)}>
          <FaPlus /> Equipment Dispatch
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search warehouses..." />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>WAREHOUSE NAME</th>
              <th>LOCATION</th>
              <th>CAPACITY</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td>{warehouse.id}</td>
                <td>{warehouse.name}</td>
                <td>{warehouse.location}</td>
                <td>
                  <div className="capacity-cell">
                    <div className="capacity-info">
                      <span className="capacity-text">
                        {warehouse.capacity.toLocaleString()} / {warehouse.max.toLocaleString()} units
                      </span>
                      <span className={`capacity-percent ${getCapacityClass(warehouse.percent)}`}>
                        {warehouse.percent}%
                      </span>
                    </div>
                    <div className="capacity-bar-container">
                      <div
                        className={`capacity-bar ${getCapacityClass(warehouse.percent)}`}
                        style={{ width: `${warehouse.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(warehouse.status)}`}>
                    {warehouse.status}
                  </span>
                </td>
                <td>
                  <button className="btn-view-inventory">View Inventory</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receive Inventory Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content receive-inventory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Receive Inventory</h2>
                <p className="modal-subtitle">
                  Add items received from supplier. Required fields: Supplier Name (Last function to them.)
                </p>
              </div>
              <button className="modal-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Equipment/Item ID</label>
                  <select
                    className="form-select"
                    value={formData.equipmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, equipmentId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select equipment or item</option>
                    <option value="EQ-001">EQ-001 - Drilling Equipment</option>
                    <option value="EQ-002">EQ-002 - Safety Gear</option>
                    <option value="EQ-003">EQ-003 - Measurement Tools</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Supplier Name <span className="badge-updated">Updated</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Supplier name"
                    value={formData.supplierName}
                    onChange={(e) =>
                      setFormData({ ...formData, supplierName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Warehouse ID</label>
                  <select
                    className="form-select"
                    value={formData.warehouseId}
                    onChange={(e) =>
                      setFormData({ ...formData, warehouseId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select warehouse location</option>
                    <option value="WH-001">WH-001 - Central Storage A</option>
                    <option value="WH-002">WH-002 - North Wing B</option>
                    <option value="WH-003">WH-003 - East Facility C</option>
                    <option value="WH-004">WH-004 - South Depot D</option>
                    <option value="WH-005">WH-005 - West Storage E</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date Received</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dateReceived}
                    onChange={(e) =>
                      setFormData({ ...formData, dateReceived: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-confirm">
                  <FaCheckCircle /> Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
