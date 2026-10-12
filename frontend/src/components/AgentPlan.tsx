"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle, Loader2, Compass, Search, Scale, FileCheck } from "lucide-react";
import { ExecutionPlanStep, StepState } from "@/types/agent";

interface AgentPlanProps {
  steps: ExecutionPlanStep[];
}

export const AgentPlan: React.FC<AgentPlanProps> = ({ steps }) => {
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "plan":
        return <Compass className="h-4 w-4 text-cyan-400" />;
      case "search":
        return <Search className="h-4 w-4 text-amber-400" />;
      case "compare":
        return <Scale className="h-4 w-4 text-purple-400" />;
      case "act":
        return <FileCheck className="h-4 w-4 text-emerald-400" />;
      default:
        return <Compass className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: StepState, duration?: number) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{duration ? `${duration}ms` : "Done"}</span>
          </span>
        );
      case "running":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Running...</span>
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Failed</span>
          </span>
        );
      case "pending":
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Autonomous Execution Plan</h3>
          <p className="text-xs text-slate-400">Visible lifecycle: Plan → Search → Compare → Act</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
          <span>7-Step Deterministic Workflow</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((s, idx) => (
          <div
            key={s.step_id}
            className={`group relative flex items-start gap-3 rounded-xl border p-3 transition ${
              s.status === "running"
                ? "border-cyan-500/50 bg-cyan-950/20"
                : s.status === "completed"
                ? "border-slate-800/80 bg-slate-950/40 hover:border-slate-700"
                : "border-slate-800/40 bg-slate-950/20 opacity-60"
            }`}
          >
            {/* Step Number & Icon */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
              {getPhaseIcon(s.phase)}
            </div>

            {/* Step Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {idx + 1}. {s.title}
                </span>
                {getStatusBadge(s.status, s.duration_ms)}
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
