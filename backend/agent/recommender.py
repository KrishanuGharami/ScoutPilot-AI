"""Recommendation synthesis, uncertainty analysis, and action checklist for ScoutPilot AI.

Produces:
1. Recommended option with explicit rationale.
2. Trade-offs and uncertainties based strictly on verified evidence.
3. Actionable next steps and interactive checklist.
4. Exportable Markdown decision brief.
"""

from typing import List, Tuple, Optional
from datetime import datetime, timezone
from .models.schemas import (
    EvidenceItem, ParsedIntent, RecommendedOption, ActionChecklistItem
)


def synthesize_recommendation(
    ranked_items: List[EvidenceItem],
    intent: ParsedIntent
) -> Tuple[Optional[RecommendedOption], List[ActionChecklistItem], str]:
    """Synthesize recommendation, action plan, and decision brief."""
    if not ranked_items:
        return None, [], "# ScoutPilot AI Decision Brief\n\nNo eligible items found matching criteria."

    winner = ranked_items[0]
    runner_up = ranked_items[1] if len(ranked_items) > 1 else None

    # 1. Why it wins
    why_it_wins = []
    if winner.price_raw and intent.budget_max and winner.price_value:
        savings = intent.budget_max - winner.price_value
        if savings >= 0:
            why_it_wins.append(
                f"Comfortably within budget at {winner.price_raw} (saving {intent.budget_currency} {savings:,.0f} against your {intent.budget_currency} {intent.budget_max:,.0f} limit)."
            )
        else:
            why_it_wins.append(f"Offered at {winner.price_raw}.")

    cpu = winner.supported_fields.get("processor")
    if cpu:
        why_it_wins.append(f"Features a developer-grade {cpu} processor for compilation and container workloads.")

    ram = winner.supported_fields.get("ram")
    if ram:
        why_it_wins.append(f"Equipped with {ram} for multitasking with IDEs, Docker, and local databases.")

    storage = winner.supported_fields.get("storage")
    if storage:
        why_it_wins.append(f"Includes {storage} for rapid boot and project build times.")

    if not why_it_wins:
        why_it_wins.append(f"Achieved highest evidence score ({winner.score}/100) across available market listings.")

    # 2. Trade-offs to accept
    tradeoffs = []
    if "battery" in winner.missing_fields or "battery" not in winner.supported_fields:
        tradeoffs.append("Battery life endurance under heavy development workloads was not specified in the listing.")

    if "display" in winner.supported_fields:
        disp = winner.supported_fields["display"]
        if "14" in disp:
            tradeoffs.append("14-inch display offers high portability but reduced screen real estate compared to 15.6-inch.")
        elif "16" in disp:
            tradeoffs.append("16-inch display offers generous screen area but increases carry weight.")

    if runner_up and runner_up.price_value and winner.price_value:
        if runner_up.price_value < winner.price_value:
            diff = winner.price_value - runner_up.price_value
            tradeoffs.append(f"The runner-up ({runner_up.title.split('(')[0].strip()}) is {intent.budget_currency} {diff:,.0f} cheaper if budget is tighter.")

    if not tradeoffs:
        tradeoffs.append("Verify warranty coverage details with the seller prior to final checkout.")

    # 3. Uncertainty and Information Gaps
    uncertainties = []
    if winner.missing_fields:
        uncertainties.append(
            f"The following attributes were not confirmed by the search listing: {', '.join(winner.missing_fields)}."
        )
    uncertainties.append(
        "E-commerce prices in India fluctuate rapidly; verify the live merchant price before completing transaction."
    )
    uncertainties.append(
        "RAM expansion capabilities (soldered vs SO-DIMM slot) require checking the manufacturer's spec sheet."
    )

    # 4. Runner-up rationale
    runner_up_tradeoff = None
    if runner_up:
        runner_up_tradeoff = (
            f"Priced at {runner_up.price_raw or 'N/A'} (Score: {runner_up.score}/100). "
            f"A solid alternative if the primary choice is out of stock or you prefer {runner_up.source_name}."
        )

    recommendation = RecommendedOption(
        winner_id=winner.id,
        winner_title=winner.title,
        headline_verdict=f"Top Recommendation: {winner.title.split('(')[0].strip()}",
        why_it_wins=why_it_wins,
        tradeoffs_to_accept=tradeoffs,
        uncertainties_and_gaps=uncertainties,
        runner_up_id=runner_up.id if runner_up else None,
        runner_up_title=runner_up.title if runner_up else None,
        runner_up_tradeoff=runner_up_tradeoff
    )

    # 5. Action Checklist
    checklist: List[ActionChecklistItem] = [
        ActionChecklistItem(
            id="act-1",
            category="purchase",
            action_text=f"Inspect live pricing and seller ratings for '{winner.title.split('(')[0].strip()}' on {winner.source_name}.",
            link_url=winner.canonical_url,
            completed=False
        ),
        ActionChecklistItem(
            id="act-2",
            category="verification",
            action_text=f"Confirm whether RAM ({winner.supported_fields.get('ram', '16GB')}) is expandable via a free SO-DIMM slot.",
            link_url=None,
            completed=False
        ),
        ActionChecklistItem(
            id="act-3",
            category="pricing",
            action_text="Check available Indian bank card instant discounts (HDFC, ICICI, SBI) or exchange bonuses for extra savings.",
            link_url=None,
            completed=False
        ),
        ActionChecklistItem(
            id="act-4",
            category="safeguard",
            action_text="Verify official manufacturer on-site warranty duration in India (minimum 1 year recommended).",
            link_url=None,
            completed=False
        ),
    ]

    # 6. Comprehensive Markdown Decision Brief
    brief_md = generate_markdown_brief(intent, winner, runner_up, ranked_items, recommendation, checklist)

    return recommendation, checklist, brief_md


def generate_markdown_brief(
    intent: ParsedIntent,
    winner: EvidenceItem,
    runner_up: Optional[EvidenceItem],
    all_items: List[EvidenceItem],
    rec: RecommendedOption,
    checklist: List[ActionChecklistItem]
) -> str:
    """Generate a clean, professional, copyable Markdown Decision Brief."""
    date_str = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")

    lines = [
        f"# 🎯 ScoutPilot AI — Decision Brief",
        f"**Goal**: {intent.raw_goal}",
        f"**Date**: {date_str} | **Geography**: {intent.geography} | **Engine**: {intent.selected_vertical.value}",
        "",
        "---",
        "",
        f"## 🏆 Top Recommendation: {winner.title}",
        f"- **Best Price Found**: `{winner.price_raw or 'Check link'}` via [{winner.source_name}]({winner.canonical_url})",
        f"- **Evidence Match Score**: `{winner.score}/100`",
        "",
        "### Why It Wins",
    ]
    for w in rec.why_it_wins:
        lines.append(f"- ✅ {w}")

    lines.extend([
        "",
        "### Key Trade-offs to Consider",
    ])
    for t in rec.tradeoffs_to_accept:
        lines.append(f"- ⚖️ {t}")

    lines.extend([
        "",
        "### Evidence Grounding & Uncertainties",
    ])
    for u in rec.uncertainties_and_gaps:
        lines.append(f"- ⚠️ {u}")

    if runner_up:
        lines.extend([
            "",
            f"## 🥈 Runner-Up Option: {runner_up.title}",
            f"- **Price**: `{runner_up.price_raw or 'N/A'}` via [{runner_up.source_name}]({runner_up.canonical_url})",
            f"- **Score**: `{runner_up.score}/100`",
            f"- **Trade-off Comparison**: {rec.runner_up_tradeoff}",
        ])

    lines.extend([
        "",
        "---",
        "",
        "## 📊 Evidence Comparison Matrix",
        "| Option | Price | Processor | RAM | Storage | Match Score | Link |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    ])

    for itm in all_items[:4]:
        short_title = itm.title[:32] + "..." if len(itm.title) > 35 else itm.title
        p = itm.supported_fields.get("price", "Not found")
        cpu = itm.supported_fields.get("processor", "Not found")
        ram = itm.supported_fields.get("ram", "Not found")
        storage = itm.supported_fields.get("storage", "Not found")
        lines.append(f"| {short_title} | {p} | {cpu} | {ram} | {storage} | {itm.score}/100 | [{itm.source_name}]({itm.canonical_url}) |")

    lines.extend([
        "",
        "---",
        "",
        "## 📋 Recommended Action Checklist",
    ])
    for c in checklist:
        link_md = f" ([Open]({c.link_url}))" if c.link_url else ""
        lines.append(f"- [ ] **{c.category.title()}**: {c.action_text}{link_md}")

    lines.extend([
        "",
        "---",
        "*Generated by ScoutPilot AI — Search live. Compare evidence. Make better decisions.*"
    ])

    return "\n".join(lines)
