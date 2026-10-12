"""Deterministic comparison matrix and evidence scoring for ScoutPilot AI.

Evaluates evidence items against hard and soft user constraints.
Distinguishes known facts from unknown facts and provides a 100% transparent,
deterministic scoring breakdown.
"""

from typing import List
from .models.schemas import EvidenceItem, ParsedIntent, MatchStatus


def compare_evidence_items(
    items: List[EvidenceItem],
    intent: ParsedIntent
) -> List[EvidenceItem]:
    """Perform deterministic constraint evaluation and scoring across all items."""
    budget_max = intent.budget_max

    for item in items:
        checks = {}
        score = 40.0  # Base score
        breakdown = [f"Base score: +40.0"]

        # 1. Budget Constraint
        if budget_max is not None:
            if item.price_value is not None:
                if item.price_value <= budget_max:
                    checks["budget"] = MatchStatus.PASS
                    diff = budget_max - item.price_value
                    score += 25.0
                    breakdown.append(f"Within budget ({intent.budget_currency} {item.price_value:,.0f} <= {budget_max:,.0f}): +25.0")
                    # Bonus for value/savings
                    if diff > 5000:
                        score += 5.0
                        breakdown.append(f"Strong value buffer ({diff:,.0f} under limit): +5.0")
                else:
                    checks["budget"] = MatchStatus.FAIL
                    score -= 25.0
                    breakdown.append(f"Exceeds budget ({intent.budget_currency} {item.price_value:,.0f} > {budget_max:,.0f}): -25.0")
            else:
                checks["budget"] = MatchStatus.UNKNOWN
                breakdown.append("Price not confirmed in listing: 0.0")

        # 2. Processor Check
        proc_str = item.supported_fields.get("processor", "")
        if proc_str:
            checks["processor"] = MatchStatus.PASS
            score += 10.0
            breakdown.append(f"Verified CPU ({proc_str}): +10.0")
            # Bonus for modern H-series / M-series / Ryzen 5+
            if any(term in proc_str.lower() for term in ["13420h", "13500h", "12450h", "ryzen", "core ultra", "m2", "m3"]):
                score += 5.0
                breakdown.append("Performance-tier CPU suited for software dev: +5.0")
        else:
            checks["processor"] = MatchStatus.UNKNOWN
            breakdown.append("Processor model not confirmed in listing: 0.0")

        # 3. RAM Check
        ram_str = item.supported_fields.get("ram", "")
        if ram_str:
            checks["ram"] = MatchStatus.PASS
            score += 10.0
            breakdown.append(f"Verified RAM ({ram_str}): +10.0")
            if "16" in ram_str or "32" in ram_str:
                score += 5.0
                breakdown.append("16GB+ RAM meets developer multitasking standard: +5.0")
            elif "8" in ram_str:
                score -= 5.0
                breakdown.append("8GB RAM is low for modern IDEs / Docker: -5.0")
        else:
            checks["ram"] = MatchStatus.UNKNOWN
            breakdown.append("RAM capacity not confirmed in listing: 0.0")

        # 4. Storage Check
        storage_str = item.supported_fields.get("storage", "")
        if storage_str:
            checks["storage"] = MatchStatus.PASS
            score += 5.0
            breakdown.append(f"Verified storage ({storage_str}): +5.0")
        else:
            checks["storage"] = MatchStatus.UNKNOWN

        # 5. Verified Source Link
        if item.canonical_url and item.canonical_url.startswith("http"):
            score += 5.0
            breakdown.append(f"Direct merchant link ({item.source_domain}): +5.0")

        # Penalty for high missing information
        missing_count = len(item.missing_fields)
        if missing_count >= 3:
            score -= 10.0
            breakdown.append(f"High information uncertainty ({missing_count} fields missing): -10.0")

        # Clamp score 0 to 100
        item.score = round(max(0.0, min(100.0, score)), 1)
        item.constraint_checks = checks
        item.score_breakdown = breakdown

    # Sort descending by score
    items.sort(key=lambda x: x.score, reverse=True)
    return items
