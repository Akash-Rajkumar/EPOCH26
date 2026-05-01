import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TriagePanel from "../components/TriagePanel";



export default function ChainViewer() {
    const navigate = useNavigate();

  const { id } = useParams();


const nodes = [
  {
    id: "1",
    position: { x: 0, y: 100 },
    data: { label: "seed input" },
    style: { background: "#1e293b", color: "white" },
  },
  {
    id: "2",
    position: { x: 200, y: 100 },
    data: { label: "bit_flip" },
    style: { background: "#1e293b", color: "white" },
  },
  {
    id: "3",
    position: { x: 400, y: 100 },
data: { label: " Crash Trigger\nformat_mutation" },   style: {
  background: "#ef4444",
  color: "white",
  border: "2px solid #fca5a5"
},
  },
];

const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

const triage = {
  hypothesis: "The crash is likely caused by a buffer overflow when parsing an oversized input string.",
  root_cause_category: "buffer_overflow",
  suggested_fix: "Add proper bounds checking before copying user input.",
  confidence: "high",
};

  return (
  <div className="flex h-screen bg-[#0b0f1a] text-white">

    <button
  onClick={() => navigate(-1)}
  className="mb-4 px-3 py-1 bg-white/10 rounded hover:bg-white/20"
>
  ← Back
</button>
        <p className="text-sm text-gray-400 mb-2">
  Mutation lineage (input → crash)
    </p>
    {/* LEFT: Graph */}
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Crash Details 🔍
      </h1>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
        <p className="text-gray-400">Crash ID:</p>
        <p className="text-lg font-mono">{id}</p>
      </div>

      <div className="h-[500px] bg-black/30 border border-white/10 rounded-xl">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>

    {/* RIGHT: Triage Panel */}
    <div className="w-80 border-l border-white/10 p-6 overflow-y-auto">
      <TriagePanel triage={triage} />
    </div>

  </div>
);
}