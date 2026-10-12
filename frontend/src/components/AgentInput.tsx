"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2, RefreshCw, Zap, SlidersHorizontal } from "lucide-react";
import { ExamplePrompt } from "@/types/agent";

interface AgentInputProps {
  goal: string;
  setGoal: (goal: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  examples: ExamplePrompt[];
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  preferredVertical: string;
  setPreferredVertical: (val: string) => void;
}

export const AgentInput: React.FC<AgentInputProps> = ({
  goal,
  setGoal,
  onSubmit,
  isLoading,
  examples,
  demoMode,
  setDemoMode,
  preferredVertical,
  setPreferredVertical,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLoading) return;
    onSubmit();
  };

  const handleSelectExample = (exPrompt: string) => {
    setGoal(exPrompt);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl transition hover:border-slate-700/80">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Textarea Area */}
        <div className="relative">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Enter your goal... e.g. 'Find three laptops available in India under ₹70,000 for software development. Compare current prices, processor, RAM, and trade-offs. Recommend the best option and provide next steps.'"
            rows={3}
            disabled={isLoading}
            className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 shadow-inner outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-500">
            {goal.length}/500 • <span className="hidden sm:inline">Ctrl+Enter to send</span>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            {/* Demo Mode Toggle */}
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30"
              />
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Preview Demo Mode</span>
              </span>
            </label>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-400 transition hover:text-slate-200"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Options</span>
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-2">
            {goal && (
              <button
                type="button"
                onClick={() => setGoal("")}
                disabled={isLoading}
                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:text-slate-200"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || goal.trim().length < 3}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Agent Running...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Dispatch ScoutPilot</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Vertical Selector */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-300">
            <span className="font-medium text-slate-400">Search Vertical:</span>
            {["auto", "google_shopping", "google_light", "google_news", "google_maps"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setPreferredVertical(v === "auto" ? "" : v)}
                className={`rounded-lg px-2.5 py-1 font-mono transition ${
                  (v === "auto" && !preferredVertical) || preferredVertical === v
                    ? "border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 font-semibold"
                    : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Curated Example Prompts */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Research Goals:
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExample(ex.prompt)}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800/80 hover:text-white disabled:opacity-50 text-left"
              >
                <span>{ex.title}</span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
