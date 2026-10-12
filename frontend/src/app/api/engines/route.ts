import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    recommended_package: "serpapi-search-tools",
    mcp_support: "Official SerpApi MCP supported",
    engines: [
      {
        vertical: "shopping",
        engine: "google_shopping",
        tool: "shopping_search()",
        description: "Products, pricing, merchant inventory, tech specs in India",
        localized_params: { gl: "in", hl: "en", location: "India" },
      },
      {
        vertical: "web",
        engine: "google_light",
        tool: "web_search()",
        description: "Compact, fast web index for research and technical comparisons",
        localized_params: { gl: "in", hl: "en" },
      },
      {
        vertical: "news",
        engine: "google_news",
        tool: "news_search()",
        description: "Live reporting, current updates, and verified press releases",
        localized_params: { gl: "in", hl: "en" },
      },
      {
        vertical: "maps",
        engine: "google_maps",
        tool: "maps_search()",
        description: "Local businesses, ratings, coordinates, and operating hours",
        localized_params: { location: "India" },
      },
    ],
  });
}
