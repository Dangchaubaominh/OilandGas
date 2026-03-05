import * as yup from "yup";

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().trim().required("Current password is required"),

  newPassword: yup
    .string()
    .trim()
    .required("New password is required")
    .min(6, "New password must be at least 6 characters"),

  confirmNewPassword: yup
    .string()
    .trim()
    .required("Please confirm your new password")
    .oneOf([yup.ref("newPassword")], "Confirmation password does not match"),
});
