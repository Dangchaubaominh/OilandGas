import { useState, useEffect, useCallback } from "react";
import { showToast } from "../../utils/toastHandler";
import userApi from "../../services/userApi";
import useAuthStore from "../../store/useAuthStore";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import UserFormModal from "./UserFormModal";

const VIEW_MODES = {
  ACTIVE: "active",
  DELETED: "deleted",
  ALL: "all",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const [viewMode, setViewMode] = useState(VIEW_MODES.ACTIVE);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [modalDefaults, setModalDefaults] = useState(null);

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
  const fetchUsers = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        // Chuẩn bị tham số gọi API Server
        const params = {
          page,
          limit: pagination.limit,
          ...(searchQuery.trim() && { search: searchQuery.trim() }),
          ...(roleFilter !== "all" && { role: roleFilter }),
          ...(statusFilter !== "all" && { status: statusFilter }),
        };

        let response;
        if (viewMode === VIEW_MODES.DELETED) {
          response = await userApi.getDeletedUsers(params);
        } else if (viewMode === VIEW_MODES.ALL) {
          response = await userApi.getAllUsersMixed(params);
        } else {
          response = await userApi.getAllUsers(params);
        }

        const resData = response.data?.data || response.data || response;

        // Xử lý dữ liệu trả về theo cấu trúc Backend mới
        const usersList =
          resData.users || (Array.isArray(resData) ? resData : []);
        setUsers(usersList);

        // Đảm bảo pagination data được set chính xác từ backend
        if (resData.pagination) {
          setPagination({
            totalItems: resData.pagination.totalItems || 0,
            totalPages: resData.pagination.totalPages || 1,
            currentPage: resData.pagination.currentPage || page,
            limit: resData.pagination.limit || pagination.limit,
          });
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        showToast(
          "error",
          "Failed to load users: " +
            (err.response?.data?.message || err.message),
        );
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [viewMode, searchQuery, roleFilter, statusFilter, pagination.limit],
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
      const payload = {
        email: data.email,
        name: data.name,
        phone: data.phone,
        department: data.department,
        role: data.role === "Administrator" ? "admin" : data.role.toLowerCase(),
      };

      if (isEditMode) {
        payload.status = data.status;
        await userApi.updateUser(editingUserId, payload);
        showToast("success", `Updated user "${data.name}" successfully!`);
      } else {
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
    setEditingUserId(user._id || user.id); // Hỗ trợ cả _id (Backend) và id
    setModalDefaults({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "",
      role:
        user.role === "admin"
          ? "Administrator"
          : user.role?.charAt(0).toUpperCase() + user.role?.slice(1),
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
      phone: "",
      department: "",
      role: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleDelete = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${userName || "Unknown"}"?`,
      )
    )
      return;
    try {
      await userApi.deleteUser(userId);
      await fetchUsers(1); // Sau khi xóa nên đưa về trang 1
      showToast(
        "success",
        `Deleted user "${userName || "Unknown"}" successfully!`,
      );
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to delete user.";
      showToast("error", `Failed to delete user: ${errorMsg}`);
    }
  };

  const handleRestore = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to restore user "${userName || "Unknown"}"?`,
      )
    )
      return;
    try {
      await userApi.restoreUser(userId);
      await fetchUsers(1);
      showToast(
        "success",
        `Restored user "${userName || "Unknown"}" successfully!`,
      );
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to restore user.";
      showToast("error", `Failed to restore user: ${errorMsg}`);
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
        viewMode={viewMode}
        setViewMode={setViewMode}
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
      />

      <UserTable
        isLoading={isLoading}
        filteredUsers={users}
        searchQuery={searchQuery}
        viewMode={viewMode}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        // Thêm các hàm truyền xuống cho UserTable nếu file UserTable của bạn có xử lý nút Next/Prev
        pagination={pagination}
        onPageChange={(newPage) => fetchUsers(newPage)}
      />

      <UserFormModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={onSubmitForm}
        isEditMode={isEditMode}
        isSaving={isSaving}
        defaultValues={modalDefaults}
      />
    </div>
  );
}
