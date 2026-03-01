import React from "react";
import { Outlet } from "react-router-dom";
// Đảm bảo tên file import khớp với thực tế (Sidebar.jsx hay SideBar.jsx)
import SideBar from "./Sidebar"; 
import { TopBar } from "./Topbar"; 

export default function MainLayout() {
  return (
    // Nền tối tổng thể của toàn bộ app nằm ở đây
    <div className="flex h-screen w-full bg-[#0d1117] text-white overflow-hidden font-sans">
      
      <SideBar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto bg-[#0a0c10] p-6 relative">
          <div className="mx-auto max-w-7xl w-full">
            {/* Đây là nơi Dashboard của bạn sẽ được "nhúng" vào */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}