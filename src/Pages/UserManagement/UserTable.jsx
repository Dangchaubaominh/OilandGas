import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";

const VIEW_MODES = {
  ACTIVE: "active",
  DELETED: "deleted",
  ALL: "all",
};

const getRoleBadgeClass = (role) => {
  const lowerRole = (role || "").toLowerCase();

  if (lowerRole.includes("admin")) return "badge-admin";
  if (lowerRole.includes("supervisor")) return "badge-supervisor";
  if (lowerRole.includes("engineer")) return "badge-engineer";

  return "";
};

const getStatusBadgeClass = (status) => {
  return status?.toLowerCase() === "active" ? "badge-active" : "badge-locked";
};

export default function UserTable({
  isLoading,
  filteredUsers,
  searchQuery,
  viewMode,
  isAdmin,
  currentUser,
  onEdit,
  onDelete,
  onRestore,
  // NEW PROPS FOR PAGINATION
  pagination, 
  onPageChange
}) {
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "3px solid rgba(96, 165, 250, 0.15)",
            borderTopColor: "#60a5fa",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span
          style={{
            color: "#64748b",
            fontSize: "14px",
            letterSpacing: "0.05em",
          }}
        >
          Loading users...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>USER ID / CODE</th>
            <th>FULL NAME</th>
            <th>PHONE</th>
            <th>EMAIL ADDRESS</th>
            <th>ROLE</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#94a3b8",
                }}
              >
                No users found{searchQuery && ` matching "${searchQuery}"`}.
              </td>
            </tr>
          ) : (
            filteredUsers?.map((user) => {
              const userId = user._id || user.id;
              // Safe fallbacks so the app doesn't crash if a user is missing data
              const userName = user.name || <span style={{ fontStyle: "italic", color: "#64748b" }}>Not set</span>;
              const isSelf = currentUser?._id === userId || currentUser?.id === userId;

              return (
                <tr key={userId}>
                  <td>
                    {/* Displays userCode if available, otherwise falls back to a shortened _id */}
                    <span title={userId}>{user.userCode || String(userId).substring(0, 8)}...</span>
                  </td>
                  <td>{userName}</td>
                  <td>{user.phone || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {isAdmin &&
                        (viewMode === VIEW_MODES.DELETED ? (
                          <button
                            className="btn-icon btn-restore"
                            title="Restore User"
                            onClick={() => onRestore(userId, user.name || user.email)}
                          >
                            <FaUndo />
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-icon btn-edit"
                              title="Edit User"
                              onClick={() => onEdit(user)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              title={
                                isSelf
                                  ? "You cannot delete your own account"
                                  : "Delete User"
                              }
                              onClick={() => onDelete(userId, user.name || user.email)}
                              disabled={isSelf}
                              style={{
                                opacity: isSelf ? 0.3 : 1,
                                cursor: isSelf ? "not-allowed" : "pointer",
                              }}
                            >
                              <FaTrash />
                            </button>
                          </>
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* --- NEW PAGINATION CONTROLS --- */}
      {pagination && pagination.totalPages > 1 && (
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "16px"
          }}
        >
          <button 
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            style={{
              padding: "8px 16px",
              backgroundColor: pagination.currentPage <= 1 ? "transparent" : "rgba(59, 130, 246, 0.1)",
              color: pagination.currentPage <= 1 ? "#64748b" : "#60a5fa",
              border: `1px solid ${pagination.currentPage <= 1 ? "#334155" : "rgba(59, 130, 246, 0.3)"}`,
              borderRadius: "6px",
              cursor: pagination.currentPage <= 1 ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            Previous
          </button>
          
          <span style={{ color: "#94a3b8", fontSize: "14px" }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button 
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            style={{
              padding: "8px 16px",
              backgroundColor: pagination.currentPage >= pagination.totalPages ? "transparent" : "rgba(59, 130, 246, 0.1)",
              color: pagination.currentPage >= pagination.totalPages ? "#64748b" : "#60a5fa",
              border: `1px solid ${pagination.currentPage >= pagination.totalPages ? "#334155" : "rgba(59, 130, 246, 0.3)"}`,
              borderRadius: "6px",
              cursor: pagination.currentPage >= pagination.totalPages ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}