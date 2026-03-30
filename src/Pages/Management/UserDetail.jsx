import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaClock, FaShieldAlt, FaMobileAlt, FaKey } from "react-icons/fa";

export default function UserDetail() {
  const navigate = useNavigate();

  const [user] = useState({
    id: "EMP-2847-QS",
    fullName: "John Morthan Davis",
    displayName: "John Davis",
    email: "john.davis@ogsys.com",
    phone: "+1 (555) 234-5678",
    position: "TX - Site A",
    department: "Systems Admin",
    status: "Access Granted",
    accountCreated: "Jan 16, 2023",
    accountStatus: "Active",
    lastActive: "2 hours ago",
    lastLogin: "30 days ago",
    twoFactorAuth: "Disabled",
    joinedDate: "",
    devices: "2 devices",
    addedSince: "6 Months"
  });

  const [activities] = useState([
    {
      id: 1,
      action: "Logged in from Chrome on Windows",
      time: "2 hours ago",
      icon: "login"
    },
    {
      id: 2,
      action: "Updated instrument FNT-2647 settings",
      time: "5 hours ago",
      icon: "edit"
    },
    {
      id: 3,
      action: "Generated maintenance report for Zone 3",
      time: "1 week ago",
      icon: "report"
    },
    {
      id: 4,
      action: "Modified equipment control parameters",
      time: "2 weeks ago",
      icon: "settings"
    }
  ]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getActivityIcon = (type) => {
    const icons = {
      login: "🔵",
      edit: "🟢",
      report: "🟠",
      settings: "🔵"
    };
    return icons[type] || "⚪";
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      console.log("Deleting user:", user.id);
      navigate("/app/users");
    }
  };

  return (
    <div className="user-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate("/app/users")}>
          <FaArrowLeft /> Back to users
        </button>
        
        <div className="detail-title">
          <h1>User Information</h1>
          <p>Manage user profiles and account information</p>
        </div>

        <div className="detail-actions">
          <button className="btn-edit-user">
            <FaEdit /> Edit User
          </button>
          <button className="btn-delete-user" onClick={handleDelete}>
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Left Column - Profile & Activity */}
        <div className="detail-left">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {getInitials(user.displayName)}
              </div>
            </div>

            <div className="profile-info">
              <h2>{user.displayName}</h2>
              <p className="profile-email">{user.email}</p>
              <span className="badge badge-access-granted">{user.status}</span>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <label>Full Name</label>
                <div className="detail-value">
                  <span>{user.fullName}</span>
                  <button className="btn-request">Request</button>
                </div>
              </div>

              <div className="detail-row">
                <label>Email</label>
                <div className="detail-value detail-value-icon">
                  <FaEnvelope />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="detail-row">
                <label>Phone</label>
                <div className="detail-value detail-value-icon">
                  <FaPhone />
                  <span>{user.phone}</span>
                </div>
              </div>

              <div className="detail-row">
                <label>Position</label>
                <div className="detail-value detail-value-icon">
                  <FaMapMarkerAlt />
                  <span>{user.position}</span>
                </div>
              </div>

              <div className="detail-row">
                <label>Department</label>
                <div className="detail-value">
                  <span className="badge badge-department">{user.department}</span>
                </div>
              </div>

              <div className="detail-row">
                <label>EMP ID</label>
                <div className="detail-value">
                  <span>{user.id}</span>
                  <span className="badge badge-added">Added {user.addedSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-card">
            <h3>Recent Activity</h3>
            <p className="activity-subtitle">Latest user actions and operations</p>

            <div className="activity-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-action">{activity.action}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Account Details */}
        <div className="detail-right">
          <div className="account-card">
            <h3>Account Details</h3>
            <p className="account-subtitle">User account status and information</p>

            <div className="account-details">
              <div className="account-item">
                <label>Account Creation</label>
                <div className="account-value">
                  <FaClock />
                  <span>{user.accountCreated}</span>
                </div>
              </div>

              <div className="account-item">
                <label>Account Status</label>
                <div className="account-value">
                  <div className="status-indicator status-active"></div>
                  <span>{user.accountStatus}</span>
                </div>
              </div>

              <div className="account-item">
                <label>Logged in</label>
                <div className="account-value">
                  <FaClock />
                  <span>{user.lastActive}</span>
                </div>
              </div>

              <div className="account-item">
                <label>Last Login</label>
                <div className="account-value">
                  <FaClock />
                  <span>{user.lastLogin}</span>
                </div>
              </div>

              <div className="account-item">
                <label>Two-Factor Auth</label>
                <div className="account-value">
                  <FaShieldAlt />
                  <span className="text-disabled">{user.twoFactorAuth}</span>
                </div>
              </div>

              <div className="account-item">
                <label>Joined Date</label>
                <div className="account-value">
                  <FaBriefcase />
                  <span>{user.joinedDate || "N/A"}</span>
                </div>
              </div>

              <div className="account-item">
                <label>Devices</label>
                <div className="account-value">
                  <FaMobileAlt />
                  <span>{user.devices}</span>
                </div>
              </div>
            </div>

            <button className="btn-change-password">
              <FaKey /> Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
