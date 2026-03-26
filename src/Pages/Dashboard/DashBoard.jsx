import React, { useEffect, useMemo, useState } from "react";
import {
  FaTools,
  FaExclamationTriangle,
  FaFilter,
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

        // Transform dashboard data to match new API response structure
        const transformedData = {
          operationalEquipment:
            (dashboardPayload?.equipment?.operational || 0) +
            (dashboardPayload?.instruments?.operational || 0),
          maintenancePending: dashboardPayload?.maintenance?.pending || 0,
          openIncidents: dashboardPayload?.incidents?.open || 0,
          criticalAlerts: dashboardPayload?.incidents?.open || 0, // Adjust if you have a separate field for critical
          equipment: dashboardPayload?.equipment || {
            total: 0,
            operational: 0,
            nonOperational: 0,
          },
          instruments: dashboardPayload?.instruments || {
            total: 0,
            operational: 0,
            nonOperational: 0,
          },
          timestamp: new Date().toISOString(),
          todayProduction: {
            value: oilPayload?.value || 0,
            unit: "barrels",
          },
          systemUptime: {
            value: 99.9,
            unit: "%",
          },
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

  // Total equipment and instruments
  const equipmentTotal =
    Number(dashboardData?.equipment?.total || 0) +
    Number(dashboardData?.instruments?.total || 0);

  const maintenanceActivities = [
    {
      id: "INST-1823",
      task: "Flowrate Pump",
      status: "Completed",
      statusColor: "text-emerald-400",
    },
    {
      id: "WRHS-2156",
      task: "Spare Parts Survey",
      status: "In Progress",
      statusColor: "text-blue-400",
    },
    {
      id: "CALIB-3894",
      task: "Pressure Gauge XL-90",
      status: "Completed",
      statusColor: "text-emerald-400",
    },
    {
      id: "EMRG-4512",
      task: "Valve Malfunction",
      status: "Overdue",
      statusColor: "text-red-400",
    },
  ];

  const incidents = [
    {
      id: "INC-3324",
      description: "Compressor Shutdown Event A11",
      time: "12:45 PM",
      severity: "Critical",
    },
    {
      id: "INC-3323",
      description: "Temperature spike at Storage B (High)",
      time: "11:30 AM",
      severity: "Warning",
    },
    {
      id: "INC-3322",
      description: "Pressure drop pipeline sector 7 (Low)",
      time: "09:15 AM",
      severity: "Warning",
    },
    {
      id: "INC-3321",
      description: "Safety valve triggered at well head",
      time: "08:00 AM",
      severity: "Critical",
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

      {/* --- Row 1: Stats Cards --- */}
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

      {/* --- Row 2: Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Trends Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Critical Trends
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Gas
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>{" "}
                Oil
              </span>
            </div>
          </div>
          <div className="w-full h-64 bg-[var(--bg-surface)] rounded-xl flex items-center justify-center border border-[var(--border-primary)]/50 p-4">
            <svg viewBox="0 0 400 200" className="w-full h-full preserve-3d">
              <polyline
                points="0,150 50,120 100,140 150,100 200,110 250,80 300,90 350,60 400,70"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="0,180 50,170 100,160 150,150 200,145 250,130 300,120 350,100 400,95"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Equipment Health Status */}
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
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="var(--border-muted)"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="308 440"
                  strokeDashoffset="0"
                  className="transition-all duration-1000"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray="88 440"
                  strokeDashoffset="-308"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray="44 440"
                  strokeDashoffset="-396"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  {fmt(equipmentTotal)}
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1">
                  Total
                </span>
              </div>
            </div>

            <div className="flex justify-between w-full px-2 text-xs font-medium text-[var(--text-secondary)]">
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>{" "}
                Operational
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>{" "}
                Maintenance
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>{" "}
                Critical
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Row 3: Lists --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Today's Production
            </h3>
            <FaOilCan className="text-amber-400" />
          </div>
          <p className="text-4xl font-bold text-[var(--text-primary)] mt-4">
            {fmt(dashboardData?.todayProduction?.value)}
          </p>
          <p className="text-[var(--text-secondary)] mt-1">
            {dashboardData?.todayProduction?.unit || "units"}
          </p>
          <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
            <p className="text-sm text-[var(--text-secondary)]">
              System Uptime
            </p>
            <p className="text-2xl font-semibold text-emerald-400 mt-1">
              {dashboardData?.systemUptime?.value ?? 0}
              {dashboardData?.systemUptime?.unit || "%"}
            </p>
          </div>
        </div>

        {/* Recent Maintenance Activities */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Maintenance Activities
            </h3>
            <button className="text-sm text-blue-500 hover:text-blue-400 transition-colors font-medium">
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
                  <span className="text-[var(--text-muted)] text-xs mt-0.5">
                    {activity.id}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full bg-opacity-10 bg-current ${activity.statusColor}`}
                >
                  {activity.status}
                </span>
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
