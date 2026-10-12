"""Unit tests for SerpApi result normalization, spec extraction, and deduplication."""

import pytest
from agent.search.normalizer import (
    clean_url, parse_price, extract_attributes, normalize_serpapi_items
)


def test_clean_url_strips_tracking_params():
    url = "https://www.flipkart.com/laptop?utm_source=google&utm_medium=cpc&id=123"
    canonical, domain = clean_url(url)

    assert "utm_source" not in canonical
    assert "utm_medium" not in canonical
    assert "id=123" in canonical
    assert domain == "flipkart.com"


def test_parse_price_indian_rupees():
    # Various Indian rupee formats
    raw, val, curr = parse_price("₹64,990")
    assert val == 64990.0
    assert curr == "INR"
    assert raw == "₹64,990"

    raw, val, curr = parse_price("Rs. 1,20,000")
    assert val == 120000.0
    assert curr == "INR"

    raw, val, curr = parse_price(None, "Special festive discount price is INR 58,499 today!")
    assert val == 58499.0
    assert curr == "INR"


def test_parse_price_usd():
    raw, val, curr = parse_price("$1,199.99")
    assert val == 1199.99
    assert curr == "USD"


def test_extract_attributes():
    title = "ASUS Vivobook 16 with Intel Core i5-13420H, 16GB RAM, 512GB SSD"
    snippet = "Features a vibrant 16-inch FHD display and fast charging."

    specs = extract_attributes(title, snippet)
    assert "processor" in specs
    assert "13420h" in specs["processor"].lower()
    assert "ram" in specs
    assert "16" in specs["ram"]
    assert "storage" in specs
    assert "512" in specs["storage"]
    assert "display" in specs


def test_normalize_and_deduplicate_items():
    raw_data = [
        {
            "title": "ASUS Vivobook 16 (Intel Core i5-13420H, 16GB RAM)",
            "link": "https://flipkart.com/item1?utm_campaign=ads",
            "price": "₹64,990",
            "snippet": "16GB RAM and 512GB SSD"
        },
        # Duplicate URL (different tracking param)
        {
            "title": "ASUS Vivobook 16 (Intel Core i5-13420H, 16GB RAM)",
            "link": "https://flipkart.com/item1?utm_campaign=different_tag",
            "price": "₹64,990",
            "snippet": "16GB RAM and 512GB SSD"
        },
        # Item with missing price and specs (tests honest missing field handling)
        {
            "title": "Generic Laptop Carrying Case Sleeve",
            "link": "https://amazon.in/sleeve1",
            "snippet": "Neoprene case for 15 inch laptops"
        }
    ]

    items = normalize_serpapi_items(raw_data, ["processor", "ram", "storage"])

    # Duplicate should have been stripped
    assert len(items) == 2

    # Check first item
    first = items[0]
    assert first.price_value == 64990.0
    assert "price" in first.supported_fields
    assert "processor" in first.supported_fields

    # Check second item has missing fields properly declared rather than fabricated
    second = items[1]
    assert second.price_value is None
    assert "price" in second.missing_fields
    assert "processor" in second.missing_fields
