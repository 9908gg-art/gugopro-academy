# Global symbol catalog

The three JSON shards in this directory are a dated, filtered metadata snapshot generated from [FinanceDatabase](https://github.com/jerbouma/FinanceDatabase), which is distributed under the MIT License. The snapshot covers representative equities and ETFs across major exchanges, plus currency and crypto identifiers. It is used only for symbol discovery in the correlation analyzer and is lazy-loaded by category.

The catalog is **not** a real-time quote feed and does not guarantee that every identifier is supported by Yahoo Finance or Binance. The analyzer keeps the curated, tested universe separate from this discovery catalog so opening the symbol search cannot trigger thousands of historical-price requests. Selected symbols are still validated against the public historical endpoint before quantitative results are shown.

This snapshot was generated on 2026-08-25 from the FinanceDatabase `main` branch. Because public metadata can change, regenerate and review the shards before treating them as a current security master.
