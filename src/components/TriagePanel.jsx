import React from "react";

const confidenceColor = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-700",
};

export default function TriagePanel({ triage }) {
  return (
    <div className="space-y-4 text-white">
      
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-lg">AI Root Cause Analysis</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${confidenceColor[triage.confidence]}`}>
          {triage.confidence} confidence
        </span>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">Root Cause</p>
        <p className="text-sm bg-black/30 rounded px-2 py-1">
          {triage.root_cause_category}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">Hypothesis</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          {triage.hypothesis}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">Suggested Fix</p>
        <p className="text-sm text-gray-300">
          {triage.suggested_fix}
        </p>
      </div>

    </div>
  );
}