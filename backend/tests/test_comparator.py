"""Unit tests for deterministic comparison and constraint checking."""

import pytest
from agent.comparator import compare_evidence_items
from agent.models.schemas import EvidenceItem, ParsedIntent, MatchStatus, SearchVertical


def test_compare_evidence_items_budget_and_scoring():
    intent = ParsedIntent(
        raw_goal="Find laptops under ₹70,000 with 16GB RAM",
        category="shopping",
        target_item_type="laptop",
        budget_max=70000.0,
        budget_currency="INR",
        geography="India",
        target_count=3,
        required_specs=["processor", "ram"],
        priority_criteria=["price", "processor", "ram"],
        selected_vertical=SearchVertical.SHOPPING,
        search_queries=["laptops under 70000"]
    )

    items = [
        # Option 1: Meets budget and has 16GB RAM + i5 CPU
        EvidenceItem(
            id="ev-1",
            title="ASUS Vivobook 16",
            canonical_url="https://flipkart.com/item1",
            source_domain="flipkart.com",
            source_name="Flipkart",
            price_raw="₹64,990",
            price_value=64990.0,
            currency="INR",
            snippet="13th Gen Intel Core i5-13420H, 16GB RAM",
            retrieval_timestamp="2026-10-10T12:00:00Z",
            supported_fields={"price": "₹64,990", "processor": "Intel Core i5-13420H", "ram": "16GB RAM"},
            missing_fields=[],
            constraint_checks={},
            score=0.0
        ),
        # Option 2: Over budget (₹78,000)
        EvidenceItem(
            id="ev-2",
            title="Premium Ultrabook",
            canonical_url="https://amazon.in/item2",
            source_domain="amazon.in",
            source_name="Amazon",
            price_raw="₹78,000",
            price_value=78000.0,
            currency="INR",
            snippet="Intel Core i7, 16GB RAM",
            retrieval_timestamp="2026-10-10T12:00:00Z",
            supported_fields={"price": "₹78,000", "processor": "Intel Core i7", "ram": "16GB RAM"},
            missing_fields=[],
            constraint_checks={},
            score=0.0
        ),
        # Option 3: Within budget but low 8GB RAM
        EvidenceItem(
            id="ev-3",
            title="Budget Laptop",
            canonical_url="https://dell.com/item3",
            source_domain="dell.com",
            source_name="Dell",
            price_raw="₹52,000",
            price_value=52000.0,
            currency="INR",
            snippet="Intel Core i3, 8GB RAM",
            retrieval_timestamp="2026-10-10T12:00:00Z",
            supported_fields={"price": "₹52,000", "processor": "Intel Core i3", "ram": "8GB RAM"},
            missing_fields=[],
            constraint_checks={},
            score=0.0
        )
    ]

    scored = compare_evidence_items(items, intent)

    # Scored list must be sorted descending
    assert scored[0].id == "ev-1"
    assert scored[0].constraint_checks["budget"] == MatchStatus.PASS
    assert scored[0].score > scored[1].score

    # Option 2 fails budget check
    over_budget_item = next(i for i in scored if i.id == "ev-2")
    assert over_budget_item.constraint_checks["budget"] == MatchStatus.FAIL

    # All items have transparent score breakdowns
    assert len(scored[0].score_breakdown) > 0
