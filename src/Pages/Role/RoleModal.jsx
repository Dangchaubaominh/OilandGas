import { FaTimes } from "react-icons/fa";
import RoleForm from "./RoleForm";

export default function RoleModal({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  isSaving,
  initialValues,
}) {
  if (!isOpen) return null;

  const mode = isEditMode ? "edit" : "create";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{isEditMode ? "Update Role" : "Create New Role"}</h2>
            <p className="modal-subtitle">
              {isEditMode
                ? "Update role details and menu access permissions."
                : "Create a new role with name, key, and menu access permissions."}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isSaving}>
            <FaTimes />
          </button>
        </div>

        <RoleForm
          mode={mode}
          initialValues={initialValues}
          isSaving={isSaving}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
