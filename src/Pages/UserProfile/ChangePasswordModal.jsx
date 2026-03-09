import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "../../schemas/changePasswordSchema";
import { FaLock, FaTimes, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import profileApi from "../../services/profileApi";
import { showToast } from "../../utils/toastHandler";

// Password rules theo SRS: 8-12 ký tự, hoa, thường, số
const passwordRules = [
  { id: "length", label: "8–12 characters", test: (v) => v.length >= 8 && v.length <= 12 },
  { id: "upper",  label: "Uppercase letter (A–Z)", test: (v) => /[A-Z]/.test(v) },
  { id: "lower",  label: "Lowercase letter (a–z)", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "Number (0–9)", test: (v) => /[0-9]/.test(v) },
];

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Gộp state ẩn/hiện mật khẩu cho gọn gàng
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Dùng watch để theo dõi real-time phục vụ cho giao diện Checklist và Check Match
  const newPasswordValue = watch("newPassword") || "";
  const confirmNewPasswordValue = watch("confirmNewPassword") || "";

  const isPasswordValid = passwordRules.every((r) => r.test(newPasswordValue));
  const isConfirmMatch = confirmNewPasswordValue.length > 0 && newPasswordValue === confirmNewPasswordValue;

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setShow({ currentPassword: false, newPassword: false, confirmNewPassword: false });
    onClose();
  };

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      };

      const response = await profileApi.getChangePassword(payload);
      const resData = response.data || response;

      if (resData?.success) {
        showToast("success", "Password changed successfully! Please log in again.");
        handleClose();
      } else {
        showToast("error", resData?.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      const msg = err.response?.data?.message || "Current password is incorrect or server error.";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#0d1117] border border-gray-700 text-sm text-white rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-[#161a23] border border-gray-700 rounded-2xl w-full max-w-md p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FaLock className="text-blue-400 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Change Password</h2>
            <p className="text-sm text-gray-500">Enter your current and new password.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type={show.currentPassword ? "text" : "password"}
                {...register("currentPassword")}
                placeholder="Enter current password"
                autoComplete="off"
                disabled={isSubmitting}
                className={`${inputClass} ${errors.currentPassword ? "!border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => toggleShow("currentPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {show.currentPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="text-red-500 text-xs mt-1 block">{errors.currentPassword.message}</span>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type={show.newPassword ? "text" : "password"}
                {...register("newPassword")}
                placeholder="Enter new password"
                autoComplete="off"
                disabled={isSubmitting}
                className={`${inputClass} ${errors.newPassword ? "!border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => toggleShow("newPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {show.newPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="text-red-500 text-xs mt-1 block">{errors.newPassword.message}</span>
            )}
          </div>

          {/* Password Rules Checklist */}
          {newPasswordValue.length > 0 && (
            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-3 space-y-1.5">
              {passwordRules.map((rule) => {
                const pass = rule.test(newPasswordValue);
                return (
                  <div key={rule.id} className="flex items-center gap-2">
                    <FaCheckCircle size={11} className={pass ? "text-emerald-400" : "text-gray-600"} />
                    <span className={`text-xs ${pass ? "text-emerald-400" : "text-gray-500"}`}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type={show.confirmNewPassword ? "text" : "password"}
                {...register("confirmNewPassword")}
                placeholder="Re-enter new password"
                autoComplete="off"
                disabled={isSubmitting}
                className={`${inputClass} ${
                  confirmNewPasswordValue.length > 0
                    ? isConfirmMatch
                      ? "!border-emerald-500 focus:!ring-emerald-500"
                      : "!border-red-500 focus:!ring-red-500"
                    : errors.confirmNewPassword ? "!border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShow("confirmNewPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {show.confirmNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <span className="text-red-500 text-xs mt-1 block">{errors.confirmNewPassword.message}</span>
            )}
          </div>

          <div className="border-t border-gray-800 pt-1 mt-4"></div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (newPasswordValue.length > 0 && !isPasswordValid) || (confirmNewPasswordValue.length > 0 && !isConfirmMatch)}
              className="flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaLock /> {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}