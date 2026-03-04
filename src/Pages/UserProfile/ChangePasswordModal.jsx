import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "../../schemas/changePasswordSchema";
import { FaLock, FaTimes } from "react-icons/fa";
import profileApi from "../../services/profileApi";
import { showToast } from "../../utils/toastHandler";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      const response = await profileApi.getChangePassword(payload);
      const resData = response.data || response;

      if (resData.success) {
        showToast("success", "Password changed successfully!");
        reset();
        onClose();
      } else {
        showToast("error", resData.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const serverErrorMsg =
        error.response?.data?.message ||
        "An error occurred while changing password.";
      showToast("error", serverErrorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaLock style={{ color: "#60a5fa", fontSize: "16px" }} />
            </div>
            <div>
              <h2>Change Password</h2>
              <p className="modal-subtitle">
                Enter your current password and a new one.
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Current Password *</label>
              <div style={{ position: "relative" }}>
                <FaLock
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="password"
                  {...register("oldPassword")}
                  autoComplete="off"
                  className="form-input"
                  placeholder="Enter current password"
                  disabled={isSubmitting}
                  style={{
                    paddingLeft: "36px",
                    borderColor: errors.oldPassword ? "#ef4444" : "",
                  }}
                />
              </div>
              {errors.oldPassword && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.oldPassword.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <div style={{ position: "relative" }}>
                <FaLock
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="password"
                  {...register("newPassword")}
                  autoComplete="off"
                  className="form-input"
                  placeholder="Enter new password (min 6 characters)"
                  disabled={isSubmitting}
                  style={{
                    paddingLeft: "36px",
                    borderColor: errors.newPassword ? "#ef4444" : "",
                  }}
                />
              </div>
              {errors.newPassword && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <div style={{ position: "relative" }}>
                <FaLock
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="password"
                  {...register("confirmPassword")}
                  autoComplete="off"
                  className="form-input"
                  placeholder="Re-enter new password"
                  disabled={isSubmitting}
                  style={{
                    paddingLeft: "36px",
                    borderColor: errors.confirmPassword ? "#ef4444" : "",
                  }}
                />
              </div>
              {errors.confirmPassword && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          <div
            className="modal-footer"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                opacity: isSubmitting ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaLock /> {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
