import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createUserSchema, updateUserSchema } from "../../schemas/userSchema";
import { FaTimes, FaUserPlus, FaSave } from "react-icons/fa";

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  isSaving,
  defaultValues,
}) {
  // Select schema based on mode
  const schema = useMemo(
    () => (isEditMode ? updateUserSchema : createUserSchema),
    [isEditMode],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "",
      role: "",
      status: "active",
    },
  });

  const currentStatus = watch("status");

  // Reset form khi Modal mở ra hoặc khi defaultValues thay đổi
  useEffect(() => {
    if (isOpen && defaultValues) {
      reset(defaultValues);
    }
  }, [isOpen, defaultValues, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{isEditMode ? "Edit User" : "Create New User"}</h2>
            <p className="modal-subtitle">
              {isEditMode
                ? "Update user information"
                : "Add a new user to the system"}
            </p>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            {/* Full Name */}
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter full name"
                {...register("name")}
                disabled={isSaving}
                style={{ borderColor: errors.name ? "#ef4444" : "" }}
              />
              {errors.name && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            {!isEditMode && (
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  {...register("password")}
                  disabled={isSaving}
                  style={{ borderColor: errors.password ? "#ef4444" : "" }}
                />
                {errors.password && (
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    {errors.password.message}
                  </span>
                )}
              </div>
            )}

            {/* Phone Number */}
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="+84 or 09..."
                {...register("phone")}
                disabled={isSaving}
                style={{ borderColor: errors.phone ? "#ef4444" : "" }}
              />
              {errors.phone && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* Department */}
            <div className="form-group">
              <label>Department *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Oil & Gas Engineering"
                {...register("department")}
                disabled={isSaving}
                style={{ borderColor: errors.department ? "#ef4444" : "" }}
              />
              {errors.department && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.department.message}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="user@example.com"
                {...register("email")}
                disabled={isSaving}
                style={{ borderColor: errors.email ? "#ef4444" : "" }}
              />
              {errors.email && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Assign Role */}
            <div className="form-group">
              <label>Assign Role *</label>
              <select
                className="form-select"
                {...register("role")}
                disabled={isSaving}
                style={{ borderColor: errors.role ? "#ef4444" : "" }}
              >
                <option value="">Select role</option>
                <option value="admin">Administrator</option>
                <option value="supervisor">Supervisor</option>
                <option value="engineer">Engineer</option>
              </select>
              {errors.role && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.role.message}
                </span>
              )}
            </div>

            {isEditMode && (
              <div className="form-group">
                <label>Account Status</label>
                <div className="toggle-field">
                  <span
                    className={
                      currentStatus === "inactive"
                        ? "toggle-label active"
                        : "toggle-label"
                    }
                  >
                    Inactive
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={currentStatus === "active"}
                      onChange={(e) =>
                        setValue(
                          "status",
                          e.target.checked ? "active" : "inactive",
                          { shouldValidate: true },
                        )
                      }
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span
                    className={
                      currentStatus === "active"
                        ? "toggle-label active"
                        : "toggle-label"
                    }
                  >
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className="modal-footer"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSaving}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#f87171",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSaving}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#60a5fa",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                opacity: isSaving ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isEditMode ? (
                <>
                  <FaSave /> {isSaving ? "Updating..." : "Update User"}
                </>
              ) : (
                <>
                  <FaUserPlus /> {isSaving ? "Creating..." : "Create User"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
