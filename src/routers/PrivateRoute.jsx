// src/routers/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ children }) {
  // Lấy token từ lúc Login
  const token = localStorage.getItem("accessToken");

  // Nếu không có token, đẩy về trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, render giao diện bên trong (chính là MainLayout)
  return <>{children}</>;
}