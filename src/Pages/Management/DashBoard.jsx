import React from "react";
import { FaUsers, FaTools, FaWarehouse, FaExclamationTriangle, FaFilter } from "react-icons/fa";

export default function Dashboard() {
  const stats = [
    { label: "Total Users", value: "247", icon: <FaUsers size={24} />, color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.15)" },
    { label: "Instruments", value: "189", icon: <FaTools size={24} />, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.15)" },
    { label: "Warehouse Items", value: "1,432", icon: <FaWarehouse size={24} />, color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.15)" },
    { label: "Alerts", value: "18", icon: <FaExclamationTriangle size={24} />, color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  ];

  const maintenanceActivities = [
    { id: "INST-1823", task: "Flowrate Pump", status: "Completed", statusColor: "text-emerald-400" },
    { id: "WRHS-2156", task: "Spare Parts Survey", status: "In Progress", statusColor: "text-blue-400" },
    { id: "CALIB-3894", task: "Pressure Gauge XL-90", status: "Completed", statusColor: "text-emerald-400" },
    { id: "EMRG-4512", task: "Valve Malfunction", status: "Overdue", statusColor: "text-red-400" },
  ];

  const incidents = [
    { id: "INC-3324", description: "Compressor Shutdown Event A11", time: "12:45 PM", severity: "Critical" },
    { id: "INC-3323", description: "Temperature spike at Storage B (High)", time: "11:30 AM", severity: "Warning" },
    { id: "INC-3322", description: "Pressure drop pipeline sector 7 (Low)", time: "09:15 AM", severity: "Warning" },
    { id: "INC-3321", description: "Safety valve triggered at well head", time: "08:00 AM", severity: "Critical" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time monitoring and key metrics</p>
      </div>

      {/* --- Row 1: Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-[#161a23] rounded-2xl p-6 border border-gray-800 shadow-md flex items-center justify-between"
            style={{ borderLeft: `4px solid ${stat.color}` }}
          >
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
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
        
        {/* Critical Trends Chart (Chiếm 2 cột) */}
        <div className="lg:col-span-2 bg-[#161a23] rounded-2xl p-6 border border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Critical Trends</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Gas</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Oil</span>
            </div>
          </div>
          <div className="w-full h-64 bg-[#0d1117] rounded-xl flex items-center justify-center border border-gray-800/50 p-4">
            {/* SVG Giả lập Chart */}
            <svg viewBox="0 0 400 200" className="w-full h-full preserve-3d">
              <polyline points="0,150 50,120 100,140 150,100 200,110 250,80 300,90 350,60 400,70" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="0,180 50,170 100,160 150,150 200,145 250,130 300,120 350,100 400,95" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Equipment Health Status (Chiếm 1 cột) */}
        <div className="bg-[#161a23] rounded-2xl p-6 border border-gray-800 shadow-md flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Equipment Health</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* SVG Donut Chart */}
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#1f2937" strokeWidth="20"/>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="308 440" strokeDashoffset="0" className="transition-all duration-1000"/>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="88 440" strokeDashoffset="-308"/>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="44 440" strokeDashoffset="-396"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">189</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>
            
            <div className="flex justify-between w-full px-2 text-xs font-medium text-gray-400">
              <div className="flex flex-col items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Operational</div>
              <div className="flex flex-col items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Maintenance</div>
              <div className="flex flex-col items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Row 3: Lists --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Maintenance Activities */}
        <div className="bg-[#161a23] rounded-2xl p-6 border border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Maintenance Activities</h3>
            <button className="text-sm text-blue-500 hover:text-blue-400 transition-colors font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {maintenanceActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1e2330] border border-gray-800/60 hover:border-gray-700 transition-colors">
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">{activity.task}</span>
                  <span className="text-gray-500 text-xs mt-0.5">{activity.id}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-opacity-10 bg-current ${activity.statusColor}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Incidents Log */}
        <div className="bg-[#161a23] rounded-2xl p-6 border border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Critical Incidents Log</h3>
            <button className="text-sm flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <FaFilter /> Filter
            </button>
          </div>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex gap-4 p-4 rounded-xl bg-[#1e2330] border border-gray-800/60 border-l-2 border-l-red-500">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs font-medium">{incident.id}</span>
                    <span className="text-gray-500 text-xs">{incident.time}</span>
                  </div>
                  <p className="text-white text-sm">{incident.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}