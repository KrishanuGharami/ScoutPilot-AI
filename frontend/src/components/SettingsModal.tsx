"use client";

import React, { useState, useEffect } from "react";
import { Key, Shield, ExternalLink, X, Check, AlertCircle } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyOverride: string;
  setApiKeyOverride: (key: string) => void;
  serpApiConfigured: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeyOverride,
  setApiKeyOverride,
  serpApiConfigured,
}) => {
  const [keyInput, setKeyInput] = useState(apiKeyOverride);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeyInput(apiKeyOverride);
  }, [apiKeyOverride]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKeyOverride(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">SerpApi Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <div className="flex items-center gap-2 font-medium text-slate-200 mb-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  serpApiConfigured ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span>Server Environment Status:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {serpApiConfigured
                ? "Active SERPAPI_API_KEY detected in backend environment."
                : "No backend API key configured yet. You can supply one below for your current browser session, or use Preview Demo Mode."}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Browser Key Override (Optional):
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste SerpApi API key..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Never stored permanently; passed securely via server-side session headers.
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Need a SerpApi Account?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Hackathon participants receive 250 free searches per month on sign-up.
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              {saved ? <Check className="h-4 w-4" /> : null}
              <span>{saved ? "Saved!" : "Save & Apply"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
