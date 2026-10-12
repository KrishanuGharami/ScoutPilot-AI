export type StepState = "pending" | "running" | "completed" | "failed";
export type MatchStatus = "pass" | "fail" | "partial" | "unknown";

export interface ExecutionPlanStep {
  step_id: string;
  phase: "plan" | "search" | "compare" | "act";
  title: string;
  description: string;
  status: StepState;
  duration_ms?: number;
  details?: Record<string, any>;
}

export interface ParsedIntent {
  raw_goal: string;
  category: string;
  target_item_type: string;
  budget_max?: number;
  budget_currency: string;
  geography: string;
  target_count: number;
  required_specs: string[];
  priority_criteria: string[];
  selected_vertical: string;
  search_queries: string[];
}

export interface SearchActivityRecord {
  engine: string;
  query: string;
  parameters: Record<string, any>;
  result_count: number;
  duration_ms: number;
  tool_used: string;
  status: string;
  notes?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  canonical_url: string;
  source_domain: string;
  source_name: string;
  price_raw?: string;
  price_value?: number;
  currency?: string;
  snippet: string;
  retrieval_timestamp: string;
  supported_fields: Record<string, string>;
  missing_fields: string[];
  constraint_checks: Record<string, MatchStatus>;
  score: number;
  score_breakdown: string[];
}

export interface RecommendedOption {
  winner_id: string;
  winner_title: string;
  headline_verdict: string;
  why_it_wins: string[];
  tradeoffs_to_accept: string[];
  uncertainties_and_gaps: string[];
  runner_up_id?: string;
  runner_up_title?: string;
  runner_up_tradeoff?: string;
}

export interface ActionChecklistItem {
  id: string;
  action_text: string;
  category: "purchase" | "verification" | "pricing" | "safeguard";
  link_url?: string;
  completed: boolean;
}

export interface ResearchResponse {
  success: boolean;
  mode: "live" | "preview_demo";
  session_id: string;
  timestamp: string;
  intent: ParsedIntent;
  plan: ExecutionPlanStep[];
  search_activity: SearchActivityRecord[];
  evidence_items: EvidenceItem[];
  recommendation: RecommendedOption;
  action_checklist: ActionChecklistItem[];
  markdown_decision_brief: string;
  error_message?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  serpapi_configured: boolean;
  default_location: string;
  supported_engines: string[];
}

export interface ExamplePrompt {
  id: string;
  title: string;
  category: string;
  prompt: string;
}
