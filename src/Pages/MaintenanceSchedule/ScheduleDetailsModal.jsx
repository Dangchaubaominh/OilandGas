export default function ScheduleDetailsModal({
  selectedSchedule,
  isLoading = false,
  errorMessage = "",
  isDeleting = false,
  onEdit,
  onDelete,
  onClose,
}) {
  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const detailLabel = (value) => {
    if (value === null || value === undefined || value === "") return "Unassigned";
    if (typeof value === "string") return value;
    return String(value);
  };

  const getEntityName = (entity, fallback = "Unassigned") => {
    if (!entity) return fallback;
    if (typeof entity === "string") return entity;
    return entity.name || fallback;
  };

  const getEntityEmail = (entity, fallback = "Unassigned") => {
    if (!entity || typeof entity === "string") return fallback;
    return entity.email || fallback;
  };

  const getEquipmentField = (equipment, field, fallback = "N/A") => {
    if (!equipment || typeof equipment === "string") return fallback;
    return equipment[field] || fallback;
  };

  if (!selectedSchedule) return null;

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h3>Maintenance Schedule Details</h3>
          <button className="schedule-modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="schedule-modal-grid">
          {errorMessage && (
            <div className="schedule-modal-item" style={{ gridColumn: "1 / -1" }}>
              <span>Notice</span>
              <strong>{errorMessage}</strong>
            </div>
          )}

          {isLoading && (
            <div className="schedule-modal-item" style={{ gridColumn: "1 / -1" }}>
              <span>Status</span>
              <strong>Loading full details...</strong>
            </div>
          )}

          <div className="schedule-modal-item">
            <span>Schedule ID</span>
            <strong>{detailLabel(selectedSchedule._id)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Record Code</span>
            <strong>{detailLabel(selectedSchedule.recordCode)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Type</span>
            <strong>{detailLabel(selectedSchedule.type)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Status</span>
            <strong>{detailLabel(selectedSchedule.status)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Priority</span>
            <strong>{detailLabel(selectedSchedule.priority)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Scheduled Date</span>
            <strong>{formatDateTime(selectedSchedule.scheduledDate)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Equipment</span>
            <strong>{detailLabel(getEquipmentField(selectedSchedule.equipment, "name", "General Facility"))}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Equipment Type</span>
            <strong>{detailLabel(getEquipmentField(selectedSchedule.equipment, "type"))}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Location</span>
            <strong>{detailLabel(getEquipmentField(selectedSchedule.equipment, "location"))}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Engineer</span>
            <strong>{detailLabel(getEntityName(selectedSchedule.engineerId))}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Engineer Email</span>
            <strong>{detailLabel(getEntityEmail(selectedSchedule.engineerId))}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Supervisor</span>
            <strong>{detailLabel(getEntityName(selectedSchedule.supervisorId))}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Total Cost</span>
            <strong>{detailLabel(selectedSchedule.cost?.total)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Estimated Hours</span>
            <strong>{detailLabel(selectedSchedule.estimatedHours)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Description</span>
            <strong>{detailLabel(selectedSchedule.description)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Condition</span>
            <strong>{detailLabel(selectedSchedule.findings?.condition)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Follow Up Required</span>
            <strong>{selectedSchedule.findings?.followUpRequired ? "Yes" : "No"}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Created At</span>
            <strong>{formatDateTime(selectedSchedule.createdAt)}</strong>
          </div>
          <div className="schedule-modal-item">
            <span>Updated At</span>
            <strong>{formatDateTime(selectedSchedule.updatedAt)}</strong>
          </div>
        </div>

        <div className="schedule-modal-footer">
          <button
            className="btn-calendar-nav"
            onClick={() => onEdit?.(selectedSchedule)}
            disabled={isLoading || isDeleting}
          >
            Edit
          </button>
          <button
            className="btn-reschedule"
            onClick={() => onDelete?.(selectedSchedule)}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button className="btn-edit-table" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
