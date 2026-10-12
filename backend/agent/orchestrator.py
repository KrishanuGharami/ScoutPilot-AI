"""Orchestrator for ScoutPilot AI.

Coordinates the four pillars of the AI Agent track:
Plan -> Search -> Compare -> Act.
Maintains state transitions and produces the final ResearchResponse.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from .models.schemas import (
    ResearchRequest, ResearchResponse, StepState
)
from .core.security import sanitize_input_goal
from .planner import parse_intent_and_constraints, generate_execution_plan
from .search.engine_router import route_engine
from .search.serpapi_client import execute_serpapi_search
from .search.normalizer import normalize_serpapi_items
from .comparator import compare_evidence_items
from .recommender import synthesize_recommendation
from .utils.errors import ScoutPilotError


def run_scout_pipeline(request: ResearchRequest) -> ResearchResponse:
    """Execute the end-to-end ScoutPilot AI agent workflow synchronously or asynchronously."""
    session_id = f"scout-{uuid.uuid4().hex[:8]}"
    start_ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # 1. Input validation & sanitization
    is_valid, cleaned_goal, err_reason = sanitize_input_goal(request.goal)
    if not is_valid:
        raise ScoutPilotError(f"Invalid input: {err_reason}", status_code=400)

    # 2. Phase 1: PLAN
    t0 = time.time()
    intent = parse_intent_and_constraints(cleaned_goal, request.preferred_vertical)
    plan = generate_execution_plan(intent)
    plan[0].duration_ms = int((time.time() - t0) * 1000)
    plan[0].status = StepState.COMPLETED

    # Step 2: Routing
    t1 = time.time()
    plan[1].status = StepState.RUNNING
    # In router, localized params are already prepared
    plan[1].duration_ms = int((time.time() - t1) * 1000)
    plan[1].status = StepState.COMPLETED

    search_activity_log = []
    mode_label = "live"

    try:
        # 3. Phase 2: SEARCH
        plan[2].status = StepState.RUNNING
        t2 = time.time()
        _, search_params = route_engine(intent)

        raw_results, activity_record, mode_label = execute_serpapi_search(
            query=intent.search_queries[0],
            vertical=intent.selected_vertical,
            params=search_params,
            demo_mode=request.demo_mode
        )
        search_activity_log.append(activity_record)
        plan[2].duration_ms = int((time.time() - t2) * 1000)
        plan[2].status = StepState.COMPLETED

        # 4. Phase 3: COMPARE
        # Step 4: Normalization
        plan[3].status = StepState.RUNNING
        t3 = time.time()
        normalized_items = normalize_serpapi_items(raw_results, intent.required_specs)
        plan[3].duration_ms = int((time.time() - t3) * 1000)
        plan[3].status = StepState.COMPLETED

        # Step 5: Constraint checking & scoring
        plan[4].status = StepState.RUNNING
        t4 = time.time()
        ranked_evidence = compare_evidence_items(normalized_items, intent)
        plan[4].duration_ms = int((time.time() - t4) * 1000)
        plan[4].status = StepState.COMPLETED

        # 5. Phase 4: ACT
        # Step 6: Recommendation
        plan[5].status = StepState.RUNNING
        t5 = time.time()
        recommendation, checklist, brief_md = synthesize_recommendation(ranked_evidence, intent)
        plan[5].duration_ms = int((time.time() - t5) * 1000)
        plan[5].status = StepState.COMPLETED

        # Step 7: Final Checklist & brief
        plan[6].status = StepState.COMPLETED
        plan[6].duration_ms = 10

        return ResearchResponse(
            success=True,
            mode=mode_label,
            session_id=session_id,
            timestamp=start_ts,
            intent=intent,
            plan=plan,
            search_activity=search_activity_log,
            evidence_items=ranked_evidence[:request.max_items],
            recommendation=recommendation,
            action_checklist=checklist,
            markdown_decision_brief=brief_md,
            error_message=None
        )

    except Exception as exc:
        # Mark current running step as failed
        for s in plan:
            if s.status == StepState.RUNNING:
                s.status = StepState.FAILED
                break
        raise exc
