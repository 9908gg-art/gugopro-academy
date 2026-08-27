#!/usr/bin/env python3
"""Static contract checks for the Finance Academy tools hub."""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import re

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "tools" / "index.html"
JS_PATH = ROOT / "tools" / "tools-hub.js"
CSS_PATH = ROOT / "style.css"
EXPECTED = {
    "equity": 9,
    "us": 8,
    "etf": 11,
    "fixed": 8,
    "funds": 9,
    "forex": 8,
    "commodities": 6,
    "futures": 10,
    "options": 9,
    "crypto": 7,
    "real-estate": 9,
    "macro": 8,
    "strategy": 13,
}

soup = BeautifulSoup(HTML_PATH.read_text(encoding="utf-8"), "html.parser")
grid = soup.select_one("#tool-library-grid")
assert grid is not None, "missing #tool-library-grid"
cards = grid.select("[data-tool-card]")
assert len(cards) == 80, f"expected 80 cards, found {len(cards)}"
assert grid.select_one("#tool-library-empty") is not None, "missing empty state"
assert not grid.get("data-tools-hub-ready"), "static ready flag must not short-circuit initialization"

actual = Counter()
for card in cards:
    categories = (card.get("data-tool-category") or "").split()
    assert categories, f"card without data-tool-category: {card.get('href') or card.get('data-tool-launch')}"
    actual.update(categories)

for key, expected in EXPECTED.items():
    assert actual[key] == expected, f"{key}: expected {expected}, found {actual[key]}"

filters = soup.select("[data-tool-filter]")
assert len(filters) == 14, f"expected all + 13 filters, found {len(filters)}"
filter_keys = {item.get("data-tool-filter") for item in filters}
assert filter_keys == {"all", *EXPECTED}, f"filter keys mismatch: {filter_keys}"
for item in filters:
    badge = item.select_one("[data-filter-count]")
    assert badge is not None, f"missing count badge for {item.get('data-tool-filter')}"
    assert badge.get_text(strip=True) == "—", "initial badge must be neutral until runtime counts cards"

js = JS_PATH.read_text(encoding="utf-8")
for required in (
    "toolsHubInitialized",
    "updateCounts",
    "filter.disabled = isEmpty",
    "data-visible-count",
    "querySelector('span')",
    "prefers-reduced-motion",
):
    assert required in js, f"missing JS contract: {required}"
assert "grid.dataset.toolsHubReady === 'true'" not in js, "old initialization short-circuit remains"
assert re.search(r"FILTER_TRANSITION_MS\s*=\s*180", js), "missing transition bound"

css = CSS_PATH.read_text(encoding="utf-8")
for required in (".tool-hub-card.is-filter-hidden", ".tools-hub-filter.is-empty", "prefers-reduced-motion"):
    assert required in css, f"missing CSS contract: {required}"
assert "tools-hub-20260827-r3" in HTML_PATH.read_text(encoding="utf-8"), "missing cache-busted script/css version"

print(f"PASS tools_hub cards={len(cards)} categories={dict(actual)} filters={len(filters)}")
