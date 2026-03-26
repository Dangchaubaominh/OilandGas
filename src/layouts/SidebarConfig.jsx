// src/config/menuConfig.jsx
import {
  FaTachometerAlt,
  FaUsers,
  FaUserShield,
  FaWarehouse,
  FaCube,
  FaTools,
  FaCogs,
  FaCalendarAlt,
  FaChartBar,
} from "react-icons/fa";

export const SidebarConfig = [
  {
    category: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        path: "/app/dashboard",
        icon: FaTachometerAlt,
        permission: "dashboard.show", // Tên quyền này phải khớp 100% với tên Backend cấp
      },
      {
        title: "User Management",
        path: "/app/users",
        icon: FaUsers,
        permission: "users.show",
      },
      {
        title: "Role Management",
        path: "/app/roles",
        icon: FaUserShield,
        permission: "roles.show",
      },
    ],
  },
  {
    category: "OPERATIONS",
    items: [
      {
        title: "Warehouse Inventory",
        path: "/app/inventory",
        icon: FaWarehouse,
        permission: "inventory.show",
      },
      {
        title: "3D Simulator",
        path: "/app/simulator",
        icon: FaCube,
        permission: "simulator.show",
      },
      {
        title: "Instrument Management",
        path: "/app/instrument",
        icon: FaTools,
        permission: "instrument.show",
      },
      {
        title: "Equipment Control",
        path: "/app/equipment",
        icon: FaCogs,
        permission: "equipment.show",
      },
      {
        title: "Maintenance Schedule",
        path: "/app/schedule",
        icon: FaCalendarAlt,
        permission: "schedule.show",
      },
      {
        title: "Reports",
        path: "/app/reports",
        icon: FaChartBar,
        permission: "reports.show",
      },
    ],
  },
];
