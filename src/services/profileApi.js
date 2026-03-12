// src/services/profileApi.js
import axiosClient from "./AxiosClient";

const profileApi = {
  getProfile() {
    const url = "/users/profile";
    return axiosClient.get(url);
  },
  updateProfile(data) {
    const url = "/users/profile";
    return axiosClient.put(url, data);
  },
  uploadAvatar(file) {
    const url = "/users/profile/avatar";
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosClient.put(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getChangePassword(data) {
    const url = "/auth/change-password";
    return axiosClient.put(url, data);
  },
};

export default profileApi;
