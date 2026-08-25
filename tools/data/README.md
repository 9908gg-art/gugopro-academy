# Global symbol catalog

The three JSON shards in this directory are a dated, filtered metadata snapshot generated from [FinanceDatabase](https://github.com/jerbouma/FinanceDatabase), which is distributed under the MIT License. The snapshot covers representative equities and ETFs across major exchanges, plus currency and crypto identifiers. They are retained as an attributable discovery dataset for future search/index builds; the current Symbol Modal intentionally uses a smaller, manually reviewed Traditional-Chinese quick-pick catalog so that the picker opens immediately without downloading a large directory.

The catalog is **not** a real-time quote feed and does not guarantee that every identifier is supported by Yahoo Finance or Binance. The analyzer keeps the curated, tested universe and the Traditional-Chinese quick-pick catalog separate from this discovery dataset, so opening the picker cannot trigger thousands of historical-price requests. Selected symbols are still validated against the public historical endpoint before quantitative results are shown.

This snapshot was generated on 2026-08-25 from the FinanceDatabase `main` branch. Because public metadata can change, regenerate and review the shards before treating them as a current security master.
