import { NextRequest, NextResponse } from "next/server";
import { runScoutPipeline } from "@/lib/server/agent";

export const maxDuration = 30; // 30 seconds max duration for Vercel Hobby/Pro serverless

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, demo_mode, preferred_vertical, max_items } = body;

    if (!goal || typeof goal !== "string" || goal.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid research goal of at least 3 characters is required.",
          details: { resolution: "Please enter a specific research objective or select a suggested prompt." },
        },
        { status: 400 }
      );
    }

    // Check optional external backend proxy
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(`${backendUrl}/api/research`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (proxyErr) {
        console.warn("External backend proxy failed or timed out, executing native pipeline:", proxyErr);
      }
    }

    // Extract SerpApi Key: Header override (judge input) or Server Environment Variable
    const clientKey = req.headers.get("x-serpapi-key") || undefined;
    const apiKey = clientKey || process.env.SERPAPI_API_KEY || undefined;

    // Run ScoutPilot agent pipeline
    const result = await runScoutPipeline({
      goal,
      demo_mode: demo_mode ?? (!apiKey),
      preferred_vertical,
      max_items: max_items ?? 5,
      apiKey,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ScoutPilot pipeline error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "An error occurred while executing the research pipeline.",
        details: { resolution: "Try switching to Preview Demo Mode or check your query constraints." },
      },
      { status: 500 }
    );
  }
}
