import { FaPlus, FaSearch, FaSync } from "react-icons/fa";

const VIEW_MODES = {
  ACTIVE: "active",
  DELETED: "deleted",
  ALL: "all",
};

export default function UserFilters({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  isAdmin,
  isLoading,
  filteredCount,
  totalCount,
  onReload,
  onCreate,
}) {
  return (
    <>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>User Management</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-secondary"
            onClick={onReload}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#60a5fa",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              transition: "all 0.2s",
            }}
          >
            <FaSync className={isLoading ? "spin" : ""} /> Reload
          </button>
          {isAdmin && viewMode !== VIEW_MODES.DELETED && (
            <button
              className="btn-create"
              onClick={onCreate}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#4ade80",
                backgroundColor: "rgba(74, 222, 128, 0.1)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                transition: "all 0.2s",
              }}
            >
              <FaPlus /> Create New User
            </button>
          )}
        </div>
      </div>

      {/* View Mode Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "0",
        }}
      >
        {[
          { key: VIEW_MODES.ACTIVE, label: "Active Users" },
          ...(isAdmin
            ? [
                { key: VIEW_MODES.DELETED, label: "Deleted Users" },
                { key: VIEW_MODES.ALL, label: "All Users" },
              ]
            : []),
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            style={{
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: 500,
              border: "none",
              borderBottom:
                viewMode === key
                  ? "2px solid #60a5fa"
                  : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              color: viewMode === key ? "#60a5fa" : "#64748b",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Search by name, email, phone number, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          )}
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Role: All</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="engineer">Engineer</option>
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      <div
        style={{
          marginBottom: "16px",
          color: "#64748b",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          Showing {filteredCount} of {totalCount} users{" "}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
              setStatusFilter("all");
            }}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </>
  );
}
