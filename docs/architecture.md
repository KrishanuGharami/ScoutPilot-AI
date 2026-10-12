# ScoutPilot AI — Architecture & Technical Specifications

> **SerpApi India Hackathon 2026 — AI Agents Track**  
> *"Search live. Compare evidence. Make better decisions."*

---

## 1. System Overview

ScoutPilot AI is an autonomous, agentic research and decision-support engine. Unlike traditional search wrappers or generic chatbots that hallucinate or regurgitate raw search snippets, ScoutPilot executes a transparent 4-stage pipeline:

```
[ Natural Language Goal ]
          │
          ▼
┌──────────────────┐
│     1. PLAN      │ ──► Parse constraints (Budget, Geography, Required Specs)
└──────────────────┘     Generate 7-step autonomous roadmap
          │
          ▼
┌──────────────────┐
│    2. SEARCH     │ ──► Engine Router (google_shopping, google_light, google_news)
└──────────────────┘     Inject India geographic parameters (gl=in, hl=en, location=India)
          │              Execute query via serpapi-search-tools (or SerpApi MCP)
          ▼
┌──────────────────┐
│    3. COMPARE    │ ──► Normalize to typed EvidenceItem schema
└──────────────────┘     Deduplicate candidate listings
          │              Attribute extraction (Processor, RAM, Storage, Display)
          │              Strict evidence grounding (Proven vs "Not found")
          │              Deterministic constraint evaluation & score calculation
          ▼
┌──────────────────┐
│     4. ACT       │ ──► Formulate Winner with explicit "Why It Wins" facts
└──────────────────┘     Transparent Trade-offs to Accept & Uncertainty Analysis
                         Runner-Up comparison
                         Interactive Action Checklist
                         Exportable Markdown Decision Brief & JSON
```

---

## 2. Core Pillars (AI Agents Track)

### 2.1 Pillar 1: PLAN
- **Intent Parser** (`agent/planner.py`):
  - Extracts numeric budget thresholds in INR (`₹`, `Rs.`, `k`, `lakh`) or USD (`$`).
  - Detects entity class (e.g., Laptops, Smartphones, Scooters, AI frameworks).
  - Identifies requested comparison dimensions (Processor, RAM, Storage, Reliability).
- **Execution Roadmap**:
  - Emits a visible 7-step plan with real-time status transitions: `pending` → `running` → `completed` (or `failed`).

### 2.2 Pillar 2: SEARCH
- **Engine Router** (`agent/search/engine_router.py`):
  - Automatically routes shopping/commerce queries to `google_shopping`.
  - Routes news/events to `google_news`.
  - Routes technical frameworks/general research to `google_light` / `google`.
- **Geographic Localization**:
  - Automatically binds India-specific search parameters: `gl: "in"`, `hl: "en"`, `location: "India"`, and `google_domain: "google.co.in"`.
- **SerpApi Execution**:
  - Integrates the official recommended Python library `serpapi-search-tools` (`shopping_search`, `web_search`, `news_search`) with official `serpapi.Client` fallback.
  - Tracks search latency, tool calls, query formulation, and item counts in an audit trace.

### 2.3 Pillar 3: COMPARE
- **Result Normalizer** (`agent/search/normalizer.py`):
  - Strips URL marketing trackers (`utm_*`, `fbclid`, `gclid`).
  - Robust regex parser for Indian Rupee prices (`₹64,990`, `Rs. 68,000`, `INR 69,999`).
  - Extracts hardware attributes: Processor (Intel Core / Core Ultra / AMD Ryzen / Apple M-series), RAM (8GB / 16GB / 32GB DDR4/DDR5), Storage (512GB SSD / 1TB SSD).
- **Evidence Honesty**:
  - If a specification is not verified in search results, it is marked as `"Not found"` in `missing_fields`. It is **never** hallucinated.
- **Deterministic Scoring Matrix** (`agent/comparator.py`):
  - Base score: +40.0
  - Budget Match: +25.0 if within limit; -25.0 if exceeding limit; +5.0 value savings bonus.
  - Processor Match: +10.0 for verified CPU; +5.0 for performance H/Ultra series.
  - RAM Match: +10.0 for verified RAM; +5.0 for 16GB+ developer multitasking.
  - Information Uncertainty Penalty: -10.0 if 3+ critical specs are missing.

### 2.4 Pillar 4: ACT
- **Decision Engine** (`agent/recommender.py`):
  - Declares the winner based on the highest evidence score.
  - Highlights specific factual reasons in "Why It Wins".
  - Declares "Key Trade-offs to Consider" and "Information Gaps / Uncertainties".
  - Outlines an alternative option (Runner-Up) with comparative trade-offs.
  - Interactive Action Checklist for pre-purchase verification (RAM upgradability, bank card instant discounts, manufacturer warranty).
  - Formats a comprehensive, copyable Markdown Decision Brief.

---

## 3. Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Backend Engine** | Python 3.10+ / FastAPI / Uvicorn | High-performance asynchronous agent engine |
| **Data Validation** | Pydantic v2 | Strictly typed request/response schemas |
| **Search Tools** | `serpapi-search-tools` 1.0.0 | Official recommended SerpApi Python toolset |
| **Fallback Client** | `serpapi` 1.1.2 | Official SerpApi Python client fallback |
| **Testing** | `pytest` 9.1+ | Unit and integration test suite |
| **Frontend UI** | Next.js 15+ (App Router) / React 19 | Server and client-rendered executive research dashboard |
| **Styling** | Tailwind CSS v4 | Responsive layout, dark mode, glassmorphism |
| **Icons** | Lucide React | Clean, modern UI iconography |

---

## 4. Security & Privacy Safeguards

1. **Server-Side Secret Management**:
   - `SERPAPI_API_KEY` is read strictly on the server from environment variables or secure session requests.
   - API keys are never exposed in HTML, client JavaScript bundles, network payloads, or logs.
2. **Untrusted Web Content Sanitization**:
   - Web snippets and merchant titles are treated strictly as untrusted external data.
   - HTML script tags, event handlers, and prompt-injection keywords (`ignore previous instructions`, `reveal system prompt`, etc.) are disarmed.
3. **Graceful Preview Mode**:
   - When credentials are not supplied, ScoutPilot offers a clearly labeled **Preview Demo Mode** with realistic, structured fixtures. Real API calls and preview fixtures are never confused.
