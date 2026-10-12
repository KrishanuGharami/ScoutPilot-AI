"""Security, input validation, and prompt injection mitigation for ScoutPilot AI.

Enforces:
1. Input validation and length bounds.
2. Treatment of retrieved web content as untrusted data (defense against indirect prompt injection).
3. Secret redaction from any outgoing logs or error traces.
"""

import re
from typing import Tuple, List

# Suspicious phrases that attempt to hijack agent behavior
SUSPICIOUS_PROMPT_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"system\s*prompt", re.IGNORECASE),
    re.compile(r"reveal\s+(the\s+)?(api\s+key|secret|environment)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+a\s+different\s+agent", re.IGNORECASE),
    re.compile(r"jailbreak", re.IGNORECASE),
    re.compile(r"exec\(|eval\(|__import__", re.IGNORECASE),
]

# Sensitive keys that must be redacted
SECRET_KEY_PATTERNS = [
    re.compile(r"(api[_-]?key[\s:=]+)([a-zA-Z0-9_\-]{16,})", re.IGNORECASE),
    re.compile(r"(serpapi[_-]?key[\s:=]+)([a-zA-Z0-9_\-]{16,})", re.IGNORECASE),
    re.compile(r"(bearer\s+)([a-zA-Z0-9_\-\.]{20,})", re.IGNORECASE),
]


def sanitize_input_goal(goal: str, min_len: int = 3, max_len: int = 500) -> Tuple[bool, str, str]:
    """Validate and sanitize user input query.

    Returns:
        (is_valid, cleaned_query, error_reason)
    """
    if not goal or not isinstance(goal, str):
        return False, "", "Goal query cannot be empty."

    cleaned = goal.strip()
    if len(cleaned) < min_len:
        return False, "", f"Goal query is too short. Minimum {min_len} characters required."

    if len(cleaned) > max_len:
        return False, "", f"Goal query exceeds maximum length of {max_len} characters."

    # Check for direct prompt injection in user query
    for pattern in SUSPICIOUS_PROMPT_INJECTION_PATTERNS:
        if pattern.search(cleaned):
            # Rather than crashing, sanitize by stripping suspicious commands
            cleaned = pattern.sub("[FILTERED_INSTRUCTION]", cleaned)

    return True, cleaned, ""


def sanitize_untrusted_web_content(content: str, max_chars: int = 1500) -> str:
    """Sanitize retrieved external text so it cannot trigger prompt injection or XSS.

    Treats retrieved web text strictly as passive data.
    """
    if not content or not isinstance(content, str):
        return ""

    text = content.strip()
    if len(text) > max_chars:
        text = text[:max_chars] + "..."

    # Strip HTML script tags or event handlers
    text = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<\s*style[^>]*>.*?<\s*/\s*style\s*>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"on\w+\s*=\s*['\"].*?['\"]", "", text, flags=re.IGNORECASE)

    # Disarm text commands targeting agent instructions
    for pattern in SUSPICIOUS_PROMPT_INJECTION_PATTERNS:
        text = pattern.sub("[UNTRUSTED_CONTENT_FILTERED]", text)

    return text


def redact_secrets(text: str) -> str:
    """Mask any potential API keys or tokens in logs or error traces."""
    if not text or not isinstance(text, str):
        return text

    sanitized = text
    for pattern in SECRET_KEY_PATTERNS:
        sanitized = pattern.sub(r"\1[REDACTED_SECRET]", sanitized)

    return sanitized
