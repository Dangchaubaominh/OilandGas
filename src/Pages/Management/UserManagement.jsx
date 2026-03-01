import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userSchema } from "../../schemas/userSchema";
import { showToast } from "../../utils/toastHandler";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaSearch,
  FaSave,
  FaSync,
} from "react-icons/fa";
import userApi from "../../services/userApi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ setEditingUserId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    context: { isEditMode },
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",       
      department: "",  
      password: "",
      role: "",
      status: "active",
    },
  });

  const currentStatus = watch("status");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userApi.getAllUsers();
      const apiData = response.data?.data || response.data || response;
      setUsers(apiData); 
      setError(null);
    } catch (err) {
      console.error("Lỗi fetch API:", err);
      showToast("error", "Lỗi khi tải danh sách người dùng!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  // --- XỬ LÝ SUBMIT (TẠO MỚI / CẬP NHẬT) ---
  const onSubmitForm = async (data) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        email: data.email,
        name: data.fullName, 
        phone: data.phone,
        department: data.department,
        role: data.role === "Administrator" ? "admin" : data.role.toLowerCase(),
        status: data.status, 
      };

      if (data.password) {
        payload.password = data.password;
      }

      if (isEditMode) {
        // await userApi.updateUser(editingUserId, payload);
        showToast("success", `Đã cập nhật thành công user "${data.fullName}"!`);
      } else {
        await userApi.createUser(payload);
        showToast("success", `Tạo mới thành công user "${data.fullName}"!`);
      }

      await fetchUsers();
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi thao tác.";
      showToast("error", `${isEditMode ? "Cập nhật" : "Tạo mới"} thất bại: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setEditingUserId(user._id);

    reset({
      fullName: user.name || "",
      email: user.email || "",
      phone: user.phone || "",             
      department: user.department || "",   
      password: "", 
      role: user.role === "admin" ? "Administrator" : (user.role?.charAt(0).toUpperCase() + user.role?.slice(1)), 
      status: user.status?.toLowerCase() || "active",
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    reset({
      fullName: "",
      email: "",
      phone: "",
      department: "",
      password: "",
      role: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa user "${userName}"?`)) return;

    try {
      // await userApi.deleteUser(userId);
      await fetchUsers();
      showToast("success", `Đã xóa user "${userName}" thành công!`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi xóa user.";
      showToast("error", `Xóa thất bại: ${errorMsg}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setShowPassword(false);
    reset();
    setError(null);
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

  return (
    <div className="user-management">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>User Management</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-secondary" onClick={fetchUsers} disabled={isLoading} style={{ padding: "8px 16px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1" }}>
            <FaSync className={isLoading ? "spin" : ""} /> Làm mới
          </button>
          <button className="btn-create" onClick={handleCreate}>
            <FaPlus /> Create New User
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input type="text" placeholder="Tìm kiếm theo tên, email, SĐT..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: "40px" }} />
          {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "16px" }}>✕</button>}
        </div>
        <div className="filter-group">
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">Role: All</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="engineer">Engineer</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "16px", color: "#64748b", fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Showing {filteredUsers.length} of {users.length} users {searchQuery && ` matching "${searchQuery}"`}</span>
        {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
          <button onClick={() => { setSearchQuery(""); setRoleFilter("all"); setStatusFilter("all"); }} style={{ background: "none", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", color: "#64748b" }}>
            Clear Filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: "16px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔄</div>
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>USER ID</th>
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
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>Không tìm thấy người dùng nào phù hợp</td>
                </tr>
              ) : (
                filteredUsers?.map((user) => (
                  <tr key={user._id || user.id}>
                    <td><span title={user._id || user.id}>{(user._id || user.id)?.substring(0, 8)}...</span></td>
                    <td>{user.name || "-"}</td>
                    <td>{user.phone || "-"}</td>
                    <td>{user.email || "-"}</td>
                    <td><span className={`badge ${getRoleBadgeClass(user.role)}`}>{user.role || "N/A"}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(user.status)}`}>{user.status || "N/A"}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-edit" title="Edit User" onClick={() => handleEdit(user)}><FaEdit /></button>
                        <button className="btn-icon btn-delete" title="Delete User" onClick={() => handleDelete(user._id || user.id, user.name || user.email)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{isEditMode ? "Edit User" : "Create New User"}</h2>
                <p className="modal-subtitle">{isEditMode ? "Cập nhật thông tin người dùng" : "Thêm người dùng mới vào hệ thống"}</p>
              </div>
              <button className="modal-close" onClick={closeModal}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" className="form-input" placeholder="Enter full name" {...register("fullName")} disabled={isSaving} style={{ borderColor: errors.fullName ? "#ef4444" : "" }} />
                  {errors.fullName && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.fullName.message}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="text" className="form-input" placeholder="+1234567890" {...register("phone")} disabled={isSaving} style={{ borderColor: errors.phone ? "#ef4444" : "" }} />
                  {errors.phone && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.phone.message}</span>}
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <input type="text" className="form-input" placeholder="Oil & Gas Engineering" {...register("department")} disabled={isSaving} style={{ borderColor: errors.department ? "#ef4444" : "" }} />
                  {errors.department && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.department.message}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" className="form-input" placeholder="user@ogsys.com" {...register("email")} disabled={isSaving || isEditMode} style={{ borderColor: errors.email ? "#ef4444" : "" }} />
                  {errors.email && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label>Password {isEditMode ? "(Bỏ trống nếu giữ nguyên)" : "*"}</label>
                  <div className="password-field">
                    <input type={showPassword ? "text" : "password"} className="form-input" placeholder={isEditMode ? "Nhập mật khẩu mới để thay đổi" : "Nhập mật khẩu (ít nhất 6 ký tự)"} {...register("password")} disabled={isSaving} style={{ borderColor: errors.password ? "#ef4444" : "" }} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={isSaving}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.password.message}</span>}
                </div>

                <div className="form-group">
                  <label>Assign Role *</label>
                  <select className="form-select" {...register("role")} disabled={isSaving} style={{ borderColor: errors.role ? "#ef4444" : "" }}>
                    <option value="">Chọn quyền hạn</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Engineer">Engineer</option>
                  </select>
                  {errors.role && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.role.message}</span>}
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <div className="toggle-field">
                    <span className={currentStatus === "inactive" ? "toggle-label active" : "toggle-label"}>Inactive</span>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={currentStatus === "active"} onChange={(e) => setValue("status", e.target.checked ? "active" : "inactive", { shouldValidate: true })} disabled={isSaving} />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={currentStatus === "active" ? "toggle-label active" : "toggle-label"}>Active</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={isSaving}>Hủy</button>
                <button type="submit" className="btn-submit" disabled={isSaving} style={{ opacity: isSaving ? 0.6 : 1 }}>
                  {isEditMode ? <><FaSave /> {isSaving ? "Đang cập nhật..." : "Cập nhật User"}</> : <><FaUserPlus /> {isSaving ? "Đang tạo..." : "Tạo User"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}