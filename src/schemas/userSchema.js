import * as yup from "yup";

export const userSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Full name is too short"),

  email: yup
    .string()
    .trim()
    .lowercase() // Tự động chuyển về chữ thường để tránh lỗi duplicate do chữ hoa
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
    .oneOf(["active", "inactive", "locked"], "Invalid status")
    .default("active"),
});
