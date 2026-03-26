import { useEffect, useMemo, useState } from "react";

const DEFAULT_FORM = {
  equipment: "",
  engineerId: "",
  type: "preventive",
  status: "scheduled",
  priority: "medium",
  scheduledDate: "",
  startDate: "",
  completedDate: "",
  nextMaintenanceDate: "",
  description: "",
  workPerformed: "",
  notes: "",
  estimatedHours: "2",
  actualHours: "",
  findingsCondition: "good",
  findingsIssuesText: "",
  findingsRecommendationsText: "",
  laborCost: "",
  partsCost: "",
  totalCost: "",
  partsUsed: [
    {
      partName: "",
      partNumber: "",
      quantity: "1",
      cost: "",
    },
  ],
};

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const safeNum = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseLines = (value = "") =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const toInputDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIsoOrUndefined = (value) => {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

export default function ScheduleFormModal({
  isOpen,
  mode,
  initialData,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  const title = useMemo(
    () =>
      mode === "edit" ? "Edit Maintenance Record" : "Create Maintenance Record",
    [mode],
  );

  const computedPartsTotal = useMemo(
    () =>
      form.partsUsed.reduce((sum, part) => {
        const quantity = safeNum(part.quantity);
        const unitCost = safeNum(part.cost);
        return sum + quantity * unitCost;
      }, 0),
    [form.partsUsed],
  );

  const computedGrandTotal = useMemo(() => {
    const labor = safeNum(form.laborCost);
    const parts =
      form.partsCost === "" ? computedPartsTotal : safeNum(form.partsCost);
    return labor + parts;
  }, [computedPartsTotal, form.laborCost, form.partsCost]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      const existingParts =
        Array.isArray(initialData.partsUsed) && initialData.partsUsed.length > 0
          ? initialData.partsUsed.map((part) => ({
              partName: part?.partName || "",
              partNumber: part?.partNumber || "",
              quantity: part?.quantity ? String(part.quantity) : "1",
              cost: part?.cost ? String(part.cost) : "",
            }))
          : DEFAULT_FORM.partsUsed;

      setForm({
        equipment:
          typeof initialData.equipment === "string"
            ? initialData.equipment
            : initialData.equipment?._id || "",
        engineerId:
          typeof initialData.engineerId === "string"
            ? initialData.engineerId
            : initialData.engineerId?._id || "",
        type: initialData.type || "preventive",
        status: initialData.status || "scheduled",
        priority: initialData.priority || "medium",
        scheduledDate: toInputDateTime(initialData.scheduledDate),
        startDate: toInputDateTime(initialData.startDate),
        completedDate: toInputDateTime(initialData.completedDate),
        nextMaintenanceDate: toInputDateTime(initialData.nextMaintenanceDate),
        description: initialData.description || "",
        workPerformed: initialData.workPerformed || "",
        notes: initialData.notes || "",
        estimatedHours: initialData.estimatedHours
          ? String(initialData.estimatedHours)
          : "2",
        actualHours:
          initialData.actualHours !== undefined
            ? String(initialData.actualHours)
            : "",
        findingsCondition: initialData.findings?.condition || "good",
        findingsIssuesText: (initialData.findings?.issues || []).join("\n"),
        findingsRecommendationsText: (
          initialData.findings?.recommendations || []
        ).join("\n"),
        laborCost:
          initialData.cost?.labor !== undefined
            ? String(initialData.cost.labor)
            : "",
        partsCost:
          initialData.cost?.parts !== undefined
            ? String(initialData.cost.parts)
            : "",
        totalCost:
          initialData.cost?.total !== undefined
            ? String(initialData.cost.total)
            : "",
        partsUsed: existingParts,
      });
      setErrors({});
      return;
    }

    setForm(DEFAULT_FORM);
    setErrors({});
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePartChange = (index, key, value) => {
    setForm((prev) => {
      const nextParts = [...prev.partsUsed];
      nextParts[index] = { ...nextParts[index], [key]: value };
      return { ...prev, partsUsed: nextParts };
    });
  };

  const addPartRow = () => {
    setForm((prev) => ({
      ...prev,
      partsUsed: [
        ...prev.partsUsed,
        { partName: "", partNumber: "", quantity: "1", cost: "" },
      ],
    }));
  };

  const removePartRow = (index) => {
    setForm((prev) => {
      if (prev.partsUsed.length === 1) {
        return {
          ...prev,
          partsUsed: [
            { partName: "", partNumber: "", quantity: "1", cost: "" },
          ],
        };
      }
      return {
        ...prev,
        partsUsed: prev.partsUsed.filter((_, rowIndex) => rowIndex !== index),
      };
    });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!OBJECT_ID_REGEX.test(form.equipment.trim())) {
      nextErrors.equipment =
        "Equipment ID must be a 24-character MongoDB ObjectId.";
    }
    if (!OBJECT_ID_REGEX.test(form.engineerId.trim())) {
      nextErrors.engineerId =
        "Engineer ID must be a 24-character MongoDB ObjectId.";
    }
    if (!form.scheduledDate) {
      nextErrors.scheduledDate = "Scheduled date is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const parsedPartsUsed = form.partsUsed
      .map((part) => ({
        partName: part.partName.trim(),
        partNumber: part.partNumber.trim(),
        quantity: safeNum(part.quantity),
        cost: safeNum(part.cost),
      }))
      .filter(
        (part) =>
          part.partName || part.partNumber || part.quantity || part.cost,
      );

    const partsTotal =
      form.partsCost === "" ? computedPartsTotal : safeNum(form.partsCost);
    const laborCost = safeNum(form.laborCost);
    const totalCost =
      form.totalCost === "" ? laborCost + partsTotal : safeNum(form.totalCost);

    onSubmit({
      equipment: form.equipment.trim(),
      type: form.type,
      status: form.status,
      priority: form.priority,
      scheduledDate: new Date(form.scheduledDate).toISOString(),
      startDate: toIsoOrUndefined(form.startDate),
      completedDate: toIsoOrUndefined(form.completedDate),
      nextMaintenanceDate: toIsoOrUndefined(form.nextMaintenanceDate),
      engineerId: form.engineerId.trim(),
      description: form.description,
      workPerformed: form.workPerformed,
      notes: form.notes,
      estimatedHours: Number(form.estimatedHours || 0),
      actualHours: Number(form.actualHours || 0),
      partsUsed: parsedPartsUsed,
      findings: {
        condition: form.findingsCondition,
        issues: parseLines(form.findingsIssuesText),
        recommendations: parseLines(form.findingsRecommendationsText),
      },
      cost: {
        labor: laborCost,
        parts: partsTotal,
        total: totalCost,
      },
    });
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h3>{title}</h3>
          <button className="schedule-modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form-grid">
          <div className="schedule-form-item schedule-form-item-full schedule-form-help">
            Fill required IDs first, then optional findings, parts, and cost.
            Totals auto-calculate.
          </div>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Equipment ID *</span>
            <input
              type="text"
              name="equipment"
              value={form.equipment}
              onChange={handleChange}
              placeholder="e.g. 605c5f9f4f1a2569d8f5b123"
            />
            {errors.equipment && (
              <small className="schedule-form-error">{errors.equipment}</small>
            )}
          </label>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Engineer ID *</span>
            <input
              type="text"
              name="engineerId"
              value={form.engineerId}
              onChange={handleChange}
              placeholder="e.g. 69bb9e53e2bfa294f9e7d28d"
            />
            {errors.engineerId && (
              <small className="schedule-form-error">{errors.engineerId}</small>
            )}
          </label>

          <label className="schedule-form-item">
            <span>Type</span>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="predictive">Predictive</option>
              <option value="inspection">Inspection</option>
              <option value="calibration">Calibration</option>
              <option value="emergency">Emergency</option>
            </select>
          </label>

          <label className="schedule-form-item">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="delayed">Delayed</option>
            </select>
          </label>

          <label className="schedule-form-item">
            <span>Priority</span>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>

          <label className="schedule-form-item">
            <span>Estimated Hours</span>
            <input
              type="number"
              min="0"
              step="0.5"
              name="estimatedHours"
              value={form.estimatedHours}
              onChange={handleChange}
              placeholder="2"
            />
          </label>

          <label className="schedule-form-item">
            <span>Actual Hours</span>
            <input
              type="number"
              min="0"
              step="0.25"
              name="actualHours"
              value={form.actualHours}
              onChange={handleChange}
              placeholder="2.25"
            />
          </label>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Scheduled Date</span>
            <input
              type="datetime-local"
              name="scheduledDate"
              value={form.scheduledDate}
              onChange={handleChange}
              required
            />
            {errors.scheduledDate && (
              <small className="schedule-form-error">
                {errors.scheduledDate}
              </small>
            )}
          </label>

          <label className="schedule-form-item">
            <span>Start Date</span>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />
          </label>

          <label className="schedule-form-item">
            <span>Completed Date</span>
            <input
              type="datetime-local"
              name="completedDate"
              value={form.completedDate}
              onChange={handleChange}
            />
          </label>

          <label className="schedule-form-item">
            <span>Next Maintenance Date</span>
            <input
              type="datetime-local"
              name="nextMaintenanceDate"
              value={form.nextMaintenanceDate}
              onChange={handleChange}
            />
          </label>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe maintenance work..."
            />
          </label>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Work Performed</span>
            <textarea
              name="workPerformed"
              value={form.workPerformed}
              onChange={handleChange}
              rows={3}
              placeholder="Replaced seal and calibrated sensor"
            />
          </label>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="No further action required"
            />
          </label>

          <label className="schedule-form-item">
            <span>Condition</span>
            <select
              name="findingsCondition"
              value={form.findingsCondition}
              onChange={handleChange}
            >
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="critical">Critical</option>
            </select>
          </label>

          <div className="schedule-form-item">
            <span>Calculated Total Cost</span>
            <input
              type="number"
              value={computedGrandTotal.toFixed(2)}
              disabled
              aria-label="Calculated total cost"
            />
          </div>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Issues (one per line)</span>
            <textarea
              name="findingsIssuesText"
              value={form.findingsIssuesText}
              onChange={handleChange}
              rows={3}
              placeholder="Leak at valve\nCorrosion on flange"
            />
          </label>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Recommendations (one per line)</span>
            <textarea
              name="findingsRecommendationsText"
              value={form.findingsRecommendationsText}
              onChange={handleChange}
              rows={3}
              placeholder="Replace gasket\nInspect in 2 weeks"
            />
          </label>

          <div className="schedule-form-item schedule-form-item-full">
            <div className="schedule-form-parts-header">
              <span>Parts Used</span>
              <button
                type="button"
                className="btn-calendar-nav"
                onClick={addPartRow}
              >
                + Add Part
              </button>
            </div>

            <div className="schedule-parts-list">
              {form.partsUsed.map((part, index) => (
                <div className="schedule-parts-row" key={`part-${index}`}>
                  <input
                    type="text"
                    value={part.partName}
                    placeholder="Part name"
                    onChange={(e) =>
                      handlePartChange(index, "partName", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={part.partNumber}
                    placeholder="Part number"
                    onChange={(e) =>
                      handlePartChange(index, "partNumber", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={part.quantity}
                    placeholder="Qty"
                    onChange={(e) =>
                      handlePartChange(index, "quantity", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={part.cost}
                    placeholder="Unit cost"
                    onChange={(e) =>
                      handlePartChange(index, "cost", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn-edit-table"
                    onClick={() => removePartRow(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="schedule-form-item">
            <span>Labor Cost</span>
            <input
              type="number"
              min="0"
              step="0.01"
              name="laborCost"
              value={form.laborCost}
              onChange={handleChange}
              placeholder="120"
            />
          </label>

          <label className="schedule-form-item">
            <span>Parts Cost (optional override)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              name="partsCost"
              value={form.partsCost}
              onChange={handleChange}
              placeholder={computedPartsTotal.toFixed(2)}
            />
          </label>

          <label className="schedule-form-item schedule-form-item-full">
            <span>Total Cost (optional override)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              name="totalCost"
              value={form.totalCost}
              onChange={handleChange}
              placeholder={computedGrandTotal.toFixed(2)}
            />
          </label>

          <div className="schedule-modal-footer schedule-form-actions">
            <button type="button" className="btn-edit-table" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-add-schedule"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
