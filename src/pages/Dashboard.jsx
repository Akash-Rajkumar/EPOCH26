import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
export default function Dashboard() {
  // fake data for now
    const navigate = useNavigate(); 

  const [metrics] = useState({
    inputs: 12450,
    crashes: 12,
    coverage: 0.67,
  });

  const [crashes] = useState([
    { id: "1", type: "heap_overflow", severity: "critical" },
    { id: "2", type: "null_deref", severity: "high" },
    { id: "3", type: "timeout", severity: "medium" },
  ]);

  return (
    
    <div className="min-h-screen bg-[#0b0f1a] text-white p-6 space-y-6">
      
      {/* Title */}
      <h1 className="text-2xl font-semibold">
        FuzzForge Dashboard 
      </h1>
      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
        ● Session Running
      </span>
        <button
            onClick={() => navigate("/crashes")}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            View All Crashes →
        </button>
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Inputs" value={metrics.inputs} />
        <MetricCard label="Crashes" value={metrics.crashes} color="red" />
        <MetricCard
          label="Coverage"
          value={`${(metrics.coverage * 100).toFixed(1)}%`}
          color="green"
        />
      </div>

      {/* Live Crash Feed */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h2 className="text-lg mb-4">🔥 Recent Crashes</h2>

        <div className="space-y-3">
            
          {crashes.map((c) => (
            <div
              key={c.id}
               onClick={() => navigate(`/crash/${c.id}`)}
                className="p-3 rounded-lg bg-black/30 border border-white/10 flex justify-between cursor-pointer hover:bg-black/50 transition"
            >
              <span>{c.type}</span>
              <span className={getSeverityColor(c.severity)}>
                {c.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ---------------- Components ---------------- */

function MetricCard({ label, value, color }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-xl font-semibold ${getMetricColor(color)}`}>
        {value}
      </p>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function getMetricColor(color) {
  if (color === "red") return "text-red-400";
  if (color === "green") return "text-green-400";
  return "text-white";
}

function getSeverityColor(severity) {
  if (severity === "critical") return "text-red-400";
  if (severity === "high") return "text-orange-400";
  if (severity === "medium") return "text-yellow-400";
  return "text-gray-400";
}