import React, { useEffect, useMemo, useState } from "react";
import {
  FaTools,
  FaExclamationTriangle,
  FaOilCan,
  FaClock,
} from "react-icons/fa";
import dashboardApi from "../../services/dashBoardApi";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [oilOutput, setOilOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        // Tạm thời vẫn gọi API thực tế cho 4 thẻ thống kê ở trên cùng
        const [dashboardResponse, oilOutputResponse] = await Promise.all([
          dashboardApi.getDashboard(),
          dashboardApi.getOilOutput({ hours: 24 }),
        ]);

        const dashboardPayload =
          dashboardResponse?.data?.data ||
          dashboardResponse?.data ||
          dashboardResponse;
        const oilPayload =
          oilOutputResponse?.data?.data ||
          oilOutputResponse?.data ||
          oilOutputResponse;

        const transformedData = {
          operationalEquipment:
            (dashboardPayload?.equipment?.operational || 0) +
            (dashboardPayload?.instruments?.operational || 0),
          maintenancePending: dashboardPayload?.maintenance?.pending || 0,
          openIncidents: dashboardPayload?.incidents?.open || 0,
          criticalAlerts: dashboardPayload?.incidents?.open || 0,
          timestamp: new Date().toISOString(),
        };

        setDashboardData(transformedData);
        setOilOutput(oilPayload);
      } catch (error) {
        setLoadError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load dashboard data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const fmt = (value) => {
    const numberValue = Number(value || 0);
    return Number.isFinite(numberValue)
      ? numberValue.toLocaleString("en-US")
      : "0";
  };

  const stats = useMemo(
    () => [
      {
        label: "Operational Equipment",
        value: fmt(dashboardData?.operationalEquipment),
        icon: <FaTools size={24} />,
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.15)",
      },
      {
        label: "Maintenance Pending",
        value: fmt(dashboardData?.maintenancePending),
        icon: <FaClock size={24} />,
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.15)",
      },
      {
        label: "Open Incidents",
        value: fmt(dashboardData?.openIncidents),
        icon: <FaExclamationTriangle size={24} />,
        color: "#3b82f6",
        bgColor: "rgba(59, 130, 246, 0.15)",
      },
      {
        label: "Critical Alerts",
        value: fmt(dashboardData?.criticalAlerts),
        icon: <FaExclamationTriangle size={24} />,
        color: "#ef4444",
        bgColor: "rgba(239, 68, 68, 0.15)",
      },
    ],
    [dashboardData],
  );

  // --- MOCK DATA TRÔNG NHƯ THẬT ---
  const maintenanceActivities = [
    {
      id: "INST-4012",
      task: "Centrifugal Pump P-102",
      bgColor: "bg-[#3b82f6]", // Blue (In Progress)
    },
    {
      id: "GEN-0908",
      task: "Gas Turbine Generator",
      bgColor: "bg-[#f59e0b]", // Orange (Scheduled)
    },
    {
      id: "VAL-1120",
      task: "Pressure Valve V-33",
      bgColor: "bg-[#10b981]", // Green (Completed)
    },
    {
      id: "HX-0551",
      task: "Heat Exchanger Tube Leak",
      bgColor: "bg-[#ef4444]", // Red (Critical/Overdue)
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Dashboard Overview
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          {dashboardData?.timestamp
            ? `Real-time monitoring and key metrics • Updated ${new Date(dashboardData.timestamp).toLocaleString()}`
            : "Real-time monitoring and key metrics"}
        </p>
      </div>

      {loadError && (
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-red-500/30 text-red-300 text-sm">
          {loadError}
        </div>
      )}

      {/* --- Row 1: Stats Cards (Dynamic API Data) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md flex items-center justify-between"
            style={{ borderLeft: `4px solid ${stat.color}` }}
          >
            <div>
              <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">
                {stat.value}
              </h2>
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* --- MOCK DATA SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Trends Chart (Đã tinh chỉnh đường line cho dốc và thực tế hơn) */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Critical Trends
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div> Gas
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div> Oil
              </span>
            </div>
          </div>
          <div className="w-full h-64 bg-[var(--bg-surface)] rounded-xl flex items-center justify-center border border-[var(--border-primary)]/50 p-4">
            <svg viewBox="0 0 400 200" className="w-full h-full preserve-3d">
              {/* Biểu đồ Gas */}
              <polyline
                points="0,160 50,130 100,150 150,110 200,90 250,105 300,60 350,75 400,40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Biểu đồ Oil */}
              <polyline
                points="0,185 50,175 100,165 150,140 200,145 250,120 300,110 350,85 400,90"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Equipment Health Status (Dữ liệu giả: Tổng 142 thiết bị) */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md flex flex-col">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">
            Equipment Health
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full transform -rotate-90"
              >
                {/* Vòng background xám */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-muted)" strokeWidth="20" />
                
                {/* Vòng Xanh Lá: Hoạt động (81% ~ 356 chu vi) */}
                <circle
                  cx="100" cy="100" r="70" fill="none" stroke="#10b981" strokeWidth="20"
                  strokeDasharray="356 440" strokeDashoffset="0"
                />
                
                {/* Vòng Cam: Bảo trì (15% ~ 66 chu vi) */}
                <circle
                  cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" strokeWidth="20"
                  strokeDasharray="66 440" strokeDashoffset="-356"
                />
                
                {/* Vòng Đỏ: Lỗi nghiêm trọng (4% ~ 18 chu vi) */}
                <circle
                  cx="100" cy="100" r="70" fill="none" stroke="#ef4444" strokeWidth="20"
                  strokeDasharray="18 440" strokeDashoffset="-422"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  142
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1">
                  Total
                </span>
              </div>
            </div>

            <div className="flex justify-between w-full px-2 text-xs font-medium text-[var(--text-secondary)]">
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#10b981]"></span> 115 Ops
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> 22 Maint
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> 5 Crit
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Production (Sản lượng cao trông có vẻ "làm ăn được") */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Today's Production
            </h3>
            <FaOilCan className="text-amber-400 text-xl" />
          </div>
          <p className="text-5xl font-bold text-[var(--text-primary)] mt-4">
            42,580
          </p>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">
            barrels
          </p>
          
          <div className="mt-8 pt-5 border-t border-[var(--border-primary)] flex justify-between items-center">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                System Uptime
              </p>
              <p className="text-2xl font-bold text-[#10b981]">
                99.8%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Target Reached
              </p>
              <p className="text-2xl font-bold text-[#3b82f6]">
                105%
              </p>
            </div>
          </div>
        </div>

        {/* Recent Maintenance Activities */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Maintenance Activities
            </h3>
            <button className="text-sm text-[#3b82f6] hover:text-blue-400 transition-colors font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {maintenanceActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-[var(--border-hover)] transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-[var(--text-primary)] font-medium text-sm">
                    {activity.task}
                  </span>
                  <span className="text-[var(--text-muted)] text-xs mt-1">
                    {activity.id}
                  </span>
                </div>
                {/* Colored Pill without text to match the image exactly */}
                <div className={`w-12 h-4 rounded-full ${activity.bgColor} shadow-sm`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-[var(--text-secondary)] text-sm">
          Loading dashboard data...
        </div>
      )}
    </div>
  );
}