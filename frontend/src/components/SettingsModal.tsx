"use client";

import React, { useState, useEffect } from "react";
import { Key, Shield, ExternalLink, X, Check, Eye, EyeOff, Trash2 } from "lucide-react";
import { getSessionApiKey, setSessionApiKey } from "@/lib/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serpApiConfigured: boolean;
  onStatusChange?: (isConfigured: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  serpApiConfigured,
  onStatusChange,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getSessionApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    setSessionApiKey(apiKeyInput);
    setSavedSuccess(true);
    if (onStatusChange) {
      onStatusChange(Boolean(apiKeyInput.trim()) || serpApiConfigured);
    }
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearKey = () => {
    setApiKeyInput("");
    setSessionApiKey("");
    if (onStatusChange) {
      onStatusChange(serpApiConfigured);
    }
  };

  const hasActiveKey = serpApiConfigured || Boolean(apiKeyInput.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">SerpApi Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Status Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <div className="flex items-center gap-2 font-medium text-slate-200 mb-1">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  hasActiveKey ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
                }`}
              />
              <span>Live Search Readiness:</span>
              <span className={`font-semibold ${hasActiveKey ? "text-emerald-400" : "text-amber-400"}`}>
                {hasActiveKey ? "Ready for Live Queries" : "Preview Demo Mode"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {hasActiveKey
                ? "Active SerpApi key connected. ScoutPilot will execute live searches against Google Shopping, Light Web, and News engines."
                : "No active key detected. The app runs in Preview Demo Mode with verified benchmark data, or you can paste your SerpApi key below."}
            </p>
          </div>

          {/* Interactive Key Input for Judges / Showcase */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="session-key" className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Judge / Showcase Session Key</span>
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-300">Optional</span>
              </label>
              {apiKeyInput && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Paste your SerpApi key to test live queries in this browser session. It is stored securely in your browser session and never saved on third-party databases.
            </p>

            <div className="relative flex items-center">
              <input
                id="session-key"
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter SerpApi key (e.g. 8a9b...)"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-16 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 p-1 text-slate-400 hover:text-slate-200"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                Or set <code className="text-cyan-300">SERPAPI_API_KEY</code> in Vercel Environment Variables.
              </span>
              <button
                type="button"
                onClick={handleSaveKey}
                className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Apply Key</span>
                )}
              </button>
            </div>
          </div>

          {/* SerpApi Free Account Card */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Free SerpApi Developer Account</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Hackathon participants receive 250 free live searches every month on sign-up.
            </p>
            <a
              href="https://serpapi.com/users/sign_up?plan=free&utm_source=india_hackathon_26"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline"
            >
              <span>Create free SerpApi account</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Footer Close */}
          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
