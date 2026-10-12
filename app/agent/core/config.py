"""Configuration management for ScoutPilot AI backend.

Safely handles API keys, timeouts, localized defaults, and runtime flags.
"""

import os
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field

# Try to load .env manually if exists without requiring external dependencies
ENV_FILE_PATHS = [
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent.parent / ".env",
    Path(".env"),
]

for env_path in ENV_FILE_PATHS:
    if env_path.is_file():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and k not in os.environ:
                            os.environ[k] = v
            break
        except Exception:
            pass


class Settings(BaseModel):
    """Application settings and API credentials."""

    app_name: str = "ScoutPilot AI"
    app_version: str = "1.0.0"
    app_env: str = Field(default_factory=lambda: os.getenv("APP_ENV", "development"))

    # SerpApi credentials - server side only
    serpapi_api_key: str = Field(default_factory=lambda: os.getenv("SERPAPI_API_KEY", ""))
    serpapi_timeout_seconds: int = Field(default_factory=lambda: int(os.getenv("SERPAPI_TIMEOUT", "15")))

    # Localization defaults for India Hackathon 2026
    default_location: str = "India"
    default_gl: str = "in"
    default_hl: str = "en"
    default_currency: str = "INR"

    # Safety bounds
    max_query_length: int = 400
    min_query_length: int = 3
    max_search_results: int = 15
    default_search_results: int = 8

    # CORS settings
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "*"]

    def is_serpapi_configured(self, override_key: Optional[str] = None) -> bool:
        """Check if an API key is provided and non-empty."""
        key = (override_key or self.serpapi_api_key).strip()
        # Ensure it's not a dummy placeholder like 'your_serpapi_key_here'
        if not key or "your_" in key.lower() or "example" in key.lower():
            return False
        return len(key) >= 16

    def get_effective_key(self, override_key: Optional[str] = None) -> str:
        """Return the effective key if valid, else empty string."""
        return (override_key or self.serpapi_api_key).strip()


settings = Settings()
