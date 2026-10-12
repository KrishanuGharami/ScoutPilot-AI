"""Engine router for ScoutPilot AI.

Selects the most suitable SerpApi engine based on user intent and injects
India-specific geographic parameters (gl=in, hl=en, location=India) when appropriate.
"""

from typing import Dict, Any, Tuple
from ..models.schemas import SearchVertical, ParsedIntent
from ..core.config import settings


def route_engine(intent: ParsedIntent, preferred_vertical: str = None) -> Tuple[SearchVertical, Dict[str, Any]]:
    """Determine the optimal search vertical and localized parameters for the query.

    Returns:
        (selected_vertical, localized_parameters)
    """
    # 1. Respect explicit user override if valid
    if preferred_vertical:
        p_clean = preferred_vertical.lower().strip()
        if "shop" in p_clean:
            vertical = SearchVertical.SHOPPING
        elif "news" in p_clean:
            vertical = SearchVertical.NEWS
        elif "map" in p_clean or "place" in p_clean:
            vertical = SearchVertical.MAPS
        else:
            vertical = SearchVertical.WEB
    else:
        # 2. Automated intent-based routing
        cat = intent.category.lower()
        goal_text = intent.raw_goal.lower()

        # Commerce & products keywords
        product_indicators = [
            "laptop", "phone", "mobile", "buy", "price", "under", "cost", "budget",
            "shop", "deal", "discount", "specs", "best laptop", "gadget", "tablet",
            "monitor", "tv", "camera", "headphone", "scooter", "bike", "car"
        ]
        news_indicators = [
            "latest news", "breaking", "today", "yesterday", "announced", "headline",
            "recent developments", "election", "policy"
        ]
        maps_indicators = [
            "near me", "in bangalore", "in mumbai", "in delhi", "in chennai",
            "address", "restaurant", "hospital", "hotel near", "coworking"
        ]

        if any(ind in goal_text for ind in news_indicators) or cat == "news":
            vertical = SearchVertical.NEWS
        elif any(ind in goal_text for ind in maps_indicators) or cat == "local":
            vertical = SearchVertical.MAPS
        elif any(ind in goal_text for ind in product_indicators) or cat in ("shopping", "commerce", "tech"):
            vertical = SearchVertical.SHOPPING
        else:
            vertical = SearchVertical.WEB

    # 3. Construct localized search parameters for India
    params: Dict[str, Any] = {
        "num": settings.default_search_results,
    }

    if "india" in intent.geography.lower() or intent.budget_currency == "INR":
        params.update({
            "gl": settings.default_gl,          # India country code
            "hl": settings.default_hl,          # English interface
            "location": settings.default_location,  # India
            "google_domain": "google.co.in",    # Localized Google domain
        })

    return vertical, params
