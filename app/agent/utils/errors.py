"""Exception types and error handling utilities for ScoutPilot AI."""


class ScoutPilotError(Exception):
    """Base exception for all ScoutPilot AI application errors."""
    def __init__(self, message: str, status_code: int = 400, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class MissingApiKeyError(ScoutPilotError):
    """Raised when SerpApi API key is absent and preview/demo mode was not requested."""
    def __init__(self, message: str = "SERPAPI_API_KEY is not configured on the server."):
        super().__init__(
            message=message,
            status_code=401,
            details={
                "code": "MISSING_SERPAPI_KEY",
                "resolution": "Set SERPAPI_API_KEY in your .env file, or check 'Preview Mode' in the web interface."
            }
        )


class SearchToolError(ScoutPilotError):
    """Raised when an external SerpApi query fails or times out."""
    def __init__(self, message: str, engine: str = "", query: str = ""):
        super().__init__(
            message=message,
            status_code=502,
            details={"engine": engine, "query": query, "code": "SEARCH_ENGINE_ERROR"}
        )


class ConstraintEvaluationError(ScoutPilotError):
    """Raised when comparison criteria cannot be evaluated against retrieved data."""
    def __init__(self, message: str):
        super().__init__(message=message, status_code=422)
