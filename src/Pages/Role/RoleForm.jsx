import { useEffect, useMemo, useState } from "react";
import { FaSave, FaUserPlus } from "react-icons/fa";

const MENU_PERMISSION_GROUPS = [
  {
    title: "Main Menu",
    items: [
      { key: "dashboard.show", label: "Dashboard" },
      { key: "users.show", label: "User Management" },
      { key: "roles.show", label: "Role Management" },
    ],
  },
  {
    title: "Operations",
    items: [
      { key: "inventory.show", label: "Warehouse Inventory" },
      { key: "simulator.show", label: "3D Simulator" },
      { key: "instrument.show", label: "Instrument Management" },
      { key: "equipment.show", label: "Equipment Control" },
      { key: "schedule.show", label: "Maintenance Schedule" },
      { key: "reports.show", label: "Reports" },
    ],
  },
];

const MENU_PERMISSION_KEYS = MENU_PERMISSION_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key),
);

const DEFAULT_VALUES = {
  key: "",
  name: "",
  description: "",
  selectedPermissions: [],
  extraPermissions: [],
};

const normalizeRoleKey = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.-]/g, "");

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  return Array.from(
    new Set(
      permissions
        .map((permission) =>
          typeof permission === "string" ? permission.trim() : "",
        )
        .filter(Boolean),
    ),
  );
};

export default function RoleForm({
  mode = "create",
  initialValues,
  isSaving,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});

  const isEditMode = mode === "edit";

  useEffect(() => {
    const normalizedPermissions = normalizePermissions(
      initialValues?.permissions,
    );
    const nextValues = {
      key: initialValues?.key || "",
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      selectedPermissions: normalizedPermissions.filter((permission) =>
        MENU_PERMISSION_KEYS.includes(permission),
      ),
      extraPermissions: normalizedPermissions.filter(
        (permission) => !MENU_PERMISSION_KEYS.includes(permission),
      ),
    };
    setForm(nextValues);
    setErrors({});
  }, [initialValues]);

  const permissionsPreviewCount = useMemo(() => {
    return form.selectedPermissions.length + form.extraPermissions.length;
  }, [form.selectedPermissions, form.extraPermissions]);

  const selectedPermissionsSet = useMemo(
    () => new Set(form.selectedPermissions),
    [form.selectedPermissions],
  );

  const isAllSelected =
    form.selectedPermissions.length === MENU_PERMISSION_KEYS.length;

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Role name is required.";
    }

    if (!isEditMode && !normalizeRoleKey(form.key)) {
      nextErrors.key = "Role key is required for new roles.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const togglePermission = (permissionKey) => {
    setForm((prev) => {
      const hasPermission = prev.selectedPermissions.includes(permissionKey);
      if (hasPermission) {
        return {
          ...prev,
          selectedPermissions: prev.selectedPermissions.filter(
            (permission) => permission !== permissionKey,
          ),
        };
      }

      return {
        ...prev,
        selectedPermissions: [...prev.selectedPermissions, permissionKey],
      };
    });
  };

  const selectAllPermissions = () => {
    setForm((prev) => ({
      ...prev,
      selectedPermissions: [...MENU_PERMISSION_KEYS],
    }));
  };

  const clearAllPermissions = () => {
    setForm((prev) => ({
      ...prev,
      selectedPermissions: [],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const permissions = normalizePermissions([
      ...form.selectedPermissions,
      ...form.extraPermissions,
    ]);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      permissions,
    };

    if (!isEditMode) {
      payload.key = normalizeRoleKey(form.key);
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label>Role Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Field Engineer"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            disabled={isSaving}
            style={{ borderColor: errors.name ? "#ef4444" : "" }}
          />
          {errors.name && (
            <span className="role-form-error">{errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label>{isEditMode ? "Role Key" : "Role Key *"}</label>
          <input
            type="text"
            className="form-input"
            placeholder="field_engineer"
            value={form.key}
            onChange={(e) => updateField("key", e.target.value)}
            onBlur={(e) => {
              if (isEditMode) return;
              updateField("key", normalizeRoleKey(e.target.value));
            }}
            disabled={isSaving || isEditMode}
            style={{ borderColor: errors.key ? "#ef4444" : "" }}
          />
          {errors.key && <span className="role-form-error">{errors.key}</span>}
          <small className="role-form-help">
            Use lowercase letters, numbers, dot, dash, underscore.
          </small>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Role for on-site engineers with report and assignment permissions"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label>Permissions</label>
          <div className="role-permissions-toolbar">
            <button
              type="button"
              className="role-permissions-action"
              onClick={selectAllPermissions}
              disabled={isSaving || isAllSelected}
            >
              Select all
            </button>
            <button
              type="button"
              className="role-permissions-action"
              onClick={clearAllPermissions}
              disabled={isSaving || form.selectedPermissions.length === 0}
            >
              Clear all
            </button>
          </div>

          <div className="role-permissions-groups">
            {MENU_PERMISSION_GROUPS.map((group) => (
              <div key={group.title} className="role-permissions-group">
                <p className="role-permissions-group-title">{group.title}</p>
                <div className="role-permissions-list">
                  {group.items.map((permission) => (
                    <label
                      key={permission.key}
                      className="role-permission-option"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissionsSet.has(permission.key)}
                        onChange={() => togglePermission(permission.key)}
                        disabled={isSaving}
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Removed extra permissions and detected permissions count help texts */}
        </div>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={isSaving}>
          {isEditMode ? (
            <>
              <FaSave /> {isSaving ? "Updating..." : "Update Role"}
            </>
          ) : (
            <>
              <FaUserPlus /> {isSaving ? "Creating..." : "Create Role"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
