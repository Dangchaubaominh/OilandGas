import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import authApi from "../../services/authApi";
import { Eye, EyeOff, CheckCircle2, KeyRound } from "lucide-react";
import { showToast } from "../../utils/toastHandler";

const Login = () => {
  // --- 1. Quản lý State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setLogin = useAuthStore((state) => state.setLogin);
  const navigate = useNavigate();

  // Hàm xử lý đăng nhập (Giữ nguyên logic của bạn)
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Giả lập API Call (Bạn thay bằng gọi authApi thực tế của bạn)
      const response = await authApi.login({ email, password });
      const { accessToken, user } = response.data.data;

      // await new Promise((resolve) => setTimeout(resolve, 1500)); // Fake delay
      // const token = "mock_token_123";
      // const user = { name: "John Davis" };

      // Lưu vào LocalStorage
      setLogin(user, accessToken);

      showToast("success", `Login successful! Welcome back, ${user.name}`);
      // Điều hướng về trang Dashboard
      navigate("/app/dashboard");
    } catch (error) {
      console.error(error);
      showToast("error", "Login failed! Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Background tổng thể
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 font-sans">
      {/* Container chính */}
      <div className="flex flex-col md:flex-row w-full max-w-[900px] min-h-[550px] bg-[#161a23] rounded-[32px] overflow-hidden shadow-2xl">
        {/* --- CỘT TRÁI: Branding & Features --- */}
        <div className="w-full md:w-1/2 bg-[#2545b8] p-10 flex flex-col justify-center items-center text-center">
          {/* Logo */}
          <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-[#2545b8] font-bold text-2xl italic tracking-tight">
              OG
            </span>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-white text-3xl font-bold mb-2">
            Oil & Gas Analyzer
          </h1>
          <p className="text-blue-200/80 text-sm italic mb-12">
            Enterprise Monitoring & Control System
          </p>

          {/* Danh sách tính năng */}
          <div className="space-y-4 text-left w-full max-w-[280px]">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-sm opacity-90">
                Real-time equipment monitoring
              </span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-sm opacity-90">
                Advanced 3D visualization tools
              </span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-sm opacity-90">
                Comprehensive analytics dashboard
              </span>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: Form đăng nhập --- */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative">
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-2">
              Engineer Login
            </h2>
            <p className="text-gray-400 text-sm">
              Enter your credentials to access the system
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="block text-gray-300 text-xs font-medium ml-1">
                Username / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.davis@oilgas.com"
                required
                className="w-full bg-[#1e2330] border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-500"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5 relative">
              <label className="block text-gray-300 text-xs font-medium ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#1e2330] border border-gray-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-500 tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 bg-[#1e2330] checked:bg-blue-600 checked:border-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-[#3b82f6] text-xs hover:underline hover:text-blue-400"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors mt-2 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-700/50"></div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              OR
            </span>
            <div className="flex-1 h-px bg-gray-700/50"></div>
          </div>

          {/* SSO Button */}
          <button
            type="button"
            className="w-full bg-transparent border border-gray-700 text-gray-300 hover:bg-[#1e2330] hover:text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <KeyRound size={16} />
            Sign in with SSO
          </button>

          {/* Footer Text */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-gray-600 text-[10px]">
              Version 2.1.4 • © 2024 Oil & Gas Systems Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
