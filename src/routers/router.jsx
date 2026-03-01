import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../layouts/MainLayouts";
import Dashboard from "../Pages/Management/DashBoard";
import UserManagement from "../Pages/Management/UserManagement";
import RoleManagement from "../Pages/Management/RoleManagement";
import InstrumentManagement from "../Pages/Management/InstrumentManagement";
import UserDetail from "../Pages/Management/UserDetail";
import Reports from "../Pages/Management/Reports";
import Schedule from "../Pages/Management/Schedule";
import Settings from "../Pages/Management/Settings";
import WarehouseInventory from "../Pages/Management/WarehouseInventory";
import Simulator from "../Pages/Management/Simulator";
import EquipmentControl from "../Pages/Management/EquipmentControl";
import Login from "../Pages/Auth/login";

// ... Import thêm các trang khác khi cần

export const router = createBrowserRouter([
  // --- NHÓM PUBLIC (Trang đăng nhập) ---
  { 
    path: "*", 
    element: <Navigate to="/login" replace /> 
  },
  { 
    path: "/login", 
    element: <Login /> 
  },

  // --- NHÓM PRIVATE (Yêu cầu đăng nhập mới vào được) ---
  {
    path: "/app",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "roles",
        element: <RoleManagement />,
      },
      {
        path: "users/:id",
        element: <UserDetail />,
      },
      {
        path: "inventory",
        element: <WarehouseInventory />,
      },
      {
        path: "instrument",
        element: <InstrumentManagement />,
      },
      {
        path: "simulator",
        element: <Simulator />,
      },
      {
        path: "equipment",
        element: <EquipmentControl />,
      },
       {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "settings",
        element: <Settings />,
      },

      // Thêm các Route con khác của dự án Oil & Gas vào đây
    ],
  },
]);