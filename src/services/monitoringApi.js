import axiosClient from "./AxiosClient";

const monitoringApi = {
  getDashboard() {
    return axiosClient.get("/admin/monitoring/dashboard");
  },
};

export default monitoringApi;
