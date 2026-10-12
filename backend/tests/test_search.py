"""Unit tests for search router, parameter localization, and SerpApi integration checks."""

import pytest
from agent.models.schemas import SearchVertical, ParsedIntent
from agent.search.engine_router import route_engine
from agent.search.serpapi_client import execute_serpapi_search
from agent.utils.errors import MissingApiKeyError


def test_engine_router_selection():
    # Shopping intent
    intent_shopping = ParsedIntent(
        raw_goal="Find three laptops under ₹70,000",
        category="shopping",
        target_item_type="laptop",
        budget_max=70000.0,
        budget_currency="INR",
        geography="India",
        target_count=3,
        required_specs=["processor", "ram"],
        priority_criteria=["price"],
        selected_vertical=SearchVertical.SHOPPING,
        search_queries=["laptops under 70000"]
    )
    vert, params = route_engine(intent_shopping)
    assert vert == SearchVertical.SHOPPING
    assert params["gl"] == "in"
    assert params["hl"] == "en"
    assert params["location"] == "India"

    # News intent
    intent_news = ParsedIntent(
        raw_goal="Latest news on AI agents in India today",
        category="news",
        target_item_type="article",
        budget_max=None,
        budget_currency="INR",
        geography="India",
        target_count=3,
        required_specs=[],
        priority_criteria=[],
        selected_vertical=SearchVertical.NEWS,
        search_queries=["AI agents in India"]
    )
    vert_news, _ = route_engine(intent_news)
    assert vert_news == SearchVertical.NEWS


def test_missing_api_key_raises_error_without_demo_mode(monkeypatch):
    monkeypatch.setenv("SERPAPI_API_KEY", "")

    with pytest.raises(MissingApiKeyError):
        execute_serpapi_search(
            query="test query",
            vertical=SearchVertical.SHOPPING,
            params={},
            api_key_override=None,
            demo_mode=False
        )


def test_demo_mode_returns_preview_fixtures(monkeypatch):
    monkeypatch.setenv("SERPAPI_API_KEY", "")

    items, activity, mode = execute_serpapi_search(
        query="test query",
        vertical=SearchVertical.SHOPPING,
        params={"gl": "in"},
        api_key_override=None,
        demo_mode=True
    )

    assert mode == "preview_demo"
    assert len(items) > 0
    assert activity.status == "success"
    assert "Preview Demo Mode" in activity.notes


def test_maps_router_uses_maps_vertical():
    intent = ParsedIntent(
        raw_goal="Find coworking spaces near Bengaluru",
        category="local",
        target_item_type="coworking space",
        geography="India",
        selected_vertical=SearchVertical.MAPS,
        search_queries=["coworking spaces near Bengaluru"],
    )
    vert, params = route_engine(intent)
    assert vert == SearchVertical.MAPS
    assert params["location"] == "India"
