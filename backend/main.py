"""FastAPI application entrypoint for ScoutPilot AI backend.

Exposes REST API endpoints:
- POST /api/research: Run agentic research pipeline (Plan -> Search -> Compare -> Act)
- GET  /api/health: Service readiness and SerpApi configuration status
- GET  /api/engines: Information on supported SerpApi verticals
- GET  /api/examples: Curated India Hackathon test prompts
"""

import logging
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from agent.models.schemas import ResearchRequest, ResearchResponse, HealthResponse
    from agent.orchestrator import run_scout_pipeline
    from agent.core.config import settings
    from agent.utils.errors import ScoutPilotError, MissingApiKeyError
except ImportError:
    from .agent.models.schemas import ResearchRequest, ResearchResponse, HealthResponse
    from .agent.orchestrator import run_scout_pipeline
    from .agent.core.config import settings
    from .agent.utils.errors import ScoutPilotError, MissingApiKeyError

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("scoutpilot-backend")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="ScoutPilot AI — Agentic research and decision-support powered by SerpApi."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ScoutPilotError)
async def handle_scout_error(request: Request, exc: ScoutPilotError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message,
            "details": exc.details
        }
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    logger.exception("Unexpected error in ScoutPilot backend")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal agent processing error.",
            "details": {"message": str(exc)}
        }
    )


@app.get("/api/health", response_model=HealthResponse)
def get_health(request: Request):
    """Check backend status and SerpApi credentials availability."""
    configured = settings.is_serpapi_configured()
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        serpapi_configured=configured,
        default_location=settings.default_location,
        supported_engines=["google_shopping", "google_light", "google_news", "google_maps"]
    )


@app.get("/api/examples")
def get_example_prompts() -> List[Dict[str, str]]:
    """Curated goal prompts for instant one-click testing."""
    return [
        {
            "id": "ex-laptops-india",
            "title": "💻 Laptops Under ₹70k in India",
            "category": "Tech / Shopping",
            "prompt": "Find three laptops available in India under ₹70,000 for software development. Compare current prices, processor, RAM, source reliability, and trade-offs. Recommend the best option and provide next steps."
        },
        {
            "id": "ex-ev-scooters",
            "title": "⚡ EV Scooters in Bengaluru",
            "category": "Urban Mobility",
            "prompt": "Find three electric scooters available in Bengaluru under ₹1,20,000. Compare on-road price, certified range, charging time, and build reliability. Recommend the top choice."
        },
        {
            "id": "ex-ai-frameworks",
            "title": "🤖 Open-Source AI Agent Frameworks",
            "category": "Developer Tools",
            "prompt": "Compare three open-source Python AI agent frameworks released or updated in 2026. Compare GitHub popularity, tool ecosystem, ease of deployment, and trade-offs. Recommend the best one for production use."
        },
        {
            "id": "ex-phones-camera",
            "title": "📱 Camera Phones Under ₹45k",
            "category": "Smartphones",
            "prompt": "Find three smartphones available in India under ₹45,000 with exceptional camera performance. Compare sensor specs, battery life, prices, and merchant reliability. Recommend the best option."
        }
    ]


@app.get("/api/engines")
def get_supported_engines() -> Dict[str, Any]:
    """Return supported SerpApi engine tools and capabilities."""
    return {
        "recommended_package": "serpapi-search-tools",
        "mcp_support": "Official SerpApi MCP supported",
        "engines": [
            {
                "vertical": "shopping",
                "engine": "google_shopping",
                "tool": "shopping_search()",
                "description": "Products, pricing, merchant inventory, tech specs in India",
                "localized_params": {"gl": "in", "hl": "en", "location": "India"}
            },
            {
                "vertical": "web",
                "engine": "google_light",
                "tool": "web_search()",
                "description": "Compact, fast web index for research and technical comparisons",
                "localized_params": {"gl": "in", "hl": "en"}
            },
            {
                "vertical": "news",
                "engine": "google_news",
                "tool": "news_search()",
                "description": "Live reporting, current updates, and verified press releases",
                "localized_params": {"gl": "in", "hl": "en"}
            },
            {
                "vertical": "maps",
                "engine": "google_maps",
                "tool": "maps_search()",
                "description": "Local businesses, ratings, coordinates, and operating hours",
                "localized_params": {"location": "India"}
            }
        ]
    }


@app.post("/api/research", response_model=ResearchResponse)
def run_research(request: ResearchRequest):
    """Execute the full agentic research pipeline: Plan, Search, Compare, Act."""
    logger.info(f"Received research request: '{request.goal[:80]}...' (demo_mode={request.demo_mode})")
    try:
        response = run_scout_pipeline(request)
        logger.info(f"Pipeline completed successfully: session={response.session_id}, mode={response.mode}")
        return response
    except ScoutPilotError:
        raise
    except Exception as exc:
        logger.exception("Failed to run scout pipeline")
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
