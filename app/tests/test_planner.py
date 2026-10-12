"""Unit tests for ScoutPilot AI planner and intent extraction."""

import pytest
from agent.planner import parse_intent_and_constraints, generate_execution_plan
from agent.models.schemas import StepState, SearchVertical


def test_parse_laptop_goal_with_inr_budget():
    goal = "Find three laptops available in India under ₹70,000 for software development. Compare processor, RAM, and price."
    intent = parse_intent_and_constraints(goal)

    assert intent.budget_max == 70000.0
    assert intent.budget_currency == "INR"
    assert intent.geography == "India"
    assert intent.target_count == 3
    assert intent.target_item_type == "laptop"
    assert "processor" in intent.required_specs
    assert "ram" in intent.required_specs
    assert intent.selected_vertical == SearchVertical.SHOPPING


def test_parse_usd_budget_and_count():
    goal = "Compare five smartphones under $800 with good battery life."
    intent = parse_intent_and_constraints(goal)

    assert intent.budget_max == 800.0
    assert intent.budget_currency == "USD"
    assert intent.target_count == 5


def test_parse_budget_with_k_suffix():
    goal = "Best gaming laptops under 80k in India"
    intent = parse_intent_and_constraints(goal)

    assert intent.budget_max == 80000.0
    assert intent.budget_currency == "INR"


def test_generate_execution_plan_steps():
    goal = "Find 3 monitors under ₹20,000"
    intent = parse_intent_and_constraints(goal)
    plan = generate_execution_plan(intent)

    assert len(plan) == 7
    assert plan[0].phase == "plan"
    assert plan[0].status == StepState.COMPLETED
    assert plan[2].phase == "search"
    assert plan[4].phase == "compare"
    assert plan[5].phase == "act"
