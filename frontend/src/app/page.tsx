"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AgentInput } from "@/components/AgentInput";
import { AgentPlan } from "@/components/AgentPlan";
import { SearchActivity } from "@/components/SearchActivity";
import { RecommendationCard } from "@/components/RecommendationCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ActionChecklist } from "@/components/ActionChecklist";
import { ExportModal } from "@/components/ExportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { AboutModal } from "@/components/AboutModal";

import {
  fetchHealth,
  fetchExamples,
  runResearchApi,
} from "@/lib/api";
import {
  ResearchResponse,
  ExamplePrompt,
  ExecutionPlanStep,
} from "@/types/agent";
import {
  Sparkles,
  AlertCircle,
  FileDown,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const [goal, setGoal] = useState(
    "Find three laptops available in India under ₹70,000 for software development. Compare current prices, processor, RAM, source reliability, and trade-offs. Recommend the best option and provide next steps."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // App settings & status
  const [serpApiConfigured, setSerpApiConfigured] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState("");
  const [demoMode, setDemoMode] = useState(true); // Default to preview mode so judges can immediately test without setup!
  const [preferredVertical, setPreferredVertical] = useState("");
  const [examples, setExamples] = useState<ExamplePrompt[]>([]);

  // Agent execution results
  const [response, setResponse] = useState<ResearchResponse | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Fetch initial health & examples on load
  useEffect(() => {
    async function init() {
      try {
        const health = await fetchHealth();
        setSerpApiConfigured(health.serpapi_configured);
        if (health.serpapi_configured) {
          // If server already has key, uncheck demo mode by default
          setDemoMode(false);
        }
      } catch (e) {
        console.warn("Could not reach backend health endpoint:", e);
      }

      try {
        const exList = await fetchExamples();
        setExamples(exList);
      } catch (e) {
        // Fallback default examples if backend starting up
        setExamples([
          {
            id: "ex-laptops",
            title: "💻 Laptops Under ₹70k in India",
            category: "Shopping",
            prompt:
              "Find three laptops available in India under ₹70,000 for software development. Compare current prices, processor, RAM, source reliability, and trade-offs. Recommend the best option and provide next steps.",
          },
          {
            id: "ex-scooters",
            title: "⚡ EV Scooters in Bengaluru",
            category: "Mobility",
            prompt:
              "Find three electric scooters available in Bengaluru under ₹1,20,000. Compare on-road price, certified range, charging time, and build reliability. Recommend the top choice.",
          },
          {
            id: "ex-ai",
            title: "🤖 Open-Source AI Agent Frameworks",
            category: "Dev Tools",
            prompt:
              "Compare three open-source Python AI agent frameworks released or updated in 2026. Compare GitHub popularity, tool ecosystem, ease of deployment, and trade-offs. Recommend the best one for production use.",
          },
        ]);
      }
    }
    init();
  }, []);

  const handleRunResearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await runResearchApi({
        goal,
        demo_mode: demoMode,
        api_key_override: apiKeyOverride,
        preferred_vertical: preferredVertical || undefined,
        max_items: 5,
      });
      setResponse(res);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while running the agent.");
    } finally {
      setIsLoading(false);
    }
  };

  const winnerItem = response?.evidence_items?.find(
    (item) => item.id === response.recommendation?.winner_id
  ) || response?.evidence_items?.[0];

  const runnerUpItem = response?.evidence_items?.find(
    (item) => item.id === response.recommendation?.runner_up_id
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Navbar */}
      <Navbar
        serpApiConfigured={serpApiConfigured || !!apiKeyOverride}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsAboutOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Tagline Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-sm shadow-sm shadow-cyan-900/20">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>SerpApi India Hackathon 2026 Submission</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Search live. Compare evidence.{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Make better decisions.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            ScoutPilot is an autonomous research agent that accepts your natural-language objective, executes live SerpApi searches, grounds factual evidence, and formulates high-confidence recommendations with trade-offs.
          </p>
        </section>

        {/* Task Input Section */}
        <section>
          <AgentInput
            goal={goal}
            setGoal={setGoal}
            onSubmit={handleRunResearch}
            isLoading={isLoading}
            examples={examples}
            demoMode={demoMode}
            setDemoMode={setDemoMode}
            preferredVertical={preferredVertical}
            setPreferredVertical={setPreferredVertical}
          />
        </section>

        {/* Error Notification Alert */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-200">Execution Error</h4>
                <p className="text-xs text-rose-300/90 whitespace-pre-line leading-relaxed">
                  {error}
                </p>
                {!serpApiConfigured && !apiKeyOverride && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setDemoMode(true);
                        setError(null);
                        handleRunResearch();
                      }}
                      className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/30 transition"
                    >
                      Switch to Preview Demo Mode and Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Response Dashboard View */}
        {response && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Mode Banner & Export Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    response.mode === "live"
                      ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                      : "bg-amber-400 shadow-[0_0_10px_#fbbf24]"
                  }`}
                />
                <span className="text-xs font-semibold text-slate-200">
                  {response.mode === "live"
                    ? "Live SerpApi Execution Active"
                    : "Preview Demo Mode Active (Synthetic Fixture Evidence)"}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  • Session ID: <code className="text-slate-400 font-mono">{response.session_id}</code>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition shadow-sm"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Export Decision Brief</span>
                </button>
              </div>
            </div>

            {/* Pillar 1: PLAN (Agent Timeline) */}
            <section>
              <AgentPlan steps={response.plan} />
            </section>

            {/* Pillar 2: SEARCH (Audit Trace) */}
            <section>
              <SearchActivity records={response.search_activity} mode={response.mode} />
            </section>

            {/* Pillar 4: ACT (Top Recommendation Hero) */}
            {response.recommendation && (
              <section>
                <RecommendationCard
                  recommendation={response.recommendation}
                  winnerItem={winnerItem}
                  runnerUpItem={runnerUpItem}
                />
              </section>
            )}

            {/* Pillar 3: COMPARE (Evidence Matrix) */}
            <section>
              <ComparisonTable
                items={response.evidence_items}
                budgetMax={response.intent?.budget_max}
                budgetCurrency={response.intent?.budget_currency}
              />
            </section>

            {/* Pillar 4: ACT (Interactive Action Checklist) */}
            {response.action_checklist && response.action_checklist.length > 0 && (
              <section>
                <ActionChecklist initialItems={response.action_checklist} />
              </section>
            )}
          </div>
        )}

        {/* Empty State / Welcome Guide when no search run yet */}
        {!response && !isLoading && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 text-center space-y-4 max-w-2xl mx-auto backdrop-blur-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              Ready for Agentic Research & Decision-Support
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
              Enter any research query above or click one of the suggested prompts to watch ScoutPilot extract constraints, query SerpApi, ground evidence, and formulate an objective recommendation.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={handleRunResearch}
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <span>Run Default Laptop Goal</span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>
          ScoutPilot AI • Built for the <strong>SerpApi India Hackathon 2026 (AI Agents Track)</strong>
        </p>
        <p className="mt-1">
          "Search live. Compare evidence. Make better decisions."
        </p>
      </footer>

      {/* Modals */}
      {response && (
        <ExportModal
          response={response}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeyOverride={apiKeyOverride}
        setApiKeyOverride={setApiKeyOverride}
        serpApiConfigured={serpApiConfigured}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
