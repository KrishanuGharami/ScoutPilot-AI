# ScoutPilot AI — 3-Minute Video Demo Script

> **Event**: SerpApi India Hackathon 2026 (AI Agents Track)  
> **Tagline**: *"Search live. Compare evidence. Make better decisions."*  
> **Target Video Length**: ~2 minutes 30 seconds

---

## 0:00 – 0:30: Introduction & The Problem
- **Visual**: Open ScoutPilot AI at `http://localhost:3000` showing the clean dark-mode dashboard.
- **Narrator**:
  > *"Hi judges! Welcome to ScoutPilot AI, built for the SerpApi India Hackathon 2026 under the AI Agents Track.
  > Today, when people need to make purchase or technical decisions, standard LLM chatbots hallucinate outdated specs, while search engines dump 50 messy ad links.
  > ScoutPilot solves this by giving users a true autonomous agent that executes the four essential track capabilities: **Plan**, **Search**, **Compare**, and **Act**."*

---

## 0:30 – 1:00: Phase 1 (Plan) & Phase 2 (Search)
- **Visual**: Show the natural language prompt input:
  `"Find three laptops available in India under ₹70,000 for software development. Compare current prices, processor, RAM, source reliability, and trade-offs. Recommend the best option and provide next steps."`
  Click **"Dispatch ScoutPilot"**.
- **Narrator**:
  > *"Let's input a real-world request: finding laptops in India under ₹70,000 for software engineering.
  > Notice what happens:
  > In Phase 1 — **Plan** — ScoutPilot parses our budget (₹70,000), location (India), and required criteria (Processor, RAM). It generates a visible 7-step execution roadmap.
  > In Phase 2 — **Search** — the engine router automatically selects `google_shopping` using the official `serpapi-search-tools` library and injects Indian geographic parameters: `gl=in`, `hl=en`, and `location=India`."*

---

## 1:00 – 1:45: Phase 3 (Compare): Evidence Grounding & Deterministic Scoring
- **Visual**: Scroll down to the **SerpApi Execution Audit Trace** and the **Evidence Comparison Matrix**. Expand the **"95.0 pts"** score breakdown badge.
- **Narrator**:
  > *"Here in the audit trace, you can see the exact query, latency, and retrieved count.
  > In Phase 3 — **Compare** — ScoutPilot extracts prices in Indian Rupees, parses specs, and deduplicates listings.
  > Most importantly: notice our evidence honesty! When a spec isn't verified in the listing, it's explicitly labeled 'Not found' rather than hallucinated.
  > Our scoring is 100% deterministic: clicking any score shows the exact point calculation: +25 for budget compliance, +10 for verified CPU, +5 for 16GB developer RAM, and penalties if information is missing."*

---

## 1:45 – 2:15: Phase 4 (Act): Recommendation & Action Checklist
- **Visual**: Focus on the **Primary Recommendation Hero Card** and the **Recommended Action Checklist**. Click a checkbox to mark it done.
- **Narrator**:
  > *"In Phase 4 — **Act** — ScoutPilot synthesizes a concrete winner: the ASUS Vivobook 16 with Intel Core i5-13420H and 16GB RAM at ₹64,990.
  > It explains 'Why It Wins', transparent trade-offs, and critical uncertainty alerts.
  > It also provides an interactive checklist: you can verify RAM expandability, check Indian bank card instant discounts, and inspect warranty coverage directly."*

---

## 2:15 – 2:30: Decision Brief Export & Conclusion
- **Visual**: Click **"Export Decision Brief"**, show the Markdown and JSON export buttons, click **"Copy Markdown"**.
- **Narrator**:
  > *"Finally, users can export or copy the full Markdown Decision Brief with one click to share with their team.
  > ScoutPilot is built with Python FastAPI, Next.js, Tailwind CSS, Pydantic, and official SerpApi search tools, fully verified with 18 automated pytest checks.
  > Thank you!"*
