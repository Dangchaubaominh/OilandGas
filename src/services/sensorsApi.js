// src/services/sensorsApi.js
import axiosClient from "./AxiosClient";

const sensorsApi = {
  // 1. Get Real-time Sensor Data
  getRealtimeSensorData(params = {}) {
    const url = "engineer/sensors/realtime";
    return axiosClient.get(url, { params });
  },

  // 2. Get Sensor Trends and Historical Data
  getSensorTrends(id, params = {}) {
    if (!id) throw new Error("Missing sensor id for trends");
    const safeId = encodeURIComponent(id);
    const url = `engineer/sensors/${safeId}/trends`;
    return axiosClient.get(url, { params });
  },

  // 3. Update Sensor Reading
  updateSensorReading(id, data) {
    if (!id) throw new Error("Missing sensor id for reading update");
    const safeId = encodeURIComponent(id);
    const url = `engineer/sensors/${safeId}/reading`;
    return axiosClient.post(url, data);
  },

  // 4. Get Sensor Alarms
  getSensorAlarms(params = {}) {
    const url = "engineer/sensors/alarms";
    return axiosClient.get(url, { params });
  },

  // 5. Acknowledge Sensor Alarm
  acknowledgeSensorAlarm(id, alarmId, data = {}) {
    if (!id) throw new Error("Missing sensor id for alarm acknowledgement");
    if (!alarmId) throw new Error("Missing alarm id for acknowledgement");
    const safeSensorId = encodeURIComponent(id);
    const safeAlarmId = encodeURIComponent(alarmId);
    const url = `engineer/sensors/${safeSensorId}/alarms/${safeAlarmId}/acknowledge`;
    return axiosClient.post(url, data);
  },

  // 6. Get Sensor Dashboard Data
  getSensorDashboard(params = {}) {
    const url = "engineer/sensors/dashboard";
    return axiosClient.get(url, { params });
  },
};

export default sensorsApi;
