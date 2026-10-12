"use client";

import React, { useState } from "react";
import { CheckSquare, Square, CheckCircle, ExternalLink, ShieldCheck, Tag, HelpCircle } from "lucide-react";
import { ActionChecklistItem } from "@/types/agent";

interface ActionChecklistProps {
  initialItems: ActionChecklistItem[];
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({ initialItems }) => {
  const [items, setItems] = useState<ActionChecklistItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "purchase":
        return <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">Merchant Link</span>;
      case "verification":
        return <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400">Spec Check</span>;
      case "pricing":
        return <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">Discount & Offers</span>;
      case "safeguard":
        return <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">Warranty & Risk</span>;
      default:
        return <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">{cat}</span>;
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Recommended Action Checklist</h3>
          </div>
          <p className="text-xs text-slate-400">
            Interactive pre-decision steps to verify offers and eliminate purchase risks
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-300">
            {completedCount}/{items.length}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 transition ${
              item.completed
                ? "border-emerald-500/30 bg-emerald-950/10 opacity-75"
                : "border-slate-800/80 bg-slate-950/50 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {item.completed ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4 text-slate-600" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryBadge(item.category)}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    item.completed ? "line-through text-slate-500" : "text-slate-200"
                  }`}
                >
                  {item.action_text}
                </p>
              </div>
            </div>

            {item.link_url && (
              <a
                href={item.link_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:bg-slate-700"
              >
                <span>Open Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
