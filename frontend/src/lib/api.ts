import { HealthResponse, ResearchResponse, ExamplePrompt } from "@/types/agent";

// If NEXT_PUBLIC_API_URL is configured (e.g. dedicated backend server), use it.
// Otherwise, use relative path ("") which targets native Next.js Serverless API routes on Vercel.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Key storage helper for judge/showcase custom SerpApi key
const STORAGE_KEY = "scoutpilot_session_serpapi_key";

export function getSessionApiKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || "";
}

export function setSessionApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, key.trim());
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/api/health`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch health status: ${res.statusText}`);
  }
  const data = await res.json();

  // If user entered a local key in browser session, mark configured as true
  const localKey = getSessionApiKey();
  if (localKey && !data.serpapi_configured) {
    data.serpapi_configured = true;
  }

  return data;
}

export async function fetchExamples(): Promise<ExamplePrompt[]> {
  const url = `${API_BASE_URL}/api/examples`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch example prompts: ${res.statusText}`);
  }
  return res.json();
}

export async function runResearchApi(params: {
  goal: string;
  demo_mode?: boolean;
  preferred_vertical?: string;
  max_items?: number;
}): Promise<ResearchResponse> {
  const url = `${API_BASE_URL}/api/research`;
  const customKey = getSessionApiKey();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (customKey) {
    headers["x-serpapi-key"] = customKey;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      goal: params.goal,
      demo_mode: params.demo_mode ?? false,
      preferred_vertical: params.preferred_vertical || undefined,
      max_items: params.max_items ?? 5,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error || data?.detail || `API error (${res.status})`;
    const resolution = data?.details?.resolution ? `\n\nSuggestion: ${data.details.resolution}` : "";
    throw new Error(`${errorMsg}${resolution}`);
  }

  return data;
}
