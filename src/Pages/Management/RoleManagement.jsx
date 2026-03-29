import { FaUserShield, FaUsers, FaCog, FaPlus } from "react-icons/fa";

export default function RoleManagement() {
  const roles = [
    {
      id: 1,
      name: "Administrator",
      description: "Full system access and configuration rights",
      users: 1,
      color: "#3b82f6",
      textColor: "#60a5fa",
    },
    {
      id: 2,
      name: "Field Supervisor",
      description: "Supervise field operations and access management",
      users: 12,
      color: "#10b981",
      textColor: "#34d399",
    },
    {
      id: 3,
      name: "Engineer",
      description: "Manage operations and maintenance tasks",
      users: 24,
      color: "#a855f7",
      textColor: "#c084fc",
    },
  ];

  return (
    <div className="role-management">
      <div className="page-header">
        <div>
          <h1>Role Management</h1>
          <p className="page-subtitle">Roles are assigned to users and these roles will...</p>
        </div>
        <button className="btn-create">
          <FaPlus /> Create New Role
        </button>
      </div>

      <div className="role-list">
        {roles.map((role) => (
          <div key={role.id} className="role-item">
            <div className="role-left">
              <div className="role-icon-box" style={{ backgroundColor: role.color }}>
                <FaUserShield />
              </div>
              <div className="role-details">
                <h3>{role.name}</h3>
                <p>{role.description}</p>
              </div>
            </div>
            
            <div className="role-right">
              <div className="role-users-count">
                <FaUsers />
                <span>{role.users} users</span>
              </div>
              <button className="btn-edit-permissions">
                <FaCog /> Edit Permissions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
