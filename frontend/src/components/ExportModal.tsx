"use client";

import React, { useState } from "react";
import { Copy, Check, Download, FileText, Code2, X } from "lucide-react";
import { ResearchResponse } from "@/types/agent";

interface ExportModalProps {
  response: ResearchResponse;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  response,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(response.markdown_decision_brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([response.markdown_decision_brief], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ScoutPilot-Decision-Brief-${response.session_id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ScoutPilot-Data-${response.session_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Export Decision Brief</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/80 bg-slate-950/40 px-6 py-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Markdown"}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Download .md</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Code2 className="h-3.5 w-3.5 text-purple-400" />
            <span>Export JSON</span>
          </button>
        </div>

        {/* Preview Markdown Box */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 leading-relaxed">
            {response.markdown_decision_brief}
          </pre>
        </div>
      </div>
    </div>
  );
};
