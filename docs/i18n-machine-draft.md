# 8-language i18n machine-draft implementation

本次以 `zh-TW` 作為唯一 HTML／CSS／DOM 母版，加入 `zh-CN`、`en`、`ja`、`de`、`fr`、`es`、`pt` 共八個 locale 的 client-side runtime。每個目標頁仍只有一份 HTML；切換器使用 `?lang=` 與 `localStorage`，不複製或分岔語系頁面。

## Coverage

| Item | Result |
|---|---:|
| Single-template target pages | 99 (`index.html`, `guides/`, `tools/`, `quant/`) |
| Catalog strings | 4,150 |
| Locale resource files | 8 |
| Key parity | 4,150 / 4,150 for every locale |
| Runtime and hreflang injection | 99 / 99 pages |
| Translation status | `machine-draft`; native-finance review required |

The runtime translates static text, selected attributes, dynamically inserted DOM text, SVG text, and Canvas `fillText`／`strokeText` calls when a matching catalog phrase is available. It does not add market-data requests, trading signals, account actions, or server-side collection to any calculator.

## Draft generation and safety

`zh-CN` uses deterministic Traditional-to-Simplified conversion plus the protected finance glossary. English uses the locally installed Argos zh→en model where the string is not code-like. Japanese, German, French, Spanish and Portuguese use existing shared translations when available and glossary-based low-fidelity drafts otherwise. Source fallback is explicit in the resource metadata; it is not concealed as human localization.

The glossary and repair verifier protect `${...}` expressions, URLs, HTML／SVG fragments, backticks, JSON／JS／DOM／API tokens, tickers, and finance terms including `Futures`, `Arbitrage`, `Beta`, `Z-Score`, `Grid Trading`, `ETF`, `DCF`, `MACD`, `RSI`, `KDJ`, `ATR`, `R:R`, `Pip`, `Swap`, `Forward`, and `NDF`. Automated checks report zero missing keys, zero null values, zero residual model sentinels, and zero required-token losses.

> `machine-draft` is an engineering bridge, not a publication-quality translation certificate. Native-finance review is required before advertising the pages as professionally localized, especially for risk disclosures, tax language, regulatory references, derivatives terminology and calculator validation messages.

## Verification commands

```bash
python3 scripts/verify_i18n.py --repo . --mode academy
python3 scripts/verify_machine_draft.py --repo .
node --check i18n/gugopro-i18n.js
python3 scripts/verify_tools_hub.py
```
