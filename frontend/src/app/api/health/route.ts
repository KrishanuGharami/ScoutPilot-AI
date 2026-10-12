import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/health`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to native handler
    }
  }

  const isConfigured = Boolean(process.env.SERPAPI_API_KEY);

  return NextResponse.json({
    status: "healthy",
    version: "1.0.0",
    serpapi_configured: isConfigured,
    default_location: "India",
    supported_engines: ["google_shopping", "google_light", "google_news", "google_maps"],
  });
}
