import * as yup from "yup";

export const userSchema = yup.object().shape({
  username: yup.string(), // Không bắt buộc nữa vì BE không cần
  fullName: yup.string().required("Họ và tên không được để trống"),
  email: yup
    .string()
    .email("Định dạng email không hợp lệ")
    .required("Email không được để trống"),
  phone: yup.string().required("Số điện thoại không được để trống"), // THÊM MỚI
  department: yup.string().required("Phòng ban không được để trống"), // THÊM MỚI
  password: yup
    .string()
    .test(
      "password-validation",
      "Mật khẩu phải có ít nhất 6 ký tự",
      function (value) {
        const { isEditMode } = this.options.context;
        if (isEditMode && (!value || value.trim() === "")) return true;
        return value && value.length >= 6;
      },
    ),
  role: yup.string().required("Vui lòng chọn quyền (Role)"),
  status: yup
    .string()
    .oneOf(["active", "inactive", "locked"])
    .default("active"),
});
