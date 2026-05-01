import React from "react";
import { useNavigate } from "react-router-dom";

export default function Crashes() {
  const navigate = useNavigate();
  <button
  onClick={() => navigate(-1)}
  className="mb-4 px-3 py-1 bg-white/10 rounded hover:bg-white/20"
>
  ← Back
</button>

  const crashes = [
    { id: "1", type: "heap_overflow", severity: "critical" },
    { id: "2", type: "null_deref", severity: "high" },
    { id: "3", type: "timeout", severity: "medium" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white p-6">

      <h1 className="text-2xl font-semibold mb-6">
        All Crashes 
      </h1>

      <div className="space-y-3">
        {crashes.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/crash/${c.id}`)}
            className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between cursor-pointer hover:bg-white/10 transition"
          >
            <div>
              <p className="font-medium">{c.type}</p>
              <p className="text-sm text-gray-400">Crash ID: {c.id}</p>
            </div>

            <span className={getSeverityColor(c.severity)}>
              {c.severity}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

/* helper */
function getSeverityColor(severity) {
  if (severity === "critical") return "text-red-400";
  if (severity === "high") return "text-orange-400";
  if (severity === "medium") return "text-yellow-400";
  return "text-gray-400";
}