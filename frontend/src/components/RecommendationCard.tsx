"use client";

import React from "react";
import { Trophy, CheckCircle, Scale, AlertTriangle, ExternalLink, ArrowUpRight, Award, HelpCircle } from "lucide-react";
import { RecommendedOption, EvidenceItem } from "@/types/agent";

interface RecommendationCardProps {
  recommendation: RecommendedOption;
  winnerItem?: EvidenceItem;
  runnerUpItem?: EvidenceItem;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  winnerItem,
  runnerUpItem,
}) => {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-slate-900/60 to-slate-900/60 p-6 shadow-2xl backdrop-blur-md">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 p-2 shadow-lg shadow-amber-500/20">
            <Trophy className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              Primary Agent Recommendation
            </span>
            <h2 className="text-lg font-bold text-white">
              {recommendation.winner_title}
            </h2>
          </div>
        </div>

        {winnerItem && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Best Offer</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {winnerItem.price_raw || "Check Merchant"}
              </span>
            </div>
            <a
              href={winnerItem.canonical_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
            >
              <span>View on {winnerItem.source_name}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Grid: Why It Wins vs Trade-offs */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Why It Wins */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
          <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <CheckCircle className="h-4 w-4" />
            <span>Why It Wins (Evidence Backed)</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {recommendation.why_it_wins.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Trade-offs */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 mb-3 text-purple-400 font-semibold text-xs tracking-wider uppercase">
            <Scale className="h-4 w-4" />
            <span>Trade-offs to Accept</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {recommendation.tradeoffs_to_accept.map((t, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Evidence Grounding & Uncertainties Banner */}
      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/10 p-4">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
          <AlertTriangle className="h-4 w-4" />
          <span>Evidence Grounding & Information Gaps</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">
          ScoutPilot enforces strict evidence honesty: unproven specifications are marked "Not found" rather than fabricated.
        </p>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {recommendation.uncertainties_and_gaps.map((u, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">⚠️</span>
              <span className="leading-relaxed">{u}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Runner Up Option */}
      {recommendation.runner_up_title && runnerUpItem && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 font-bold text-xs">
              #2
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Strong Alternative</span>
              <span className="font-semibold text-slate-200">{recommendation.runner_up_title}</span>
              {recommendation.runner_up_tradeoff && (
                <p className="text-[11px] text-slate-400 mt-0.5">{recommendation.runner_up_tradeoff}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-200">{runnerUpItem.price_raw || "Check link"}</span>
            <a
              href={runnerUpItem.canonical_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 transition hover:bg-slate-700"
            >
              <span>{runnerUpItem.source_name}</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
