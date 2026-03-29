import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSun, FaMoon } from "react-icons/fa";
import useAuthStore from "../store/useAuthStore";
import { useTheme } from "../contexts/ThemeContext";

export function TopBar() {
  // Lấy thông tin user từ localStorage (nếu có) mà chúng ta đã lưu ở trang Login
  // Nếu chưa có (khi test), sẽ để mặc định là "John Davis"
  const userInfo = useAuthStore((state) => state.user) || { name: "Guest" };
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const handleProfileClick = () => {
    navigate("/app/profile");
  };
  const [showNotifications, setShowNotifications] = React.useState(false);
  return (
    // header: Chiều cao 88px, nền đồng bộ với Sidebar, có viền dưới mờ
    <header className="h-[88px] bg-[var(--topbar-bg)] border-b border-[var(--border-primary)] flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
      {/* --- CỘT TRÁI: Thanh tìm kiếm --- */}
      <div className="flex items-center w-full max-w-md"></div>

      {/* --- CỘT PHẢI: Thông báo & Avatar --- */}
      <div className="flex items-center gap-6">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <FaSun className="text-xl" />
          ) : (
            <FaMoon className="text-xl" />
          )}
        </button>

        {/* Nút chuông thông báo */}
        <div className="relative">
          <button
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell className="text-xl" />
            {/* Chấm đỏ báo hiệu có thông báo mới */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[var(--topbar-bg)]"></span>
          </button>

          {/* Dropdown Notification Panel */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-gray-800 border border-[var(--border-primary)] rounded-lg shadow-lg z-50"
              style={{ top: "calc(100% + 8px)", right: "0" }}
            >
              <div className="p-4 text-[var(--text-primary)] bg-gray-800">
                <h4 className="font-semibold text-lg">Notifications</h4>
              </div>
              <ul>
                <li className="p-4 hover:bg-gray-700 transition">
                  <p className="text-sm text-[var(--text-secondary)]">No new notifications</p>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Cập nhật: Thêm onClick vào khu vực User Profile */}
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--hover-subtle)] p-2 rounded-lg transition-all"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2545b8] to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-md border border-[var(--border-muted)] overflow-hidden">
            {userInfo?.avatar_url ? (
              <img
                src={userInfo.avatar_url}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : userInfo?.email ? (
              userInfo.email.charAt(0).toUpperCase()
            ) : (
              "G"
            )}
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
