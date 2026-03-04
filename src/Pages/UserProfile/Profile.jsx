import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileSchema } from "../../schemas/profileSchema";
import profileApi from "../../services/profileApi";
import ChangePasswordModal from "./ChangePasswordModal";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa";
import { showToast } from "../../utils/toastHandler";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileApi.getProfile();
        const resData = response.data;

        if (resData.success) {
          const userData = resData.data;
          setProfileData(userData);
          reset({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            department: userData.department || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const handleSaveChanges = async (data) => {
    setIsSaving(true);

    try {
      const updatePayload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
      };

      const response = await profileApi.updateProfile(updatePayload);
      const resData = response.data || response;

      if (resData.success) {
        showToast("success", "Profile updated successfully!");
        setProfileData((prev) => ({
          ...prev,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
        }));
      } else {
        showToast("error", "Update failed: " + resData.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("error", "An error occurred while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      reset({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        department: profileData.department || "",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117] text-white">
        Failed to load profile data.
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0d1117] min-h-screen text-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white">User Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account settings and preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <FaLock className="text-gray-400" /> Change Password
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Profile info card */}
          <div className="col-span-1 space-y-6">
            <div className="bg-[#161a23] border border-gray-800 rounded-xl p-6 flex flex-col items-center shadow-sm relative">
              <div className="absolute top-4 right-4">
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    profileData.status === "active"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      profileData.status === "active"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  {profileData.status}
                </span>
              </div>

              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2545b8] to-blue-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4 mt-2">
                {profileData?.email
                  ? profileData.email.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <h2 className="text-lg font-semibold text-white">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-400 mb-2">{profileData.email}</p>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium uppercase tracking-wider rounded-full border border-blue-500/20">
                {profileData.role}
              </span>

              <div className="w-full mt-6 pt-6 border-t border-gray-800 space-y-3">
                <div className="flex items-center text-sm text-gray-400">
                  <FaCalendarAlt className="mr-3 text-gray-500" />
                  <span>Joined: {formatDate(profileData.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Edit form */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-[#161a23] border border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-3">
                Account Details
              </h3>

              <form
                onSubmit={handleSubmit(handleSaveChanges)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        {...register("name")}
                        autoComplete="off"
                        className="w-full bg-[#0d1117] border text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                        style={{
                          borderColor: errors.name ? "#ef4444" : "#374151",
                        }}
                      />
                    </div>
                    {errors.name && (
                      <span
                        className="text-xs mt-1 block"
                        style={{ color: "#ef4444" }}
                      >
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        {...register("email")}
                        autoComplete="off"
                        className="w-full bg-[#0d1117] border text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                        style={{
                          borderColor: errors.email ? "#ef4444" : "#374151",
                        }}
                      />
                    </div>
                    {errors.email && (
                      <span
                        className="text-xs mt-1 block"
                        style={{ color: "#ef4444" }}
                      >
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 rotate-90" />
                      <input
                        type="tel"
                        {...register("phone")}
                        autoComplete="off"
                        className="w-full bg-[#0d1117] border text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                        style={{
                          borderColor: errors.phone ? "#ef4444" : "#374151",
                        }}
                      />
                    </div>
                    {errors.phone && (
                      <span
                        className="text-xs mt-1 block"
                        style={{ color: "#ef4444" }}
                      >
                        {errors.phone.message}
                      </span>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        {...register("department")}
                        autoComplete="off"
                        className="w-full bg-[#0d1117] border text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                        style={{
                          borderColor: errors.department
                            ? "#ef4444"
                            : "#374151",
                        }}
                      />
                    </div>
                    {errors.department && (
                      <span
                        className="text-xs mt-1 block"
                        style={{ color: "#ef4444" }}
                      >
                        {errors.department.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
