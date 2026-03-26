import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../layouts/MainLayouts";
import Dashboard from "../Pages/Dashboard/DashBoard";
import UserManagement from "../Pages/UserManagement/UserManagement";
import RoleManagement from "../Pages/Role/RoleManagement";
import InstrumentManagement from "../Pages/Instrument/InstrumentManagement";
import Reports from "../Pages/Reports/Reports";
import MaintenanceSchedule from "../Pages/MaintenanceSchedule/MaintenanceSchedule";
import EquipmentDetail from "../Pages/Equipment/EquipmentDetail";
import InstrumentDetail from "../Pages/Instrument/InstrumentDetail";
import Settings from "../Pages//Setting/Settings";
import WarehouseInventory from "../Pages/Warehouse/WarehouseInventory";
import Simulator from "../Pages/Stimulator/Simulator";
import EquipmentControl from "../Pages/Equipment/EquipmentControl";
import Login from "../Pages/Auth/Login";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import Profile from "../Pages/UserProfile/Profile";

export const router = createBrowserRouter([
  // --- NHÓM PUBLIC (Trang đăng nhập) ---
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
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
        path: "profile",
        element: <Profile />,
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
        path: "inventory",
        element: <WarehouseInventory />,
      },
      {
        path: "instrument",
        element: <InstrumentManagement />,
      },
       {
        path: "equipment/:id",
        element: <EquipmentDetail />,
      },
      {
        path: "instrument/:id",
        element: <InstrumentDetail />,
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
        element: <MaintenanceSchedule />,
      },
      {
        path: "settings",
        element: <Settings />,
      },

    ],
  },
]);
