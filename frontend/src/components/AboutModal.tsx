"use client";

import React from "react";
import { Compass, Search, Scale, FileCheck, ExternalLink, X, Award, Shield } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 font-bold">
              SP
            </div>
            <div>
              <h3 className="text-base font-bold text-white">About ScoutPilot AI</h3>
              <p className="text-xs text-cyan-400">SerpApi India Hackathon 2026 — AI Agents Track</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p className="text-sm font-medium text-slate-200">
            "Search live. Compare evidence. Make better decisions."
          </p>
          <p>
            ScoutPilot is an agentic research and decision-support application built specifically for the SerpApi India Hackathon 2026. Unlike generic chatbots that simply summarize search snippets, ScoutPilot visibly demonstrates the four key capabilities required by the track:
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                <Compass className="h-4 w-4" />
                <span>1. PLAN</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Parses natural language objectives, extracts budget and hardware constraints, and creates a transparent 7-step execution roadmap.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                <Search className="h-4 w-4" />
                <span>2. SEARCH</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Routes queries to supported SerpApi verticals (<code className="text-slate-300">google_shopping</code>, <code className="text-slate-300">google_light</code>, <code className="text-slate-300">google_news</code>) with localized Indian parameters (<code className="text-slate-300">gl=in, hl=en, location=India</code>).
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center gap-1.5 font-bold text-purple-400 mb-1">
                <Scale className="h-4 w-4" />
                <span>3. COMPARE</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Normalizes market listings into a typed schema, deduplicates candidates, honestly marks missing data as "Not found", and calculates deterministic match scores.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                <FileCheck className="h-4 w-4" />
                <span>4. ACT</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recommends the winning option with transparent "Why It Wins" rationales, trade-offs, uncertainty analysis, an interactive checklist, and exportable Decision Briefs.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Judging Alignment</span>
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• <strong>Idea Strength & Originality:</strong> Real agentic workflow with evidence grounding instead of chatbot hallucinations.</li>
              <li>• <strong>Technical Complexity:</strong> Integrated with official <code className="text-slate-300">serpapi-search-tools</code>, Pydantic data validation, FastAPI, Next.js, and pytest suites.</li>
              <li>• <strong>Meaningful SerpApi Usage:</strong> Real-time product inventory, live pricing, and localized Indian geographic search parameters.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
