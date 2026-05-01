import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-black/30 border-b border-white/10 text-white">
      
      <h1 className="font-semibold text-lg cursor-pointer" onClick={() => navigate("/")}>
        FuzzForge
      </h1>

      <div className="flex gap-4 text-sm">
        <button onClick={() => navigate("/")} className="hover:text-blue-400">
          Dashboard
        </button>
        <button onClick={() => navigate("/crashes")} className="hover:text-blue-400">
          Crashes
        </button>
      </div>

    </div>
  );
}