"use client";

import React from "react";
import { Compass, Sparkles, Key, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";

interface NavbarProps {
  serpApiConfigured: boolean;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  serpApiConfigured,
  onOpenSettings,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-2 shadow-lg shadow-cyan-500/20">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                ScoutPilot <span className="text-cyan-400">AI</span>
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                AI Agents Track
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Search live. Compare evidence. Make better decisions.
            </p>
          </div>
        </div>

        {/* Status and Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                serpApiConfigured ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
              }`}
            />
            <span>
              {serpApiConfigured ? "SerpApi: Live Connected" : "SerpApi: Preview Mode"}
            </span>
          </div>

          {/* Settings / API Key Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-700 hover:text-white"
            title="Configure SerpApi API Key"
          >
            <Key className="h-3.5 w-3.5 text-cyan-400" />
            <span>API Key</span>
          </button>

          {/* Architecture / Track Info */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
            title="About ScoutPilot & Track Capabilities"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
};
