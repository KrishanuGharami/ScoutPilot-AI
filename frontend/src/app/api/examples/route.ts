import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/examples`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to native handler
    }
  }

  return NextResponse.json([
    {
      id: "ex-laptops-india",
      title: "💻 Laptops Under ₹70k in India",
      category: "Tech / Shopping",
      prompt:
        "Find three laptops available in India under ₹70,000 for software development. Compare current prices, processor, RAM, source reliability, and trade-offs. Recommend the best option and provide next steps.",
    },
    {
      id: "ex-ev-scooters",
      title: "⚡ EV Scooters in Bengaluru",
      category: "Urban Mobility",
      prompt:
        "Find three electric scooters available in Bengaluru under ₹1,20,000. Compare on-road price, certified range, charging time, and build reliability. Recommend the top choice.",
    },
    {
      id: "ex-ai-frameworks",
      title: "🤖 Open-Source AI Agent Frameworks",
      category: "Developer Tools",
      prompt:
        "Compare three open-source Python AI agent frameworks released or updated in 2026. Compare GitHub popularity, tool ecosystem, ease of deployment, and trade-offs. Recommend the best one for production use.",
    },
    {
      id: "ex-phones-camera",
      title: "📱 Camera Phones Under ₹45k",
      category: "Smartphones",
      prompt:
        "Find three smartphones available in India under ₹45,000 with exceptional camera performance. Compare sensor specs, battery life, prices, and merchant reliability. Recommend the best option.",
    },
  ]);
}
