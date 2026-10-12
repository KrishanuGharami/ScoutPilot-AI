"""Pydantic schemas and typed data structures for ScoutPilot AI.

Models cover:
- Requests & configuration
- Step-by-step execution plan (Pending, Running, Completed, Failed)
- Parsed intent & extracted constraints
- Search query and engine audit trace
- Normalized evidence schema (canonical URL, price, verified specs, missing fields)
- Deterministic comparison matrix & constraint checks
- Decision synthesis (winner, trade-offs, uncertainty analysis, action checklist)
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, ConfigDict, Field


class StepState(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class MatchStatus(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    PARTIAL = "partial"
    UNKNOWN = "unknown"


class SearchVertical(str, Enum):
    SHOPPING = "google_shopping"
    WEB = "google_light"
    NEWS = "google_news"
    MAPS = "google_maps"


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------

class ResearchRequest(BaseModel):
    """User research request.

    SerpApi credentials are intentionally not accepted in this public request
    model. The backend reads them only from its environment configuration.
    """
    model_config = ConfigDict(extra="forbid")

    goal: str = Field(..., min_length=3, max_length=500, description="Natural language research goal")
    demo_mode: bool = Field(default=False, description="Use structured sample evidence if no API key is provided")
    preferred_vertical: Optional[str] = Field(default=None, description="Optional override for engine vertical")
    max_items: int = Field(default=5, ge=1, le=10, description="Target number of items to compare")


# ---------------------------------------------------------------------------
# Planning Models
# ---------------------------------------------------------------------------

class ExecutionPlanStep(BaseModel):
    """An individual step in the agent's visible execution plan."""
    step_id: str
    phase: str  # "plan", "search", "compare", "act"
    title: str
    description: str
    status: StepState = StepState.PENDING
    duration_ms: Optional[int] = None
    details: Optional[Dict[str, Any]] = None


class ParsedIntent(BaseModel):
    """Structured extraction from the user's natural language goal."""
    raw_goal: str
    category: str = Field(default="general", description="Category: shopping, tech, news, local, etc.")
    target_item_type: str = Field(default="item", description="Entity type: laptop, smartphone, hotel, flight, etc.")
    budget_max: Optional[float] = None
    budget_currency: str = "INR"
    geography: str = "India"
    target_count: int = 3
    required_specs: List[str] = Field(default_factory=list)
    priority_criteria: List[str] = Field(default_factory=list)
    selected_vertical: SearchVertical = SearchVertical.SHOPPING
    search_queries: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Search Activity Trace
# ---------------------------------------------------------------------------

class SearchActivityRecord(BaseModel):
    """Audit log of actual search calls performed."""
    engine: str
    query: str
    parameters: Dict[str, Any]
    result_count: int
    duration_ms: int
    tool_used: str  # e.g., 'serpapi-search-tools/shopping_search'
    status: str = "success"
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Normalized Evidence Schema
# ---------------------------------------------------------------------------

class EvidenceItem(BaseModel):
    """Normalized, deduplicated evidence candidate for comparison."""
    id: str
    title: str
    canonical_url: str
    source_domain: str
    source_name: str
    price_raw: Optional[str] = None
    price_value: Optional[float] = None
    currency: Optional[str] = "INR"
    snippet: str
    retrieval_timestamp: str

    # Grounded evidence tracking: facts found vs facts missing
    supported_fields: Dict[str, str] = Field(
        default_factory=dict,
        description="Attributes backed by verifiable search evidence (e.g. processor, RAM)"
    )
    missing_fields: List[str] = Field(
        default_factory=list,
        description="Attributes requested or expected but not present in evidence (marked 'Not found')"
    )

    # Constraint verification against user requirements
    constraint_checks: Dict[str, MatchStatus] = Field(
        default_factory=dict,
        description="Status for each constraint: pass, fail, partial, unknown"
    )

    # Deterministic scoring
    score: float = 0.0
    score_breakdown: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Decision Synthesis & Act Models
# ---------------------------------------------------------------------------

class RecommendedOption(BaseModel):
    """The agent's synthesized choice based strictly on verified evidence."""
    winner_id: str
    winner_title: str
    headline_verdict: str
    why_it_wins: List[str]
    tradeoffs_to_accept: List[str]
    uncertainties_and_gaps: List[str]
    runner_up_id: Optional[str] = None
    runner_up_title: Optional[str] = None
    runner_up_tradeoff: Optional[str] = None


class ActionChecklistItem(BaseModel):
    """Actionable next step with verification guidance."""
    id: str
    action_text: str
    category: str  # "verification", "pricing", "purchase", "safeguard"
    link_url: Optional[str] = None
    completed: bool = False


# ---------------------------------------------------------------------------
# Complete Response Envelope
# ---------------------------------------------------------------------------

class ResearchResponse(BaseModel):
    """End-to-end response returned to the UI."""
    success: bool
    mode: str = Field(..., description="'live' (real SerpApi search) or 'preview_demo' (structured fixture)")
    session_id: str
    timestamp: str
    intent: ParsedIntent
    plan: List[ExecutionPlanStep]
    search_activity: List[SearchActivityRecord]
    evidence_items: List[EvidenceItem]
    recommendation: Optional[RecommendedOption] = None
    action_checklist: List[ActionChecklistItem] = Field(default_factory=list)
    markdown_decision_brief: str
    error_message: Optional[str] = None


class HealthResponse(BaseModel):
    """API health and credentials readiness status."""
    status: str
    version: str
    serpapi_configured: bool
    default_location: str
    supported_engines: List[str]
