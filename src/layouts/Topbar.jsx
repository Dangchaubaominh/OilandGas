import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import useAuthStore from "../store/useAuthStore";

export function TopBar() {
  // Lấy thông tin user từ localStorage (nếu có) mà chúng ta đã lưu ở trang Login
  // Nếu chưa có (khi test), sẽ để mặc định là "John Davis"
  const userInfo = useAuthStore((state) => state.user) || { name: "Guest" };
  const navigate = useNavigate();
  const handleProfileClick = () => {
    navigate("/app/profile");
  };
  return (
    // header: Chiều cao 88px, nền đồng bộ với Sidebar, có viền dưới mờ
    <header className="h-[88px] bg-[var(--topbar-bg)] border-b border-[var(--border-primary)] flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
      {/* --- CỘT TRÁI: Thanh tìm kiếm --- */}
      <div className="flex items-center w-full max-w-md"></div>

      {/* --- CỘT PHẢI: Thông báo & Avatar --- */}
      <div className="flex items-center gap-6">
        {/* Nút chuông thông báo */}
        <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
          <FaBell className="text-xl" />
          {/* Chấm đỏ báo hiệu có thông báo mới */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[var(--topbar-bg)]"></span>
        </button>

        {/* Đường dọc ngăn cách (Divider) */}
        <div className="h-8 w-px bg-[var(--border-muted)]"></div>

        {/* Cập nhật: Thêm onClick vào khu vực User Profile */}
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--hover-subtle)] p-2 rounded-lg transition-all"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2545b8] to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-md border border-[var(--border-muted)]">
            {userInfo?.email ? userInfo.email.charAt(0).toUpperCase() : "G"}
          </div>
          {/* Thông tin tên và chức vụ (Ẩn trên màn hình nhỏ) */}
          <div className="hidden md:flex flex-col">
            <span className="text-[var(--text-primary)] text-sm font-semibold">
              {userInfo.email || "Guest"}
            </span>
            <span className="text-blue-400 text-[11px] font-medium tracking-wide uppercase">
              {userInfo.role || "Engineer"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
