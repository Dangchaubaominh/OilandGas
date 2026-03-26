const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  return permissions
    .map((permission) =>
      typeof permission === "string" ? permission.trim() : "",
    )
    .filter(Boolean);
};

export const getUserPermissions = (user) => {
  return normalizePermissions(user?.rolePermissions);
};

export const hasPermission = (permissions, requiredPermission) => {
  if (!requiredPermission) return true;

  const normalized = normalizePermissions(permissions);
  if (normalized.length === 0) {
    // Backward-compatible fallback while users without role permissions still exist.
    return true;
  }

  return normalized.some((permission) => {
    if (permission === "*" || permission === requiredPermission) return true;

    if (permission.endsWith(".*")) {
      const prefix = permission.slice(0, -2);
      return (
        requiredPermission === prefix ||
        requiredPermission.startsWith(`${prefix}.`)
      );
    }

    return false;
  });
};
