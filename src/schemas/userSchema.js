import * as yup from "yup";

// Base schema without password - used for dynamic validation
export const userSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Full name is too short"),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email format")
    .required("Email is required"),

  // Password validation will be handled conditionally
  password: yup
    .string()
    .test(
      "password-min",
      "Password must be at least 6 characters",
      function (value) {
        if (!value || value.length === 0) return true; // Empty is ok (required check is separate)
        return value.length >= 6;
      },
    ),

  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(
      /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
      "Invalid Vietnamese phone number format",
    ),

  department: yup.string().required("Department is required"),

  role: yup.string().required("Please select a role"),

  status: yup
    .string()
    .oneOf(["active", "inactive"], "Invalid status")
    .default("active"),
});

// Schema for CREATE mode - password is required
export const createUserSchema = userSchema.shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Schema for UPDATE mode - matches PUT /users/{id} fields
export const updateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Full name is too short"),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email format")
    .required("Email is required"),

  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(
      /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
      "Invalid Vietnamese phone number format",
    ),

  department: yup.string().required("Department is required"),

  role: yup.string().required("Please select a role"),

  status: yup
    .string()
    .oneOf(["active", "inactive"], "Invalid status")
    .required("Status is required")
    .default("active"),
});

// Backward compatibility for existing imports
export const editUserSchema = updateUserSchema;
