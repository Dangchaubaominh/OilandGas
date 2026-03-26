import { useCallback, useEffect, useState } from "react";
import { FaUserShield, FaUsers, FaCog, FaPlus, FaTrash } from "react-icons/fa";
import roleApi from "../../services/roleApi";
import { showToast } from "../../utils/toastHandler";
import RoleModal from "./RoleModal";

const ROLE_COLORS = ["#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ef4444"];

const getRoleColor = (index) => ROLE_COLORS[index % ROLE_COLORS.length];

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await roleApi.getRoles();
      const resData = response.data?.data || response.data || response;
      const roleList = Array.isArray(resData) ? resData : resData.roles || [];
      setRoles(roleList);
    } catch (err) {
      console.error("Error fetching roles:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load roles.";
      showToast("error", `Failed to load roles: ${errorMessage}`);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditPermissions = (role) => {
    setSelectedRole(role);
    setIsEditMode(true);
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setIsEditMode(false);
    setSelectedRole(null);
  };

  const openDeleteModal = (role) => {
    setDeleteTarget(role);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const getRoleId = (role) => role?._id || role?.id || role?.key;

  const handleSubmitRole = async (payload) => {
    setIsSaving(true);
    try {
      if (isEditMode) {
        const roleId = getRoleId(selectedRole);
        if (!roleId) {
          throw new Error("Missing role id for update.");
        }
        await roleApi.updateRole(roleId, payload);
        showToast("success", `Updated role \"${payload.name}\" successfully.`);
      } else {
        await roleApi.createRole(payload);
        showToast("success", `Created role \"${payload.name}\" successfully.`);
      }

      await fetchRoles();
      closeModal();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to save role.";
      showToast("error", `Failed to save role: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;

    const roleId = getRoleId(deleteTarget);
    const roleName = deleteTarget.name || deleteTarget.key || "selected role";

    if (!roleId) {
      showToast("error", "Missing role id for delete.");
      return;
    }

    setIsDeleting(true);
    try {
      await roleApi.deleteRole(roleId);
      showToast("success", `Deleted role \"${roleName}\" successfully.`);
      await fetchRoles();
      closeDeleteModal();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete role.";
      showToast("error", `Failed to delete role: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="role-management">
      <div className="page-header">
        <div>
          <h1>Role Management</h1>
          <p className="page-subtitle">
            Manage role definitions and permission sets for your users.
          </p>
        </div>
        <button className="btn-create" onClick={handleCreateRole}>
          <FaPlus /> Create New Role
        </button>
      </div>

      <div className="role-list">
        {isLoading && (
          <div className="role-item">
            <div className="role-left">
              <div
                className="role-icon-box"
                style={{ backgroundColor: ROLE_COLORS[0] }}
              >
                <FaUserShield />
              </div>
              <div className="role-details">
                <h3>Loading roles...</h3>
                <p>Please wait while role data is fetched from the server.</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && roles.length === 0 && (
          <div className="role-item">
            <div className="role-left">
              <div
                className="role-icon-box"
                style={{ backgroundColor: ROLE_COLORS[1] }}
              >
                <FaUserShield />
              </div>
              <div className="role-details">
                <h3>No roles found</h3>
                <p>No role data is currently available.</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading &&
          roles.map((role, index) => {
            const roleId = role._id || role.id || role.key || `role-${index}`;
            const roleName = role.name || role.key || "Unnamed role";
            const roleDescription =
              role.description || "No description available for this role.";

            return (
              <div key={roleId} className="role-item">
                <div className="role-left">
                  <div
                    className="role-icon-box"
                    style={{ backgroundColor: getRoleColor(index) }}
                  >
                    <FaUserShield />
                  </div>
                  <div className="role-details">
                    <h3>{roleName}</h3>
                    <p>{roleDescription}</p>
                  </div>
                </div>

                <div className="role-right">
                  <button
                    className="btn-role-delete"
                    onClick={() => openDeleteModal(role)}
                    disabled={isSaving || isDeleting}
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    className="btn-edit-permissions"
                    onClick={() => handleEditPermissions(role)}
                    disabled={isDeleting}
                  >
                    <FaCog /> Edit Permissions
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <RoleModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmitRole}
        isEditMode={isEditMode}
        isSaving={isSaving}
        initialValues={selectedRole}
      />

      {deleteTarget && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <FaTrash />
            </div>
            <h2>Delete Role</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget.name || deleteTarget.key || "this role"}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                onClick={handleDeleteRole}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
