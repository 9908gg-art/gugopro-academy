# Tools Hub Dynamic Counts and Filtering QA

## Scope

This QA covers `tools/index.html`, `tools/tools-hub.js`, and the tools-hub CSS overrides. The live source is `9908gg-art/gugopro-academy`; localized legacy pages under `en/tools/`, `es/tools/`, `ja/tools/`, `ko/tools/`, `vi/tools/`, and `zh-cn/tools/` are separate compact tool workspaces and do not expose the same sidebar/card hub DOM, so the scoped runtime is intentionally limited to the actual Academy hub.

## Static contract

- Cards discovered from `#tool-library-grid [data-tool-card]`: 80.
- Category counts computed from each card's `data-tool-category` tokens:
  - equity: 9
  - us: 8
  - etf: 11
  - fixed: 8
  - funds: 9
  - forex: 8
  - commodities: 6
  - futures: 10
  - options: 9
  - crypto: 7
  - real-estate: 9
  - macro: 8
  - strategy: 13
- Global public-data cards: 14.
- Chapter-tool cards: 49.
- Filters: 14, consisting of `all` plus the 13 category keys.
- Initial source badges use `—`, not fake zeroes; runtime replaces them with counts after scanning actual cards.
- `scripts/verify_tools_hub.py`: PASS.
- `node --check tools/tools-hub.js`: PASS.
- `git diff --check`: PASS.

## Browser interaction smoke test

Local URL: `http://127.0.0.1:8129/tools/index.html?qa=dynamic-counts-r3`

- Initial runtime state: all badge counts match the static card-token calculation; 80 cards are visible; `aria-rowcount="80"`.
- Selecting `strategy`: 13 cards remain visible; every visible card includes the `strategy` token; the selected tab has `is-active` and `aria-selected="true"`.
- Searching `zzzz-no-match`: zero cards remain after the 180 ms transition; the empty-state message is visible and names the query.
- Selecting `all` and clearing search: all 80 cards return and the all tab is active.
- `document.documentElement.scrollWidth > document.documentElement.clientWidth`: false in the desktop smoke test.
- No browser console error was observed during the local interaction test.

## Responsive visual QA

- `/tmp/gugopro-academy-tools-1440x900.png` — 1440×900 desktop screenshot inspected. The sidebar, search row, three-column card grid, count badges, hero total and dark high-contrast styling render without horizontal breakage.
- `/tmp/gugopro-academy-tools-390x844.png` — 390×844 mobile screenshot inspected. The sidebar becomes a full-width two-column category matrix, the search row remains readable, the card list flows to one column, and no horizontal overflow is visible.

## Implementation notes

`tools/tools-hub.js` uses a runtime-only initialization flag so any static `data-tools-hub-ready` attribute cannot short-circuit counting. It recomputes counts from card tokens, disables zero-count filters with `aria-disabled`, preserves active state, updates `aria-rowcount` and `data-visible-count`, and handles `prefers-reduced-motion`. Card hiding is delayed by 180 ms only to allow the opacity/scale exit transition; the final hidden state is `hidden=true`.

## Boundary

The count model is intentionally based on actual DOM cards, not a second hard-coded catalog. If a card is added, removed, or its category token changes, the runtime counts update on the next page load. Localized legacy workspace pages are not silently rewritten into the hub because they use a different DOM and are not the deployment source of `academy.gugopro.com/tools/index.html`.

## Production smoke test

- Commit: `33fa683ae810b527ce857efce8c2e37c15e152c2`.
- GitHub Pages run: [33059813275](https://github.com/9908gg-art/gugopro-academy/actions/runs/33059813275), completed with `success`.
- Cache-busted URL: `https://academy.gugopro.com/tools/index.html?qa=33fa683`.
- Production runtime loaded `tools-hub.js?v=tools-hub-20260827-r3`.
- Production counts matched the card scan: all 80; equity 9; us 8; etf 11; fixed 8; funds 9; forex 8; commodities 6; futures 10; options 9; crypto 7; real-estate 9; macro 8; strategy 13.
- Production interaction passed: selecting strategy left 13 visible cards and every visible card contained the strategy token; searching `zzzz-no-match` left zero visible cards and showed the empty-state message; clearing search and selecting all restored 80 cards.
- Production `document.documentElement.scrollWidth > document.documentElement.clientWidth` was false and no console error was observed during the final interaction smoke test.

## Final production evidence commit

The QA-only follow-up commit is `78521b4ef2aec694cbe697534784db9d274f49d5`. Its GitHub Pages run [33059989724](https://github.com/9908gg-art/gugopro-academy/actions/runs/33059989724) completed with `success`.

Final URL: `https://academy.gugopro.com/tools/index.html?qa=78521b4`

The final production DOM smoke test confirmed 80 cards and the same counts as the code-derived contract: all 80, equity 9, us 8, etf 11, fixed 8, funds 9, forex 8, commodities 6, futures 10, options 9, crypto 7, real-estate 9, macro 8, and strategy 13. It loaded `tools-hub.js?v=tools-hub-20260827-r3` and `style.css?v=tools-hub-20260827-r3`.

Selecting strategy produced 13 visible cards and all visible cards contained the strategy token. Searching `zzzz-no-match` produced zero visible cards and a polite live empty-state. Clearing the search and selecting all restored 80 cards. Production horizontal-overflow check was false and no console error was observed during the final interaction smoke test.
