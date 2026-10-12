"""Intent parsing and execution plan generation for ScoutPilot AI.

Transforms raw natural-language requests into structured ParsedIntent and
a 7-step visible agent execution plan.
"""

import re
from typing import List, Tuple, Optional
from .models.schemas import ParsedIntent, ExecutionPlanStep, StepState, SearchVertical
from .search.engine_router import route_engine


# Budget regex: e.g. "under 70,000", "under ₹70,000", "below 70000", "budget 80k", "$1000"
BUDGET_REGEX = re.compile(
    r"(?:under|below|less\s+than|within|budget(?:\s+of)?|max(?:\s+price)?)\s*(?:₹|rs\.?|inr|\$)?\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|thousand)?",
    re.IGNORECASE
)
CURRENCY_INR_REGEX = re.compile(r"(?:₹|rs\.?|inr|rupee|lakh)", re.IGNORECASE)
CURRENCY_USD_REGEX = re.compile(r"(?:\$|usd|dollar)", re.IGNORECASE)

# Target count regex: e.g. "three laptops", "find 3", "top 5"
COUNT_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
}
COUNT_REGEX = re.compile(r"\b(find|compare|recommend|show|get|top)\s+(\d+|one|two|three|four|five)\b", re.IGNORECASE)


def parse_intent_and_constraints(goal: str, preferred_vertical: Optional[str] = None) -> ParsedIntent:
    """Parse goal into structured intent and constraints."""
    raw = goal.strip()

    # 1. Budget extraction
    budget_max: Optional[float] = None
    b_match = BUDGET_REGEX.search(raw)
    if b_match:
        val_str = b_match.group(1).replace(",", "")
        multiplier = b_match.group(2)
        try:
            val = float(val_str)
            if multiplier:
                m_lower = multiplier.lower()
                if m_lower == "k" or m_lower == "thousand":
                    val *= 1000
                elif m_lower == "lakh":
                    val *= 100000
            budget_max = val
        except ValueError:
            pass

    # 2. Currency detection
    if CURRENCY_USD_REGEX.search(raw):
        currency = "USD"
    else:
        currency = "INR"

    # 3. Geography
    geography = "India" if ("india" in raw.lower() or currency == "INR") else "Global"

    # 4. Target count
    target_count = 3
    c_match = COUNT_REGEX.search(raw)
    if c_match:
        raw_count = c_match.group(2).lower()
        if raw_count in COUNT_WORDS:
            target_count = COUNT_WORDS[raw_count]
        else:
            try:
                target_count = int(raw_count)
            except ValueError:
                target_count = 3

    # Bounds for safety
    target_count = max(2, min(target_count, 6))

    # 5. Required specs detection
    required_specs: List[str] = []
    goal_lower = raw.lower()
    if "processor" in goal_lower or "cpu" in goal_lower:
        required_specs.append("processor")
    if "ram" in goal_lower or "memory" in goal_lower:
        required_specs.append("ram")
    if "storage" in goal_lower or "ssd" in goal_lower:
        required_specs.append("storage")
    if "display" in goal_lower or "screen" in goal_lower:
        required_specs.append("display")
    if "price" in goal_lower or budget_max is not None:
        required_specs.append("price")

    if not required_specs:
        required_specs = ["processor", "ram", "price"]

    # 6. Entity Type & Category
    if "laptop" in goal_lower or "notebook" in goal_lower:
        item_type = "laptop"
        category = "shopping"
    elif "phone" in goal_lower or "mobile" in goal_lower:
        item_type = "smartphone"
        category = "shopping"
    elif "hotel" in goal_lower:
        item_type = "hotel"
        category = "travel"
    elif "news" in goal_lower:
        item_type = "news"
        category = "news"
    else:
        item_type = "product"
        category = "general"

    # 7. Formulate targeted search queries
    refined_query = raw
    # Strip conversational noise
    cleaned_query = re.sub(r"(find\s+\w+|compare\s+\w+|recommend\s+the\s+best\s+option|provide\s+next\s+steps)", "", raw, flags=re.IGNORECASE)
    cleaned_query = cleaned_query.strip(" .,;:-")
    if len(cleaned_query) < 10:
        cleaned_query = raw

    search_queries = [cleaned_query]

    intent = ParsedIntent(
        raw_goal=raw,
        category=category,
        target_item_type=item_type,
        budget_max=budget_max,
        budget_currency=currency,
        geography=geography,
        target_count=target_count,
        required_specs=required_specs,
        priority_criteria=["price", "processor", "ram", "reliability"],
        selected_vertical=SearchVertical.SHOPPING,
        search_queries=search_queries
    )

    # Route engine and assign
    vertical, _ = route_engine(intent, preferred_vertical)
    intent.selected_vertical = vertical
    return intent


def generate_execution_plan(intent: ParsedIntent) -> List[ExecutionPlanStep]:
    """Build the transparent 7-step execution plan."""
    return [
        ExecutionPlanStep(
            step_id="step-1",
            phase="plan",
            title="Parse Goal & Constraints",
            description=f"Extracted budget ({intent.budget_currency} {f'{intent.budget_max:,.0f}' if intent.budget_max else 'unspecified'}), target ({intent.target_count} {intent.target_item_type}s), and criteria ({', '.join(intent.required_specs)}).",
            status=StepState.COMPLETED
        ),
        ExecutionPlanStep(
            step_id="step-2",
            phase="plan",
            title="Engine Selection & Parameter Routing",
            description=f"Routing query to SerpApi engine '{intent.selected_vertical.value}' with localized geographic parameters ({intent.geography}).",
            status=StepState.PENDING
        ),
        ExecutionPlanStep(
            step_id="step-3",
            phase="search",
            title="Execute Live SerpApi Query",
            description=f"Executing query '{intent.search_queries[0]}' to retrieve fresh market listings.",
            status=StepState.PENDING
        ),
        ExecutionPlanStep(
            step_id="step-4",
            phase="compare",
            title="Normalize & Ground Evidence",
            description="Extracting canonical merchant URLs, parsing Indian prices, deduplicating, and recording verified vs missing specifications.",
            status=StepState.PENDING
        ),
        ExecutionPlanStep(
            step_id="step-5",
            phase="compare",
            title="Deterministic Constraint Verification",
            description="Evaluating budget compliance, hardware match, and calculating evidence-grounded scoring.",
            status=StepState.PENDING
        ),
        ExecutionPlanStep(
            step_id="step-6",
            phase="act",
            title="Synthesize Recommendation & Trade-offs",
            description="Identifying the winning choice with explicit reasons, trade-offs, and gaps in evidence.",
            status=StepState.PENDING
        ),
        ExecutionPlanStep(
            step_id="step-7",
            phase="act",
            title="Generate Action Checklist & Brief",
            description="Formulating next verification steps, purchasing precautions, and a copyable decision report.",
            status=StepState.PENDING
        ),
    ]
