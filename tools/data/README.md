# Global symbol catalog

The three JSON shards in this directory are a dated, filtered metadata snapshot generated from [FinanceDatabase](https://github.com/JerBouma/FinanceDatabase), which is distributed under the MIT License. The snapshot covers equities and ETFs across selected major exchanges, plus currency and crypto identifiers. The Symbol Modal lazy-loads these shards by category and merges them with a smaller, manually reviewed Traditional-Chinese quick-pick catalog so common products remain immediately usable while the full directory is loaded progressively.

The catalog is **not** a real-time quote feed and does not guarantee that every identifier is supported by Yahoo Finance or Binance. The analyzer keeps the curated, tested analysis universe separate from this discovery catalog, so opening the picker does not trigger historical-price requests for every row. The list is virtualized for mobile, and selected symbols are still validated against the public historical endpoint before quantitative results are shown.

This snapshot was generated on 2026-08-25 from the FinanceDatabase `main` branch. Because public metadata can change, regenerate and review the shards before treating them as a current security master.
