import { useState } from "react";
import { FaPlus, FaEdit, FaCalendarAlt, FaWrench, FaCog, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

export default function Schedule() {
  const [currentMonth] = useState("January 2024");

  const stats = [
    { value: "45", label: "Total Schedules", color: "blue" },
    { value: "7", label: "This Week", color: "purple" },
    { value: "23", label: "Overdue", color: "red" },
    { value: "24", label: "Completed", color: "green" }
  ];

  const calendarEvents = [
    { day: 5, title: "Pump Maintenance", type: "maintenance", span: 2 },
    { day: 8, title: "Valve Calibration", type: "calibration", span: 2 },
    { day: 15, title: "Sensor Inspection", type: "maintenance", span: 1 },
    { day: 17, title: "Critical Repair", type: "overdue", span: 3 },
    { day: 22, title: "Equipment Check", type: "calibration", span: 4 },
    { day: 24, title: "System Calibration", type: "calibration", span: 2 }
  ];

  const upcomingMaintenance = [
    {
      id: 1,
      title: "Hydraulic Pump 340 - Overdue Inspection",
      equipment: "Hydraulic System A",
      date: "Feb 06, 2026",
      time: "09:00 AM",
      status: "pending"
    },
    {
      id: 2,
      title: "Pressure Sensor 450 - LDIN-0824",
      equipment: "Main Control Panel",
      date: "Feb 07, 2026",
      time: "02:00 PM",
      status: "pending"
    },
    {
      id: 3,
      title: "Flow Meter Check - Quarterly Service",
      equipment: "Pipeline System B",
      date: "Feb 09, 2026",
      time: "10:30 AM",
      status: "warning"
    }
  ];

  const overdueMaintenance = [
    {
      id: 1,
      title: "Safety Valve 01 - Critical Inspection",
      equipment: "Emergency System",
      dueDate: "Jan 28, 2026",
      daysOverdue: 8
    },
    {
      id: 2,
      title: "Compressor Unit - Annual Maintenance",
      equipment: "Air Compression Unit 3",
      dueDate: "Jan 30, 2026",
      daysOverdue: 6
    }
  ];

  const getStatColorClass = (color) => {
    const colors = {
      blue: "stat-blue",
      purple: "stat-purple",
      red: "stat-red",
      green: "stat-green"
    };
    return colors[color] || "stat-blue";
  };

  const renderCalendar = () => {
    const daysInMonth = 31;
    const firstDay = 0; // Monday
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = calendarEvents.filter(e => e.day === day);
      days.push(
        <div key={day} className="calendar-day">
          <div className="day-number">{day}</div>
          {dayEvents.map((event, idx) => (
            <div 
              key={idx} 
              className={`calendar-event event-${event.type}`}
              style={{ gridColumn: `span ${event.span}` }}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div>
          <h1>Maintenance Schedule</h1>
          <p className="schedule-subtitle">Plan and track all maintenance activities</p>
        </div>
        <div className="schedule-actions">
          <button className="btn-add-schedule">
            <FaPlus />
            Add Schedule
          </button>
          <button className="btn-edit-table">
            <FaEdit />
            Edit Table
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="schedule-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`schedule-stat-card ${getStatColorClass(stat.color)}`}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <div className="calendar-header">
          <h2>{currentMonth}</h2>
          <div className="calendar-controls">
            <button className="btn-calendar-nav">Today</button>
            <button className="btn-calendar-nav">Month</button>
          </div>
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
          <div className="calendar-grid">
            {renderCalendar()}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot legend-maintenance"></div>
            <span>Machine Maintenance</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-calibration"></div>
            <span>Calibration</span>
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
            <h3>Upcoming Maintenance / Next 7 days</h3>
            <button className="btn-view-all-schedule">View All</button>
          </div>
          <div className="maintenance-tasks">
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
                <button className="btn-schedule">Schedule</button>
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
            <button className="btn-view-all-schedule">View All</button>
          </div>
          <div className="maintenance-tasks">
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

        {/* Hardware Summary */}
        <div className="schedule-panel schedule-panel-summary">
          <div className="panel-header">
            <h3>Hardware Summary</h3>
          </div>
          <div className="summary-stats">
            <div className="summary-item">
              <div className="summary-label">Total Equipment</div>
              <div className="summary-value">156</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Active</div>
              <div className="summary-value summary-value-green">142</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Maintenance</div>
              <div className="summary-value summary-value-orange">9</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Inactive</div>
              <div className="summary-value summary-value-red">5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
