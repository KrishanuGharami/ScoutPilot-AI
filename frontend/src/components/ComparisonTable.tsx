"use client";

import React, { useState } from "react";
import { Scale, CheckCircle2, XCircle, HelpCircle, ExternalLink, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from "lucide-react";
import { EvidenceItem, MatchStatus } from "@/types/agent";

interface ComparisonTableProps {
  items: EvidenceItem[];
  budgetMax?: number;
  budgetCurrency?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  items,
  budgetMax,
  budgetCurrency = "INR",
}) => {
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  const getStatusBadge = (status?: MatchStatus) => {
    switch (status) {
      case "pass":
        return (
          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Pass</span>
          </span>
        );
      case "fail":
        return (
          <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
            <XCircle className="h-3 w-3" />
            <span>Over Budget</span>
          </span>
        );
      case "unknown":
      default:
        return (
          <span className="flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            <HelpCircle className="h-3 w-3" />
            <span>Unconfirmed</span>
          </span>
        );
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Evidence Comparison Matrix</h3>
          </div>
          <p className="text-xs text-slate-400">
            Side-by-side analysis grounded in retrieved live search evidence
          </p>
        </div>

        {budgetMax && (
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300">
            Target Budget: <span className="font-bold text-cyan-400">{budgetCurrency} {budgetMax.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => {
          const isExpanded = expandedScoreId === item.id;
          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition ${
                idx === 0
                  ? "border-cyan-500/40 bg-slate-950/80 shadow-lg shadow-cyan-950/20"
                  : "border-slate-800/80 bg-slate-950/50 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Header: Rank + Merchant + Score */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${
                        idx === 0
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                      {item.source_name}
                    </span>
                  </div>

                  {/* Score badge with expandable breakdown */}
                  <button
                    onClick={() => setExpandedScoreId(isExpanded ? null : item.id)}
                    className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 transition hover:bg-cyan-900/40"
                    title="Click to see deterministic score breakdown"
                  >
                    <span>{item.score} pts</span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>

                {/* Title */}
                <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug mb-3">
                  {item.title}
                </h4>

                {/* Price and Budget Verification */}
                <div className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/50 px-3 py-2 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Price</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {item.price_raw || "Not found in snippet"}
                    </span>
                  </div>
                  {item.constraint_checks?.budget && getStatusBadge(item.constraint_checks.budget)}
                </div>

                {/* Hardware Specifications */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-500 text-[11px]">Processor:</span>
                    <span className="font-medium text-right text-slate-200">
                      {item.supported_fields.processor || <span className="text-slate-500 italic">Not found</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-500 text-[11px]">RAM:</span>
                    <span className="font-medium text-right text-slate-200">
                      {item.supported_fields.ram || <span className="text-slate-500 italic">Not found</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-500 text-[11px]">Storage:</span>
                    <span className="font-medium text-right text-slate-200">
                      {item.supported_fields.storage || <span className="text-slate-500 italic">Not found</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-500 text-[11px]">Display:</span>
                    <span className="font-medium text-right text-slate-200">
                      {item.supported_fields.display || <span className="text-slate-500 italic">Not found</span>}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Modal/Dropdown */}
                {isExpanded && item.score_breakdown && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-[11px] text-slate-300">
                    <div className="font-semibold text-cyan-300 mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Deterministic Score Logic:</span>
                    </div>
                    <ul className="space-y-1 text-slate-400">
                      {item.score_breakdown.map((b, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-cyan-400">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Link Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <a
                  href={item.canonical_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                >
                  <span>Open {item.source_domain} Listing</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
