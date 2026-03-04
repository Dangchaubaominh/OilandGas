import * as yup from "yup";

export const profileSchema = yup.object().shape({
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
      "Invalid  phone number format",
    ),

  department: yup.string().trim().required("Department is required"),
});
