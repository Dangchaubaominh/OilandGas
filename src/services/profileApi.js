// src/api/authApi.js
import axiosClient from "./AxiosClient";

const profileApi = {
  getProfile() {
    const url = "/api/users/profile";
    return axiosClient.get(url);
  },
  updateProfile(data) {
    const url = "/api/users/profile";
    return axiosClient.put(url, data);
  },
  getChangePassword(data) {
    const url = "/api/auth/change-password";
    return axiosClient.put(url, data);
  },
};

export default profileApi;
