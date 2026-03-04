import { useState, useEffect, useMemo, useCallback } from "react";
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
  const [viewMode, setViewMode] = useState(VIEW_MODES.ACTIVE);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [modalDefaults, setModalDefaults] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // --- FETCH USERS based on viewMode ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      if (viewMode === VIEW_MODES.DELETED) {
        response = await userApi.getDeletedUsers();
      } else if (viewMode === VIEW_MODES.ALL) {
        response = await userApi.getAllUsersMixed();
      } else {
        response = await userApi.getAllUsers();
      }
      const apiData = response.data?.data || response.data || response;
      setUsers(apiData);
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("error", "Failed to load users: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase().trim();

      const matchSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query);

      const matchRole =
        roleFilter === "all" ||
        user.role?.toLowerCase() === roleFilter.toLowerCase();

      const matchStatus =
        statusFilter === "all" ||
        user.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

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
        showToast(
          "success",
          `Created new user "${data.name}" successfully!`,
        );
      }

      await fetchUsers();
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
    setEditingUserId(user._id);
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
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`))
      return;

    try {
      await userApi.deleteUser(userId);
      await fetchUsers();
      showToast("success", `Deleted user "${userName}" successfully!`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to delete user.";
      showToast("error", `Failed to delete user: ${errorMsg}`);
    }
  };

  const handleRestore = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to restore user "${userName}"?`))
      return;

    try {
      await userApi.restoreUser(userId);
      await fetchUsers();
      showToast("success", `Restored user "${userName}" successfully!`);
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
        filteredCount={filteredUsers.length}
        totalCount={users.length}
        onReload={fetchUsers}
        onCreate={handleCreate}
      />

      <UserTable
        isLoading={isLoading}
        filteredUsers={filteredUsers}
        searchQuery={searchQuery}
        viewMode={viewMode}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
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
