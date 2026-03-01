import { create } from "zustand";

const useAuthStore = create((set) => ({
  // Khởi tạo state từ localStorage để tránh mất data khi F5
  user: JSON.parse(localStorage.getItem("userInfo")) || null,
  accessToken: localStorage.getItem("accessToken") || null,
  isLoading: false,

  // Hàm xử lý đăng nhập thành công
  setLogin: (userData, token) => {
    // THÊM CHỐT CHẶN: Nếu thiếu data thì chặn lại ngay và báo lỗi ở console
    if (!userData || !token) {
      console.error("CẢNH BÁO: Đang cố lưu undefined vào store!", {
        userData,
        token,
      });
      return;
    }

    localStorage.setItem("userInfo", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
    set({ user: userData, accessToken: token });
  },

  // Hàm đăng xuất
  logout: () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("accessToken");
    set({ user: null, accessToken: null });
  },
}));

export default useAuthStore;
