"use client";

import React from "react";
import { Terminal, Globe, Clock, Layers, ShieldCheck, Info } from "lucide-react";
import { SearchActivityRecord } from "@/types/agent";

interface SearchActivityProps {
  records: SearchActivityRecord[];
  mode: "live" | "preview_demo";
}

export const SearchActivity: React.FC<SearchActivityProps> = ({ records, mode }) => {
  if (!records || records.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">SerpApi Execution Audit Trace</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            mode === "live"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
          }`}
        >
          {mode === "live" ? "Live SerpApi Search" : "Preview Demo Fixture"}
        </span>
      </div>

      <div className="space-y-3">
        {records.map((r, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 font-mono text-xs text-slate-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2 mb-3">
              <div className="flex items-center gap-2 text-cyan-300">
                <Globe className="h-3.5 w-3.5" />
                <span className="font-semibold">{r.tool_used}</span>
                <span className="text-slate-500">→</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                  {r.engine}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3 text-slate-500" />
                  {r.result_count} items retrieved
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-500" />
                  {r.duration_ms}ms
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
              <div>
                <span className="text-slate-500">Query Executed: </span>
                <span className="text-slate-200 font-sans font-medium">"{r.query}"</span>
              </div>
              <div>
                <span className="text-slate-500">Localization: </span>
                <span className="text-slate-300">
                  gl={r.parameters?.gl || "in"}, location="{r.parameters?.location || "India"}"
                </span>
              </div>
            </div>

            {r.notes && (
              <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-[11px] text-slate-400">
                <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{r.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
