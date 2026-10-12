"""Integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "google_shopping" in data["supported_engines"]


def test_examples_endpoint(client):
    res = client.get("/api/examples")
    assert res.status_code == 200
    examples = res.json()
    assert len(examples) >= 3
    assert any("laptop" in e["title"].lower() for e in examples)


def test_engines_endpoint(client):
    res = client.get("/api/engines")
    assert res.status_code == 200
    data = res.json()
    assert "recommended_package" in data
    assert len(data["engines"]) >= 4


def test_research_pipeline_demo_mode(client):
    payload = {
        "goal": "Find three laptops available in India under ₹70,000 for software development.",
        "demo_mode": True,
        "max_items": 3
    }
    res = client.post("/api/research", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["mode"] == "preview_demo"
    assert len(data["plan"]) == 7
    assert len(data["evidence_items"]) <= 3
    assert data["recommendation"]["winner_id"] is not None
    assert len(data["action_checklist"]) >= 3
    assert "Decision Brief" in data["markdown_decision_brief"]


def test_research_short_query_validation(client):
    res = client.post("/api/research", json={"goal": "hi", "demo_mode": True})
    assert res.status_code == 422  # Pydantic length validation error
