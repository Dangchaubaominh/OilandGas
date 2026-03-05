import React from "react";
// Đừng quên import useNavigate
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import "./sidebar.css";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserShield,
  FaWarehouse,
  FaCube,
  FaTools,
  FaCalendar,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function SideBar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  // Biến chứa class mặc định cho tất cả các nút menu để code gọn gàng hơn
  const baseNavClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200";

  // Hàm xử lý khi bấm nút Logout
  const handleLogout = () => {
    logout(); // Xóa data trong Zustand & LocalStorage
    navigate("/login", { replace: true }); // Điều hướng về login, chặn nút Back
  };

  return (
    // aside: Cố định chiều rộng (w-72 ~ 288px), chiếm toàn bộ chiều cao (h-full), nền tối
    <aside className="w-72 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] flex flex-col text-[var(--text-secondary)] shadow-xl z-10">
      {/* Header: Chứa Logo & Tên hệ thống */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-[var(--border-primary)]">
        <div className="bg-white w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center shadow-md">
          <span className="text-[#2545b8] font-bold text-lg italic tracking-tight">
            OG
          </span>
        </div>
        <div className="flex flex-col">
          <h3 className="text-[var(--text-primary)] font-bold text-[15px] leading-tight tracking-wide">
            Oil & Gas
          </h3>
          <span className="text-blue-400 text-xs font-semibold tracking-wider">
            ANALYZER
          </span>
        </div>
      </div>

      {/* Navigation: Khu vực cuộn chính chứa các menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Nhóm Main Menu */}
        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-4 mt-2">
          Main Menu
        </div>

        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaTachometerAlt className="text-lg" /> <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/app/users"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaUsers className="text-lg" /> <span>User Management</span>
        </NavLink>
        <NavLink
          to="/app/roles"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaUserShield className="text-lg" /> <span>Role Management</span>
        </NavLink>

        {/* Nhóm Operations */}
        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-4 mt-8">
          Operations
        </div>

        <NavLink
          to="/app/inventory"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaWarehouse className="text-lg" /> <span>Warehouse Inventory</span>
        </NavLink>
        <NavLink
          to="/app/simulator"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaCube className="text-lg" /> <span>3D Simulator</span>
        </NavLink>
        <NavLink
          to="/app/instrument"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaTools className="text-lg" /> <span>Instrument Management</span>
        </NavLink>
        <NavLink
          to="/app/equipment"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaTools className="text-lg" /> <span>Equipment Control</span>
        </NavLink>
        <NavLink
          to="/app/schedule"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaCalendar className="text-lg" /> <span>Maintenance Schedule</span>
        </NavLink>
        <NavLink
          to="/app/reports"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaChartBar className="text-lg" /> <span>Reports</span>
        </NavLink>
      </nav>

      {/* Footer: Cố định phía dưới cùng */}
      <div className="p-4 border-t border-[var(--border-primary)] space-y-1.5 bg-[var(--sidebar-bg)]">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            isActive
              ? `${baseNavClass} bg-[var(--sidebar-active)] text-white shadow-md`
              : `${baseNavClass} text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]`
          }
        >
          <FaCog className="text-lg" /> <span>Settings</span>
        </NavLink>

        {/* Nút Logout: Đã thay NavLink bằng button và gắn onClick */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
        >
          <FaSignOutAlt className="text-lg" /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
