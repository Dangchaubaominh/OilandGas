import { useState, useEffect, useCallback } from "react";
import { showToast } from "../../utils/toastHandler";
import userApi from "../../services/userApi";
import roleApi from "../../services/roleApi";
import useAuthStore from "../../store/useAuthStore";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import UserFormModal from "./UserFormModal";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState([]);

  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [modalDefaults, setModalDefaults] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    userId: null,
    userName: "",
    isProcessing: false,
  });

  // --- STATES FOR FILTERS & PAGINATION ---
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // --- FETCH USERS FROM BACKEND ---
  const fetchRoles = useCallback(async () => {
    try {
      const response = await roleApi.getRoles();
      const rolesList = response.data?.data || response.data || [];
      setRoles(Array.isArray(rolesList) ? rolesList : []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    }
  }, []);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // --- FETCH USERS FROM BACKEND ---
  const fetchUsers = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const baseParams = {
          page,
          limit: pagination.limit,
        };

        let response;

        if (statusFilter === "deleted") {
          // /users/deleted only accepts page and limit
          response = await userApi.getUsersDeleted(baseParams);
        } else if (statusFilter === "all") {
          // /users/all accepts page, limit, and optional status/includeDeleted
          response = await userApi.getUsersAll(baseParams);
        } else {
          // /users accepts page, limit, and search
          response = await userApi.getActiveUsers({
            ...baseParams,
            search: searchQuery.trim() || undefined,
          });
        }

        const resData = response.data?.data || response.data || response;

        // Xử lý dữ liệu trả về theo cấu trúc Backend mới
        let usersList =
          resData.users || (Array.isArray(resData) ? resData : []);

        // Apply role filter on client-side
        if (roleFilter !== "all") {
          usersList = usersList.filter(
            (user) => user.role?.toLowerCase() === roleFilter.toLowerCase(),
          );
        }

        setUsers(usersList);

        if (resData.pagination) {
          setPagination(resData.pagination);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        showToast(
          "error",
          "Failed to load users: " +
            (err.response?.data?.message || err.message),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, roleFilter, statusFilter, pagination.limit],
  );

  // Tự động gọi API khi filter thay đổi (Debounce được xử lý ngầm bởi useCallback dependencies)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1); // Reset về trang 1 mỗi khi đổi bộ lọc
    }, 500); // Chờ 500ms sau khi ngừng gõ để tránh spam API
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // --- SUBMIT: CREATE / UPDATE ---
  const onSubmitForm = async (data) => {
    setIsSaving(true);
    try {
      let payload = {};

      if (isEditMode) {
        // Update form fields follow PUT /users/{id} body
        payload = {
          name: data.name?.trim(),
          email: data.email?.trim().toLowerCase(),
          phone: data.phone?.trim(),
          department: data.department?.trim(),
          role: (data.role || "").toLowerCase(),
          status: data.status === "inactive" ? "inactive" : "active",
        };

        await userApi.updateUser(editingUserId, payload);
        showToast("success", `Updated user successfully!`);
      } else {
        // Create form fields follow POST /users body
        payload = {
          email: data.email?.trim().toLowerCase(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          name: data.name?.trim(),
          phone: data.phone?.trim(),
          department: data.department?.trim(),
          role: (data.role || "").toLowerCase(),
        };
        await userApi.createUser(payload);
        showToast("success", `Created new user "${data.name}" successfully!`);
      }

      await fetchUsers(pagination.currentPage); // Load lại trang hiện tại
      closeModal();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Error saving user.";
      showToast(
        "error",
        `${isEditMode ? "Update" : "Create"} failed: ${errorMsg}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    // Update API expects id path param as Mongo ObjectId
    setEditingUserId(user._id || user.id || user.userCode);
    setModalDefaults({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      department: user.department || "",
      role: user.role?.toLowerCase() || "",
      status: user.status?.toLowerCase() || "active",
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setModalDefaults({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      department: "",
      role: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openConfirmModal = (action, userId, userName) => {
    setConfirmModal({
      isOpen: true,
      action,
      userId,
      userName: userName || "Unknown",
      isProcessing: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      action: null,
      userId: null,
      userName: "",
      isProcessing: false,
    });
  };

  const handleDelete = async (userId, userName) => {
    openConfirmModal("delete", userId, userName);
  };

  const handleRestore = async (userId, userName) => {
    openConfirmModal("restore", userId, userName);
  };

  const handleConfirmAction = async () => {
    const { action, userId, userName } = confirmModal;
    if (!action || !userId) return;

    setConfirmModal((prev) => ({ ...prev, isProcessing: true }));

    try {
      if (action === "delete") {
        await userApi.deleteUser(userId);
        await fetchUsers(1); // Sau khi xóa nên đưa về trang 1
        showToast("success", `Deleted user "${userName}" successfully!`);
      }

      if (action === "restore") {
        await userApi.restoreUser(userId);
        await fetchUsers(1);
        showToast("success", `Restored user "${userName}" successfully!`);
      }

      closeConfirmModal();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${action} user.`;
      showToast("error", `Failed to ${action} user: ${errorMsg}`);
      setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingUserId(null);
  };

  return (
    <div className="user-management">
      <UserFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        isAdmin={isAdmin}
        isLoading={isLoading}
        filteredCount={users.length}
        totalCount={pagination.totalItems}
        onReload={() => fetchUsers(pagination.currentPage)}
        onCreate={handleCreate}
        roles={roles}
      />

      <UserTable
        isLoading={isLoading}
        filteredUsers={users}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        pagination={pagination}
        onPageChange={(newPage) => fetchUsers(newPage)}
      />

      <UserFormModal
        key={isEditMode ? "edit" : "create"}
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={onSubmitForm}
        isEditMode={isEditMode}
        isSaving={isSaving}
        defaultValues={modalDefaults}
      />

      {confirmModal.isOpen && (
        <div className="modal-overlay" onClick={closeConfirmModal}>
          <div
            className="modal-content"
            style={{ maxWidth: "440px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {confirmModal.action === "delete"
                    ? "Confirm Delete"
                    : "Confirm Restore"}
                </h2>
                <p className="modal-subtitle">
                  {confirmModal.action === "delete"
                    ? `Are you sure you want to delete user \"${confirmModal.userName}\"?`
                    : `Are you sure you want to restore user \"${confirmModal.userName}\"?`}
                </p>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                className="btn-cancel"
                onClick={closeConfirmModal}
                disabled={confirmModal.isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={handleConfirmAction}
                disabled={confirmModal.isProcessing}
                style={{
                  backgroundColor:
                    confirmModal.action === "delete"
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(34, 197, 94, 0.2)",
                  borderColor:
                    confirmModal.action === "delete"
                      ? "rgba(239, 68, 68, 0.5)"
                      : "rgba(34, 197, 94, 0.5)",
                  color:
                    confirmModal.action === "delete" ? "#fca5a5" : "#86efac",
                }}
              >
                {confirmModal.isProcessing
                  ? "Processing..."
                  : confirmModal.action === "delete"
                    ? "Delete"
                    : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
