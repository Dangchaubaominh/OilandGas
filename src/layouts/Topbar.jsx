import React from "react";
// Import các icon cần thiết
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import useAuthStore from "../store/useAuthStore";

export function TopBar() {
  // Lấy thông tin user từ localStorage (nếu có) mà chúng ta đã lưu ở trang Login
  // Nếu chưa có (khi test), sẽ để mặc định là "John Davis"
  const userInfo = useAuthStore((state) => state.user) || { name: "Guest" };

  return (
    // header: Chiều cao 88px, nền đồng bộ với Sidebar, có viền dưới mờ
    <header className="h-[88px] bg-[#161a23] border-b border-gray-800 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
      {/* --- CỘT TRÁI: Thanh tìm kiếm --- */}
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search equipment, reports, or pipelines..."
            className="w-full bg-[#0d1117] border border-gray-700 text-sm text-white rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* --- CỘT PHẢI: Thông báo & Avatar --- */}
      <div className="flex items-center gap-6">
        {/* Nút chuông thông báo */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <FaBell className="text-xl" />
          {/* Chấm đỏ báo hiệu có thông báo mới */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#161a23]"></span>
        </button>

        {/* Đường dọc ngăn cách (Divider) */}
        <div className="h-8 w-px bg-gray-700/60"></div>

        {/* Khu vực User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          {/* Avatar (Lấy chữ cái đầu tiên của tên) */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2545b8] to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-md border border-gray-700">
            {userInfo?.email ? userInfo.email.charAt(0).toUpperCase() : "G"}
          </div>

          {/* Thông tin tên và chức vụ (Ẩn trên màn hình nhỏ) */}
          <div className="hidden md:flex flex-col">
            <span className="text-white text-sm font-semibold">
              {userInfo.email || "Guest"}
            </span>
            <span className="text-blue-400 text-[11px] font-medium tracking-wide uppercase">
              {userInfo.role || "Engineer"}
            </span>
          </div>

          <FaChevronDown className="text-gray-500 text-xs ml-1" />
        </div>
      </div>
    </header>
  );
}
