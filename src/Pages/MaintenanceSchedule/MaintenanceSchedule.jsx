import { useState, useEffect } from "react";
import {
  FaPlus,
  FaCalendarAlt,
  FaWrench,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import maintenanceReportApi from "../../services/maintenanceReportApi";
import ScheduleDetailsModal from "./ScheduleDetailsModal";
import ScheduleFormModal from "./ScheduleFormModal";
import { showToast } from "../../utils/toastHandler";

export default function Schedule() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpcomingModalOpen, setIsUpcomingModalOpen] = useState(false);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formInitialData, setFormInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy mốc thời gian hiện tại
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth(); // 0 = Jan, 2 = Mar

  const [currentDate] = useState(new Date(currentYear, currentMonthIdx, 1));
  const currentMonthString = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // --- 1. GỌI API LẤY DỮ LIỆU ---
  const fetchMaintenance = async () => {
    setIsLoading(true);
    try {
      const response = await maintenanceReportApi.getMaintenanceReports();
      const apiRecords = response?.data?.data?.records || [];

      const normalizedRecords = apiRecords
        .filter((record) => record?.scheduledDate)
        .map((record) => ({
          ...record,
          _id: record._id,
          equipment: record.equipment,
          type: record.type || "maintenance",
          status: record.status || "scheduled",
          priority: record.priority || "medium",
          scheduledDate: record.scheduledDate,
        }));

      setRecords(normalizedRecords);
    } catch (error) {
      console.error("Lỗi tải lịch bảo trì:", error);
      setRecords([]);
      showToast("error", "Failed to load maintenance schedule.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  // --- 2. XỬ LÝ DỮ LIỆU TỪ API THÀNH CÁC KHỐI UI ---

  // A. Xử lý Thống kê (Stats)
  const calculateStats = () => {
    // Tính khoảng thời gian của tuần này
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    let thisWeek = 0;
    let overdue = 0;
    let completed = 0;

    records.forEach((r) => {
      const d = new Date(r.scheduledDate);
      if (r.status === "completed") completed++;
      if (r.status !== "completed" && d < today) overdue++;
      if (d >= startOfWeek && d <= endOfWeek) thisWeek++;
    });

    return [
      {
        value: records.length.toString(),
        label: "Total Schedules",
        color: "blue",
      },
      { value: thisWeek.toString(), label: "This Week", color: "purple" },
      { value: overdue.toString(), label: "Overdue", color: "red" },
      { value: completed.toString(), label: "Completed", color: "green" },
    ];
  };

  const stats = calculateStats();

  // B. Xử lý Lịch Sắp Tới (Upcoming - Tương lai)
  const upcomingWindowEnd = new Date(today);
  upcomingWindowEnd.setDate(upcomingWindowEnd.getDate() + 3);

  const upcomingMaintenanceAll = records
    .filter(
      (r) =>
        new Date(r.scheduledDate) >= today &&
        new Date(r.scheduledDate) <= upcomingWindowEnd &&
        r.status !== "completed",
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
    .map((r) => {
      const d = new Date(r.scheduledDate);
      return {
        id: r._id,
        title: r.equipment?.name
          ? `${r.equipment.name} - ${r.type}`
          : `${r.type.toUpperCase()} Maintenance`,
        equipment: r.equipment?.name || "General Facility",
        date: d.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        time: d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: r.status,
        raw: r,
      };
    });

  const upcomingMaintenance = upcomingMaintenanceAll.slice(0, 5);

  // C. Xử lý Lịch Quá Hạn (Overdue - Quá khứ & Chưa hoàn thành)
  const overdueMaintenance = records
    .filter(
      (r) => new Date(r.scheduledDate) < today && r.status !== "completed",
    )
    .map((r) => {
      const d = new Date(r.scheduledDate);
      const diffTime = Math.abs(today - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: r._id,
        title: r.equipment?.name
          ? `${r.equipment.name} - ${r.type}`
          : `${r.type.toUpperCase()} Maintenance`,
        equipment: r.equipment?.name || "General Facility",
        dueDate: d.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        daysOverdue: diffDays,
        raw: r,
      };
    });

  const openScheduleDetails = async (schedule) => {
    setSelectedSchedule(schedule);
    setDetailError("");
    setIsDetailLoading(true);

    try {
      const scheduleId = schedule?._id || schedule?.id;
      if (!scheduleId) throw new Error("Missing schedule id");

      const response =
        await maintenanceReportApi.getMaintenanceReportById(scheduleId);
      const detailData = response?.data?.data;

      if (!detailData) {
        setDetailError("Could not load schedule details.");
        return;
      }

      setSelectedSchedule((prev) => ({ ...(prev || {}), ...detailData }));
    } catch (error) {
      console.error("Lỗi tải chi tiết lịch bảo trì:", error);
      setDetailError(
        "Could not load full schedule details. Showing basic info.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeScheduleDetails = () => {
    setSelectedSchedule(null);
    setDetailError("");
    setIsDetailLoading(false);
  };

  const openCreateForm = () => {
    setFormMode("create");
    setFormInitialData(null);
    setIsFormOpen(true);
  };

  const openEditForm = (schedule) => {
    setFormMode("edit");
    setFormInitialData(schedule || selectedSchedule);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setFormInitialData(null);
    setIsSubmitting(false);
  };

  const closeUpcomingModal = () => {
    setIsUpcomingModalOpen(false);
  };

  const closeOverdueModal = () => {
    setIsOverdueModalOpen(false);
  };

  const openEditFromUpcomingModal = (schedule) => {
    closeUpcomingModal();
    openEditForm(schedule);
  };

  const openEditFromOverdueModal = (schedule) => {
    closeOverdueModal();
    openEditForm(schedule);
  };

  const submitForm = async (payload) => {
    setIsSubmitting(true);

    try {
      if (formMode === "edit") {
        const targetId = formInitialData?._id || selectedSchedule?._id;
        if (!targetId) throw new Error("Missing schedule id for update");
        await maintenanceReportApi.updateMaintenanceReport(targetId, payload);
        showToast("success", "Schedule updated successfully.");
      } else {
        await maintenanceReportApi.createMaintenanceReport(payload);
        showToast("success", "Schedule created successfully.");
      }

      closeFormModal();
      closeScheduleDetails();
      await fetchMaintenance();
    } catch (error) {
      console.error("Lỗi khi lưu lịch bảo trì:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to save schedule. This endpoint may be role-restricted.";
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSchedule = async (schedule) => {
    const targetId = schedule?._id || selectedSchedule?._id;
    if (!targetId) return;

    const confirmed = window.confirm("Delete this maintenance schedule?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await maintenanceReportApi.deleteMaintenanceReport(targetId, {
        reason: "Deleted from maintenance schedule page",
      });
      showToast("success", "Schedule deleted successfully.");
      closeScheduleDetails();
      await fetchMaintenance();
    } catch (error) {
      console.error("Lỗi khi xóa lịch bảo trì:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to delete maintenance schedule.";
      showToast("error", message);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 3. HÀM VẼ LỊCH (CALENDAR GRID) ---
  const getStatColorClass = (color) => {
    const colors = {
      blue: "stat-blue",
      purple: "stat-purple",
      red: "stat-red",
      green: "stat-green",
    };
    return colors[color] || "stat-blue";
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Điều chỉnh để Thứ 2 (Mon) là index 0

    const days = [];

    // Thêm các ô trống đầu tháng
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Thêm các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      // Tìm xem ngày này có sự kiện bảo trì nào không
      const dayEvents = records.filter((r) => {
        const d = new Date(r.scheduledDate);
        return (
          d.getDate() === day &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      });

      days.push(
        <div key={day} className="calendar-day">
          <div className="day-number">{day}</div>

          {dayEvents.map((event, idx) => {
            // Quyết định màu (Class CSS) dựa trên Priority hoặc Trạng thái
            let eventClass = "event-maintenance";
            if (event.status === "completed") eventClass = "event-completed";
            else if (new Date(event.scheduledDate) < today)
              eventClass = "event-overdue";
            else if (event.priority === "high")
              eventClass = "event-calibration";

            const title = event.equipment?.name || event.type;

            return (
              <div
                key={event._id || idx}
                className={`calendar-event ${eventClass}`}
                style={{
                  gridColumn: `span 1`,
                  fontSize: "11px",
                  padding: "2px 4px",
                  marginBottom: "2px",
                  borderRadius: "4px",
                }}
                title={title}
              >
                {title}
              </div>
            );
          })}
        </div>,
      );
    }

    return days;
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div>
          <h1>Maintenance Schedule</h1>
          <p className="schedule-subtitle">
            Plan and track all maintenance activities
          </p>
        </div>
        <div className="schedule-actions">
          <button className="btn-add-schedule" onClick={openCreateForm}>
            <FaPlus /> Add Schedule
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="schedule-stats">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`schedule-stat-card ${getStatColorClass(stat.color)}`}
          >
            <div className="stat-value">{isLoading ? "-" : stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <div className="calendar-header">
          <h2>{currentMonthString}</h2>
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-weekdays">
            <div className="weekday">Mon</div>
            <div className="weekday">Tue</div>
            <div className="weekday">Wed</div>
            <div className="weekday">Thu</div>
            <div className="weekday">Fri</div>
            <div className="weekday">Sat</div>
            <div className="weekday">Sun</div>
          </div>
          <div className="calendar-grid">{renderCalendar()}</div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot legend-maintenance"></div>
            <span>Scheduled</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-calibration"></div>
            <span>High Priority</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-overdue"></div>
            <span>Overdue</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-completed"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="schedule-bottom">
        {/* Upcoming Maintenance */}
        <div className="schedule-panel">
          <div className="panel-header">
            <h3>Upcoming Maintenance</h3>
            <button
              className="btn-view-all-schedule"
              onClick={() => setIsUpcomingModalOpen(true)}
            >
              View All
            </button>
          </div>
          <div className="maintenance-tasks">
            {upcomingMaintenance.length === 0 && (
              <p className="text-gray-500 text-sm mt-4">No upcoming tasks.</p>
            )}
            {upcomingMaintenance.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-icon task-icon-blue">
                  <FaWrench />
                </div>
                <div className="task-details">
                  <h4>{task.title}</h4>
                  <p className="task-equipment">
                    <FaCog /> {task.equipment}
                  </p>
                  <p className="task-datetime">
                    <FaCalendarAlt /> {task.date} • {task.time}
                  </p>
                </div>
                <button
                  className="btn-schedule"
                  onClick={() => openEditForm(task.raw)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Maintenance */}
        <div className="schedule-panel">
          <div className="panel-header">
            <h3>
              Overdue Maintenance
              <span className="overdue-badge">{overdueMaintenance.length}</span>
            </h3>
            <button
              className="btn-view-all-schedule"
              onClick={() => setIsOverdueModalOpen(true)}
            >
              View All
            </button>
          </div>
          <div className="maintenance-tasks">
            {overdueMaintenance.length === 0 && (
              <p className="text-gray-500 text-sm mt-4">
                All tasks are up to date!
              </p>
            )}
            {overdueMaintenance.map((task) => (
              <div key={task.id} className="task-item task-overdue">
                <div className="task-icon task-icon-red">
                  <FaExclamationTriangle />
                </div>
                <div className="task-details">
                  <h4>{task.title}</h4>
                  <p className="task-equipment">
                    <FaCog /> {task.equipment}
                  </p>
                  <p className="task-overdue-info">
                    Due: {task.dueDate} • {task.daysOverdue} days overdue
                  </p>
                </div>
                <button className="btn-reschedule">Reschedule</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isUpcomingModalOpen && (
        <div className="schedule-modal-overlay" onClick={closeUpcomingModal}>
          <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="schedule-modal-header">
              <h3>Upcoming Maintenance (Next 3 Days)</h3>
              <button
                type="button"
                className="schedule-modal-close"
                onClick={closeUpcomingModal}
              >
                x
              </button>
            </div>

            <div className="maintenance-tasks">
              {upcomingMaintenanceAll.length === 0 && (
                <p className="text-gray-500 text-sm mt-4">
                  No maintenance schedules in the next 3 days.
                </p>
              )}

              {upcomingMaintenanceAll.map((task) => (
                <div key={`modal-${task.id}`} className="task-item">
                  <div className="task-icon task-icon-blue">
                    <FaWrench />
                  </div>
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    <p className="task-equipment">
                      <FaCog /> {task.equipment}
                    </p>
                    <p className="task-datetime">
                      <FaCalendarAlt /> {task.date} • {task.time}
                    </p>
                  </div>
                  <button
                    className="btn-schedule"
                    onClick={() => openEditFromUpcomingModal(task.raw)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isOverdueModalOpen && (
        <div className="schedule-modal-overlay" onClick={closeOverdueModal}>
          <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="schedule-modal-header">
              <h3>All Overdue Maintenance</h3>
              <button
                type="button"
                className="schedule-modal-close"
                onClick={closeOverdueModal}
              >
                x
              </button>
            </div>

            <div className="maintenance-tasks">
              {overdueMaintenance.length === 0 && (
                <p className="text-gray-500 text-sm mt-4">No overdue tasks.</p>
              )}

              {overdueMaintenance.map((task) => (
                <div
                  key={`overdue-modal-${task.id}`}
                  className="task-item task-overdue"
                >
                  <div className="task-icon task-icon-red">
                    <FaExclamationTriangle />
                  </div>
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    <p className="task-equipment">
                      <FaCog /> {task.equipment}
                    </p>
                    <p className="task-overdue-info">
                      Due: {task.dueDate} • {task.daysOverdue} days overdue
                    </p>
                  </div>
                  <button
                    className="btn-schedule"
                    onClick={() => openEditFromOverdueModal(task.raw)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ScheduleDetailsModal
        selectedSchedule={selectedSchedule}
        isLoading={isDetailLoading}
        errorMessage={detailError}
        isDeleting={isDeleting}
        onEdit={openEditForm}
        onDelete={deleteSchedule}
        onClose={closeScheduleDetails}
      />

      <ScheduleFormModal
        isOpen={isFormOpen}
        mode={formMode}
        initialData={formInitialData}
        isSubmitting={isSubmitting}
        onSubmit={submitForm}
        onClose={closeFormModal}
      />
    </div>
  );
}
