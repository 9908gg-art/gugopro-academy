# Global symbol catalog

The JSON shards in this directory are a dated metadata snapshot generated from [FinanceDatabase](https://github.com/JerBouma/FinanceDatabase), which is distributed under the MIT License. The complete build includes all available FinanceDatabase exchange files for equities, ETFs and funds, plus the flat indices, money-market, currency and crypto datasets. The Symbol Modal lazy-loads these shards by category and uses a virtualized list, so the full directory can be browsed without creating hundreds of thousands of DOM rows at once.

The current build contains 295,034 source records across six logical groups: 138,710 stocks／ETFs, 57,853 funds, 91,181 indices, 1,367 money-market instruments, 2,556 currency identifiers and 3,367 crypto identifiers. The two UI groups `基金／貨幣市場` and `全球股票／ETF` combine related source shards for easier browsing.

The catalog is **not** a real-time quote feed and does not guarantee that every identifier is supported by Yahoo Finance or Binance. The analyzer keeps the curated, tested analysis universe separate from this discovery catalog, so browsing the list does not trigger historical-price requests for every row. Selected symbols are still validated against the public historical endpoint before quantitative results are shown.

The source names are retained in their original FinanceDatabase language for the long tail of global securities; the interface supplies Traditional-Chinese asset-type and market labels. The manually reviewed popular quick picks retain Traditional-Chinese company and commodity names. This avoids inventing unsupported translations for tens of thousands of official security names.

This snapshot was generated on 2026-08-25 from the FinanceDatabase `main` branch. Because public metadata can change, regenerate and review the shards before treating them as a current security master.
