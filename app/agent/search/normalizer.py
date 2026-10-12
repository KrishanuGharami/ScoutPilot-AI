"""Result normalizer and spec extractor for ScoutPilot AI.

Transforms raw SerpApi results (shopping, organic, news) into typed EvidenceItem objects.
Enforces:
1. Canonical URL clean-up and domain extraction.
2. Robust Indian Rupee (₹/Rs/INR) and USD price parsing.
3. Spec extraction (Processor, RAM, Storage, Display).
4. Strict evidence honesty: missing fields are marked "Not found", never hallucinated.
5. Result deduplication.
"""

import re
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Set
from ..models.schemas import EvidenceItem
from ..core.security import sanitize_untrusted_web_content


# Regex patterns for price parsing in Indian and international formats
# e.g., ₹64,990, Rs. 68,000, INR 69,999, ₹1,20,000, $899
PRICE_INR_REGEX = re.compile(r"(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)", re.IGNORECASE)
PRICE_USD_REGEX = re.compile(r"\$\s*([\d,]+(?:\.\d{1,2})?)")
GENERIC_NUMBER_REGEX = re.compile(r"(\b\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?\b)")

# Spec extractors
PROCESSOR_PATTERNS = [
    re.compile(r"(intel\s+core\s+i[3579]-?\d{4,5}[a-z]*|core\s+ultra\s+[579]-?\d{3}[a-z]*)", re.IGNORECASE),
    re.compile(r"(amd\s+ryzen\s+[3579]\s+\d{4}[a-z]*)", re.IGNORECASE),
    re.compile(r"(apple\s+m[1234](?:\s+pro|\s+max)?)", re.IGNORECASE),
    re.compile(r"(snapdragon\s+x\s+(?:elite|plus))", re.IGNORECASE),
    re.compile(r"(i[3579]-?\d{4,5}[a-z]*)", re.IGNORECASE),
]

RAM_PATTERNS = [
    re.compile(r"(\b(?:4|8|12|16|24|32|64)\s*gb\s*(?:ddr[45]|lpddr[45]x?)?\s*ram\b)", re.IGNORECASE),
    re.compile(r"(\b(?:4|8|12|16|24|32|64)\s*gb\b(?:\s+unified\s+memory)?)", re.IGNORECASE),
]

STORAGE_PATTERNS = [
    re.compile(r"(\b(?:256|512)\s*gb\s*ssd\b|\b1\s*tb\s*ssd\b|\b2\s*tb\s*ssd\b)", re.IGNORECASE),
    re.compile(r"(\b(?:256|512)\s*gb|\b1\s*tb\b)", re.IGNORECASE),
]

DISPLAY_PATTERNS = [
    re.compile(r"(\b\d{2}(?:\.\d)?[\"\s-]*inch(?:\s+(?:fhd|qhd|uhd|oled|ips|120hz|144hz))?\b)", re.IGNORECASE),
    re.compile(r"(\boled\b|\b120hz\b|\b144hz\b|\bfhd\b|\bqhd\b)", re.IGNORECASE),
]


def clean_url(raw_url: str) -> Tuple[str, str]:
    """Clean tracking params from URL and extract domain."""
    if not raw_url:
        return "", "unknown"
    try:
        parsed = urllib.parse.urlparse(raw_url)
        # Strip common tracking query params
        query_dict = urllib.parse.parse_qs(parsed.query)
        cleaned_query = {
            k: v for k, v in query_dict.items()
            if not k.startswith("utm_") and k not in ("fbclid", "gclid", "ref", "tag")
        }
        new_query_str = urllib.parse.urlencode(cleaned_query, doseq=True)
        canonical = urllib.parse.urlunparse(
            (parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query_str, "")
        )
        domain = parsed.netloc.replace("www.", "")
        return canonical, domain
    except Exception:
        return raw_url, "web"


def parse_price(price_str: Optional[str], snippet_text: str = "") -> Tuple[Optional[str], Optional[float], str]:
    """Parse numeric price and currency from raw price string or text snippet.

    Returns:
        (raw_string, numeric_value, currency_code)
    """
    candidates = []
    if price_str:
        candidates.append(str(price_str))
    if snippet_text:
        candidates.append(snippet_text)

    for text in candidates:
        # Check INR first
        inr_match = PRICE_INR_REGEX.search(text)
        if inr_match:
            raw_val = inr_match.group(1).replace(",", "")
            try:
                val = float(raw_val)
                return f"₹{val:,.0f}", val, "INR"
            except ValueError:
                pass

        # Check USD
        usd_match = PRICE_USD_REGEX.search(text)
        if usd_match:
            raw_val = usd_match.group(1).replace(",", "")
            try:
                val = float(raw_val)
                return f"${val:,.2f}", val, "USD"
            except ValueError:
                pass

    return None, None, "INR"


def extract_attributes(title: str, snippet: str) -> Dict[str, str]:
    """Extract verifiable tech hardware specifications from title and snippet."""
    combined = f"{title} {snippet}"
    specs: Dict[str, str] = {}

    # 1. Processor
    for p in PROCESSOR_PATTERNS:
        m = p.search(combined)
        if m:
            specs["processor"] = m.group(1).strip()
            break

    # 2. RAM
    for p in RAM_PATTERNS:
        m = p.search(combined)
        if m:
            specs["ram"] = m.group(1).strip()
            break

    # 3. Storage
    for p in STORAGE_PATTERNS:
        m = p.search(combined)
        if m:
            specs["storage"] = m.group(1).strip()
            break

    # 4. Display
    for p in DISPLAY_PATTERNS:
        m = p.search(combined)
        if m:
            specs["display"] = m.group(1).strip()
            break

    return specs


def normalize_serpapi_items(
    raw_results: List[Dict[str, Any]],
    requested_specs: List[str] = None
) -> List[EvidenceItem]:
    """Normalize SerpApi items into typed EvidenceItem objects.

    Deduplicates results and honestly tracks missing fields.
    """
    if requested_specs is None:
        requested_specs = ["processor", "ram", "storage", "display"]

    items: List[EvidenceItem] = []
    seen_urls: Set[str] = set()
    seen_titles: Set[str] = set()

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    for idx, r in enumerate(raw_results):
        title = r.get("title") or r.get("name") or ""
        if not title or len(title.strip()) < 3:
            continue

        raw_url = r.get("link") or r.get("product_link") or r.get("url") or ""
        canonical_url, domain = clean_url(raw_url)

        # Deduplication check
        norm_title = re.sub(r"[^a-zA-Z0-9]", "", title.lower())[:30]
        if (canonical_url and canonical_url in seen_urls) or (norm_title in seen_titles):
            continue

        if canonical_url:
            seen_urls.add(canonical_url)
        if norm_title:
            seen_titles.add(norm_title)

        snippet = r.get("snippet") or r.get("description") or ""
        snippet = sanitize_untrusted_web_content(snippet)

        source_name = r.get("source") or r.get("merchant") or domain or "Web"

        # Price parsing
        raw_price_input = r.get("price") or r.get("extracted_price") or ""
        price_display, price_val, currency = parse_price(str(raw_price_input), snippet)

        # Specs extraction
        extracted_specs = extract_attributes(title, snippet)

        supported_fields: Dict[str, str] = {}
        missing_fields: List[str] = []

        if price_display:
            supported_fields["price"] = price_display
        else:
            missing_fields.append("price")

        for req in requested_specs:
            req_lower = req.lower()
            if req_lower in extracted_specs:
                supported_fields[req_lower] = extracted_specs[req_lower]
            else:
                missing_fields.append(req_lower)

        item = EvidenceItem(
            id=f"ev-{idx+1}",
            title=title.strip(),
            canonical_url=canonical_url or "https://google.com",
            source_domain=domain,
            source_name=source_name,
            price_raw=price_display,
            price_value=price_val,
            currency=currency,
            snippet=snippet,
            retrieval_timestamp=now_iso,
            supported_fields=supported_fields,
            missing_fields=missing_fields,
            constraint_checks={},
            score=0.0,
            score_breakdown=[]
        )
        items.append(item)

    return items
