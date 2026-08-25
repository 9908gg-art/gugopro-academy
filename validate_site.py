from pathlib import Path
from html.parser import HTMLParser
import re
from urllib.parse import urlparse
from chapter_tool_specs import TOOLS

ROOT = Path(__file__).parent

class Validator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.hrefs = []
        self.tags = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        self.tags.append(tag)
        if 'id' in data: self.ids.append(data['id'])
        if tag == 'a' and 'href' in data: self.hrefs.append(data['href'])

errors = []
expected_symbols = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','DOGEUSDT','XRPUSDT','NQ','ES','GOLD','OIL','NVDA','TSLA','AAPL','MSFT','AMZN']
expected_groups = ['加密貨幣 · Crypto Assets', '全球指數與期貨 · Futures &amp; Indices', '美股科技權值 · US Mega Tech']
def validate_market_picker(text, page_name, search_id, suggestions_id, watchlist_id):
    if text.count('<optgroup') != 4: errors.append(f'{page_name} must contain exactly 4 optgroups including custom watchlist')
    for group in expected_groups:
        if f'<optgroup label="{group}">' not in text: errors.append(f'{page_name} missing optgroup {group}')
    if f'<optgroup id="{watchlist_id}" label="⭐ 我的自訂清單"' not in text: errors.append(f'{page_name} missing custom watchlist optgroup {watchlist_id}')
    for symbol in expected_symbols:
        if f'value="{symbol}"' not in text: errors.append(f'{page_name} missing symbol option {symbol}')
    for removed in ['0050.TW','0056.TW','00878.TW','00919.TW','00929.TW','2330.TW','2317.TW','2454.TW','台股與台股 ETF']:
        if removed in text: errors.append(f'{page_name} still contains removed Taiwan default marker {removed}')
    for marker in [f'id="{search_id}"', f'id="{suggestions_id}"', 'aria-autocomplete="list"', 'aria-controls="'+suggestions_id+'"']:
        if marker not in text: errors.append(f'{page_name} missing autocomplete marker {marker}')
root = ROOT / 'index.html'
root_text = root.read_text(encoding='utf-8')
for anchor in ['knowledge-tree', 'tool-deck', 'reading-room', 'support']:
    if f'id="{anchor}"' not in root_text: errors.append(f'root missing #{anchor}')
for href in ['tools/risk-reward-calculator.html', 'tools/etf-dividend-calculator.html', 'tools/grid-trading-calculator.html']:
    if href not in root_text: errors.append(f'root missing tool link {href}')
for root_marker in ['content-architecture-20260825', 'role="tab"', 'aria-selected="true"', 'aria-selected="false"', 'data-category="strategy"', 'guides/trading-strategy.html', '13 個核心分類', 'class="knowledge-card', 'class="text-link"']:
    if root_marker not in root_text: errors.append(f'root missing knowledge-tree marker {root_marker}')
expected_primary_order = ['guides/taiwan-stocks.html','guides/us-stocks.html','guides/etf.html','guides/bonds.html','guides/funds.html','guides/forex.html','guides/commodities.html','guides/futures.html','guides/options.html','guides/crypto.html','guides/real-estate.html','guides/macro-economics.html','guides/trading-strategy.html']
root_positions = [root_text.find(href) for href in expected_primary_order]
if any(position < 0 for position in root_positions): errors.append('root missing one or more primary guide links')
elif root_positions != sorted(root_positions): errors.append('root primary guide links are out of taxonomy order')

expected_guides = ['taiwan-stocks','us-stocks','etf','bonds','funds','forex','commodities','futures','options','crypto','real-estate','macro-economics','trading-strategy','risk-reward-ratio','grid-trading','etf-dividend-drip']
actual_guides = [path.stem for path in sorted((ROOT / 'guides').glob('*.html'))]
if len(actual_guides) != len(expected_guides) or set(actual_guides) != set(expected_guides):
    errors.append(f'guide set mismatch: expected {len(expected_guides)} exact pages, found {len(actual_guides)}')
for slug in expected_guides:
    if not (ROOT / 'guides' / f'{slug}.html').exists(): errors.append(f'missing guide {slug}')
for guide_path in sorted((ROOT / 'guides').glob('*.html')):
    guide_text = guide_path.read_text(encoding='utf-8')
    for guide_marker in ['/style.css?v=longform-encyclopedia-scrollspy-20260825', '/app.js?v=longform-encyclopedia-scrollspy-20260825']:
        if guide_marker not in guide_text: errors.append(f'{guide_path.relative_to(ROOT)} missing longform encyclopedia asset marker {guide_marker}')
    module_count = guide_text.count('class="guide-module"')
    diagram_count = guide_text.count('class="guide-diagram"')
    h3_count = guide_text.count('<h3')
    paragraph_count = guide_text.count('<p')
    if module_count < 4: errors.append(f'{guide_path.relative_to(ROOT)} has fewer than 4 deep chapters: {module_count}')
    if diagram_count < module_count: errors.append(f'{guide_path.relative_to(ROOT)} concept diagram count {diagram_count} is below chapter count {module_count}')
    if h3_count < 12: errors.append(f'{guide_path.relative_to(ROOT)} has insufficient defined subtopics: {h3_count} h3')
    if paragraph_count < 20: errors.append(f'{guide_path.relative_to(ROOT)} has insufficient long-form prose: {paragraph_count} paragraphs')
    if guide_text.count('class="guide-inline-cta"') < module_count: errors.append(f'{guide_path.relative_to(ROOT)} has fewer inline tool CTAs than chapters')
    for guide_marker in ['guide-longform', 'class="guide-chapter-nav"', 'class="guide-diagram"', 'class="guide-prose"', 'class="guide-inline-cta"', 'PRACTICE DESK / APPLY THE FRAMEWORK']:
        if guide_marker not in guide_text: errors.append(f'{guide_path.relative_to(ROOT)} missing architecture marker {guide_marker}')
    for forbidden_guide_marker in ['VISUAL MAP', 'class="guide-figure"', 'MODULE 01 /', '資料 → 判斷 → 執行']:
        if forbidden_guide_marker in guide_text: errors.append(f'{guide_path.relative_to(ROOT)} still contains obsolete generic visual marker {forbidden_guide_marker}')
taiwan_text = (ROOT / 'guides' / 'taiwan-stocks.html').read_text(encoding='utf-8')
for marker in ['guide-longform', 'guide-diagram', 'guide-prose', 'guide-chapter-nav', 'id="chips-analysis"', 'id="technical-analysis"', 'id="fundamentals-analysis"', 'id="trading-rules"', '券資比', 'MA_n', 'MoM', 'T+2', 'TWSE 集中市場交易制度', 'TDCC 集保戶股權分散表']:
    if marker not in taiwan_text: errors.append(f'taiwan-stocks.html missing content marker {marker}')
strategy_text = (ROOT / 'guides' / 'trading-strategy.html').read_text(encoding='utf-8')
for marker in ['guide-longform', 'guide-diagram', 'guide-prose', 'id="technical-system"', 'id="risk-expectancy"', 'id="pair-trading"', 'id="grid-mechanics"', 'id="position-sizing"', '價格行為', '風險報酬比', '配對交易', '動態網格', '資金與部位管理']:
    if marker not in strategy_text: errors.append(f'trading-strategy.html missing content marker {marker}')
if strategy_text.count('class="guide-module"') != 5: errors.append('trading-strategy.html must contain exactly 5 chapters')
if strategy_text.count('<h3') < 15: errors.append('trading-strategy.html must contain detailed subtopics')
for strategy_tool in ['../tools/risk-reward-calculator.html','../tools/grid-trading-calculator.html','../tools/index.html#risk-panel']:
    if strategy_tool not in strategy_text: errors.append(f'trading-strategy.html missing direct tool link {strategy_tool}')
etf_guide_text = (ROOT / 'guides' / 'etf.html').read_text(encoding='utf-8')
if '../tools/etf-dividend-calculator.html' not in etf_guide_text: errors.append('etf.html missing direct DRIP tool link')
if not (ROOT / 'build_guides.py').exists(): errors.append('missing build_guides.py generator')

required_files = [
    'privacy.html', 'terms.html', 'about.html',
    'tools/risk-reward-calculator.html', 'tools/risk-reward-calculator.js',
    'tools/etf-dividend-calculator.html', 'tools/etf-dividend-calculator.js',
    'tools/grid-trading-calculator.html', 'tools/grid-trading-calculator.js', 'tools/watchlist.js',
    'tools/tw-institutional-tracker.html', 'tools/tw-institutional-tracker.js',
    'tools/tw-ma-deduction-calculator.html', 'tools/tw-ma-deduction-calculator.js',
    'tools/tw-stock-valuation.html', 'tools/tw-stock-valuation.js',
    'tools/tw-day-trading-fee-calc.html', 'tools/tw-day-trading-fee-calc.js', 'tools/tw-market-data.js', 'tools/tools-hub.js',
    'tools/global-market-data.js', 'tools/global-tools-runtime.js', 'tools/global-tools.css',
    'tools/us-earnings-tracker.html', 'tools/us-sec-insider-flow.html', 'tools/etf-nav-premium-tracker.html', 'tools/etf-drip-backtester.html',
    'tools/bond-yield-curve-tracker.html', 'tools/fund-sharpe-drawdown-analyzer.html', 'tools/forex-interest-carry-calc.html', 'tools/commodity-gold-oil-ratio.html',
    'tools/futures-basis-term-structure.html', 'tools/options-implied-volatility-rank.html', 'tools/crypto-funding-rate-liquidations.html',
    'tools/real-estate-roi-cap-rate.html', 'tools/macro-liquidity-cpi-tracker.html', 'tools/trade-risk-kelly-criterion.html',
    'chapter_tool_specs.py', 'build_chapter_tools.py', 'patch_chapter_guide_links.py',
    'tools/chapter-tools.css', 'tools/chapter-tools-runtime.js'
]
required_files.extend(f'tools/{tool["file"]}' for tool in TOOLS)
for required in required_files:
    if not (ROOT / required).exists(): errors.append(f'missing required file {required}')

pages = [
    root, ROOT / 'tools/index.html', ROOT / 'tools/risk-reward-calculator.html',
    ROOT / 'tools/etf-dividend-calculator.html', ROOT / 'tools/compound-interest.html', ROOT / 'tools/grid-trading-calculator.html',
    ROOT / 'tools/tw-institutional-tracker.html', ROOT / 'tools/tw-ma-deduction-calculator.html', ROOT / 'tools/tw-stock-valuation.html', ROOT / 'tools/tw-day-trading-fee-calc.html',
    *sorted((ROOT / 'tools').glob('*.html')),
    ROOT / 'privacy.html', ROOT / 'terms.html', ROOT / 'about.html',
    *sorted((ROOT / 'guides').glob('*.html'))
]
for page in pages:
    parser = Validator(); text = page.read_text(encoding='utf-8'); parser.feed(text)
    duplicates = sorted({x for x in parser.ids if parser.ids.count(x) > 1})
    if duplicates: errors.append(f'{page.relative_to(ROOT)} duplicate ids: {duplicates}')
    for href in parser.hrefs:
        parsed = urlparse(href)
        if parsed.scheme or href.startswith('#') or href.startswith('mailto:') or not parsed.path: continue
        target = (ROOT / parsed.path.lstrip('/')).resolve() if parsed.path.startswith('/') else (page.parent / parsed.path).resolve()
        if not target.exists(): errors.append(f'{page.relative_to(ROOT)} broken link: {href}')
    if page.name in {'privacy.html', 'terms.html', 'about.html'}:
        if '<footer' not in text or 'href="index.html"' not in text: errors.append(f'{page.name} missing global footer')
    if page.name in {'risk-reward-calculator.html', 'etf-dividend-calculator.html', 'grid-trading-calculator.html'}:
        for required_marker in ['tradingview.com/?aff_id=168714', 'amazon.com/?tag=9908qq-20', 'data-kofi-link', '/privacy.html', '/terms.html', '/about.html']:
            if required_marker not in text: errors.append(f'{page.name} missing {required_marker}')
    if page.name in {'tw-institutional-tracker.html', 'tw-ma-deduction-calculator.html', 'tw-stock-valuation.html', 'tw-day-trading-fee-calc.html'}:
        for required_marker in ['tw-tool-page', 'tw-guide-return', '../guides/taiwan-stocks.html#', 'tradingview.com/?aff_id=168714', 'amazon.com/?tag=9908qq-20', 'data-kofi-link', '/privacy.html', '/terms.html', '/about.html']:
            if required_marker not in text: errors.append(f'{page.name} missing {required_marker}')

workbench_text = (ROOT / 'tools/index.html').read_text(encoding='utf-8')
for panel in ['compound-panel','etf-panel','bond-panel','curve-panel','risk-panel','valuation-panel','retirement-panel','allocation-panel','mc-panel']:
    if f'id="{panel}"' not in workbench_text: errors.append(f'workbench missing {panel}')
for calc in ['compound','etf-fee','duration','curve','risk','dcf','retirement','allocation','monte-carlo']:
    if f'data-calc="{calc}"' not in workbench_text: errors.append(f'workbench missing calc {calc}')
for link in ['risk-reward-calculator.html', 'etf-dividend-calculator.html', 'grid-trading-calculator.html', 'tw-institutional-tracker.html', 'tw-ma-deduction-calculator.html', 'tw-stock-valuation.html', 'tw-day-trading-fee-calc.html']:
    if link not in workbench_text: errors.append(f'workbench missing link {link}')
for hub_marker in ['tools-hub-layout', 'tools-hub-sidebar', 'tools-hub-filters', 'tool-library-search', 'tool-library-grid', 'data-tool-filter', 'data-tool-card', 'tools-hub.js', '全市場工具', '01 · 台股／股票']:
    if hub_marker not in workbench_text: errors.append(f'workbench missing Tools Hub marker {hub_marker}')
if workbench_text.count('data-tool-filter=') != 14: errors.append('workbench must contain 14 tool hub filter buttons')
expected_tool_cards = 31 + len(TOOLS)
if workbench_text.count('data-tool-card') != expected_tool_cards: errors.append(f'workbench must contain exactly {expected_tool_cards} tool cards')
if workbench_text.count('data-global-tool-card') != 14: errors.append('workbench must contain exactly 14 global public-data cards')
if workbench_text.count('data-chapter-tool-card') != len(TOOLS): errors.append(f'workbench must contain exactly {len(TOOLS)} chapter tool cards')
for hero_marker in ['id="tool-library-total"', 'id="tool-library-category-count"', 'id="tool-library-public-count"', 'id="tool-library-chapter-count"']:
    if hero_marker not in workbench_text: errors.append(f'workbench hero missing dynamic marker {hero_marker}')
for tool in TOOLS:
    if f'href="{tool["file"]}"' not in workbench_text: errors.append(f'Hub missing chapter tool href {tool["file"]}')
    if f'<strong>{tool["title"]}</strong>' not in workbench_text: errors.append(f'Hub missing chapter tool title {tool["file"]}')
global_card_contracts = [
    ('us-earnings-tracker.html', '財報與估值', 'fa-file-invoice-dollar', '美股財報成長與 EPS 驚喜分析儀'),
    ('us-sec-insider-flow.html', 'SEC 申報', 'fa-user-shield', '美股內部人持股與 SEC 申報流向儀'),
    ('etf-nav-premium-tracker.html', '淨值與費用', 'fa-layer-group', 'ETF 淨值折溢價與費用率分析儀'),
    ('etf-drip-backtester.html', '股息回測', 'fa-coins', 'ETF 股息再投入 DRIP 回測儀'),
    ('bond-yield-curve-tracker.html', '殖利率曲線', 'fa-chart-area', '美國公債殖利率曲線與倒掛預警儀'),
    ('fund-sharpe-drawdown-analyzer.html', 'Sharpe／MDD', 'fa-chart-line', '基金與投資組合 Sharpe、Sortino、MDD 分析儀'),
    ('forex-interest-carry-calc.html', 'Carry／Swap', 'fa-money-bill-transfer', '主要貨幣對利差交易與匯率波動儀'),
    ('commodity-gold-oil-ratio.html', '金銀比／金油比', 'fa-gem', '金銀比、金油比與通膨週期監控儀'),
    ('futures-basis-term-structure.html', 'Basis／轉倉', 'fa-arrows-left-right-to-line', '期現貨實質價差與期限結構儀'),
    ('options-implied-volatility-rank.html', 'IV Rank／PCR', 'fa-wave-square', '隱含波動率 IV Rank 與 Put／Call Ratio 儀'),
    ('crypto-funding-rate-liquidations.html', 'Funding／清算', 'fa-bitcoin', '永續合約資金費率與多空清算儀'),
    ('real-estate-roi-cap-rate.html', 'Cap Rate／房貸', 'fa-house', '不動產 Cap Rate 與房貸壓力測試儀'),
    ('macro-liquidity-cpi-tracker.html', 'M2／CPI／流動性', 'fa-earth-americas', '全球流動性、M2 與 CPI 通膨指標儀'),
    ('trade-risk-kelly-criterion.html', 'Kelly／R:R', 'fa-shield-halved', 'Kelly 部位管理、R:R 與破產機率儀'),
]
for href, kicker, icon, title in global_card_contracts:
    pattern = rf'<a class="tool-hub-card" href="{re.escape(href)}"[^>]*data-global-tool-card[^>]*>.*?<i class="fa-solid {re.escape(icon)}"[^>]*>.*?<span class="tool-hub-card-kicker">{re.escape(kicker)}</span>.*?<strong>{re.escape(title)}</strong>'
    if not re.search(pattern, workbench_text, re.S): errors.append(f'global Hub card metadata mismatch: {href}')
compact_pages = {
    'tools/index.html': ['tools-library-page', 'single-screen-tools-20260825'],
    'tools/compound-interest.html': ['compact-calculator-page', 'single-screen-tools-20260825'],
    'tools/etf-dividend-calculator.html': ['compact-tool-page', 'single-screen-tools-20260825'],
}
for relative, markers in compact_pages.items():
    text = (ROOT / relative).read_text(encoding='utf-8')
    for marker in markers:
        if marker not in text: errors.append(f'{relative} missing compact marker {marker}')
for guide_slug, tool_href in [('risk-reward-ratio','../tools/risk-reward-calculator.html'), ('grid-trading','../tools/grid-trading-calculator.html'), ('etf-dividend-drip','../tools/etf-dividend-calculator.html')]:
    guide_text = (ROOT / 'guides' / f'{guide_slug}.html').read_text(encoding='utf-8')
    if tool_href not in guide_text: errors.append(f'{guide_slug} missing primary tool link')
    for tool_href_all in ['../tools/risk-reward-calculator.html','../tools/etf-dividend-calculator.html','../tools/grid-trading-calculator.html']:
        if tool_href_all not in guide_text: errors.append(f'{guide_slug} missing cross-tool link {tool_href_all}')
for tool_page, guide_href in [('risk-reward-calculator.html','../guides/risk-reward-ratio.html'), ('etf-dividend-calculator.html','../guides/etf-dividend-drip.html'), ('grid-trading-calculator.html','../guides/grid-trading.html')]:
    tool_text = (ROOT / 'tools' / tool_page).read_text(encoding='utf-8')
    if guide_href not in tool_text: errors.append(f'{tool_page} missing guide link {guide_href}')
for tool_page, guide_href, markers, forbidden_markers in [
    ('tw-institutional-tracker.html', '../guides/taiwan-stocks.html#chips-analysis', ['tw-inst-load', 'tw-inst-symbol-select', 'tw-inst-lookback', 'tw-inst-chart', 'tw-inst-status', 'tw-inst-result', 'tw-inst-source', 'tw-market-data.js', 'chart.umd.min.js', 'REAL PUBLIC DATA', 'METHOD / FIELD GUIDE'], ['INPUT / SCENARIO', '教育用情境', '情境名稱', 'tw-inst-foreign', 'tw-inst-margin']),
    ('tw-ma-deduction-calculator.html', '../guides/taiwan-stocks.html#technical-analysis', ['tw-ma-load', 'tw-ma-symbol-select', 'tw-ma-horizon', 'tw-ma-chart', 'tw-ma-indicator-chart', 'tw-ma-status', 'tw-ma-result', 'tw-ma-source', 'tw-market-data.js', 'chart.umd.min.js', 'REAL PUBLIC DATA', 'METHOD / FIELD GUIDE'], ['INPUT / SCENARIO', '教育用情境', '情境名稱', 'tw-ma-prices']),
    ('tw-stock-valuation.html', '../guides/taiwan-stocks.html#fundamentals-analysis', ['tw-val-load', 'tw-val-symbol-select', 'tw-val-chart', 'tw-val-dividend-chart', 'tw-val-status', 'tw-val-result', 'tw-val-source', 'tw-market-data.js', 'chart.umd.min.js', 'REAL PUBLIC DATA', 'METHOD / FIELD GUIDE'], ['INPUT / SCENARIO', '教育用情境', '情境名稱', 'tw-val-eps', 'tw-val-pe-low', 'tw-val-growth', 'tw-val-dividends']),
    ('tw-day-trading-fee-calc.html', '../guides/taiwan-stocks.html#trading-rules', ['tw-fee-load', 'tw-fee-symbol-select', 'tw-fee-mode', 'tw-fee-discount', 'tw-fee-chart', 'tw-fee-status', 'tw-fee-result', 'tw-market-data.js', 'chart.umd.min.js', 'REAL PUBLIC DATA', 'METHOD / FIELD GUIDE'], ['INPUT / SCENARIO', '教育用情境', '情境名稱']),
]:
    tool_text = (ROOT / 'tools' / tool_page).read_text(encoding='utf-8')
    if guide_href not in tool_text: errors.append(f'{tool_page} missing guide backlink {guide_href}')
    for marker in markers:
        if marker not in tool_text: errors.append(f'{tool_page} missing tool marker {marker}')
    for forbidden_marker in forbidden_markers:
        if forbidden_marker in tool_text: errors.append(f'{tool_page} still contains obsolete manual/fake-data marker {forbidden_marker}')
for chapter, tool_href in [('chips-analysis', '../tools/tw-institutional-tracker.html'), ('technical-analysis', '../tools/tw-ma-deduction-calculator.html'), ('fundamentals-analysis', '../tools/tw-stock-valuation.html'), ('trading-rules', '../tools/tw-day-trading-fee-calc.html')]:
    if tool_href not in taiwan_text: errors.append(f'taiwan-stocks.html missing chapter tool link {tool_href}')
if not (ROOT / 'tools' / 'tw-market-data.js').exists(): errors.append('missing shared Taiwan real-data module')
for script_name, script_markers in {
    'tw-institutional-tracker.js': ['TWMarketData', 'priceHistory', 'institutional', 'margin', 'drawInstitutionalChart', 'FinMind'],
    'tw-ma-deduction-calculator.js': ['TWMarketData', 'priceHistory', 'drawTechnicalChart', 'RSI', 'MACD'],
    'tw-stock-valuation.js': ['TWMarketData', 'priceHistory', 'per', 'dividend', 'financial', 'drawValuationChart', 'fillDays'],
    'tw-day-trading-fee-calc.js': ['TWMarketData', 'priceHistory', 'drawCostChart', 'Math.max(20', 'taxRate', "mode === 'etf'"]
}.items():
    script_text = (ROOT / 'tools' / script_name).read_text(encoding='utf-8')
    for marker in script_markers:
        if marker not in script_text: errors.append(f'{script_name} missing real-data marker {marker}')
global_tools = {
    'us-earnings-tracker.html': '../guides/us-stocks.html#us-stocks-metrics',
    'us-sec-insider-flow.html': '../guides/us-stocks.html#us-stocks-practice',
    'etf-nav-premium-tracker.html': '../guides/etf.html#etf-metrics',
    'etf-drip-backtester.html': '../guides/etf-dividend-drip.html#drip-practice',
    'bond-yield-curve-tracker.html': '../guides/bonds.html#bonds-metrics',
    'fund-sharpe-drawdown-analyzer.html': '../guides/funds.html#funds-metrics',
    'forex-interest-carry-calc.html': '../guides/forex.html#forex-carry',
    'commodity-gold-oil-ratio.html': '../guides/commodities.html#commodities-metrics',
    'futures-basis-term-structure.html': '../guides/futures.html#futures-metrics',
    'options-implied-volatility-rank.html': '../guides/options.html#options-metrics',
    'crypto-funding-rate-liquidations.html': '../guides/crypto.html#crypto-metrics',
    'real-estate-roi-cap-rate.html': '../guides/real-estate.html#real-estate-metrics',
    'macro-liquidity-cpi-tracker.html': '../guides/macro-economics.html#macro-economics-metrics',
    'trade-risk-kelly-criterion.html': '../guides/trading-strategy.html#position-sizing'
}
for tool_page, guide_href in global_tools.items():
    tool_text = (ROOT / 'tools' / tool_page).read_text(encoding='utf-8')
    for marker in ['global-tool-page', 'real-data-tool-page', 'global-market-data.js', 'global-tools-runtime.js', 'global-tools.css', 'chart.umd.min.js', 'REAL PUBLIC DATA', 'METHOD / FIELD GUIDE', 'global-status', 'global-retry', 'global-source', 'global-result', 'global-bottom-guide', 'data-global-tool=']:
        if marker not in tool_text: errors.append(f'{tool_page} missing global real-data marker {marker}')
    if guide_href not in tool_text: errors.append(f'{tool_page} missing guide backlink {guide_href}')
    if 'INPUT / SCENARIO' in tool_text or '教育用情境' in tool_text or '假資料' in tool_text: errors.append(f'{tool_page} still contains obsolete fake scenario marker')
for guide_file, tool_hrefs in {
    'us-stocks.html': ['../tools/us-earnings-tracker.html', '../tools/us-sec-insider-flow.html'],
    'etf.html': ['../tools/etf-nav-premium-tracker.html', '../tools/etf-drip-backtester.html'],
    'etf-dividend-drip.html': ['../tools/etf-drip-backtester.html'],
    'bonds.html': ['../tools/bond-yield-curve-tracker.html'],
    'funds.html': ['../tools/fund-sharpe-drawdown-analyzer.html'],
    'forex.html': ['../tools/forex-interest-carry-calc.html'],
    'commodities.html': ['../tools/commodity-gold-oil-ratio.html'],
    'futures.html': ['../tools/futures-basis-term-structure.html'],
    'options.html': ['../tools/options-implied-volatility-rank.html'],
    'crypto.html': ['../tools/crypto-funding-rate-liquidations.html'],
    'real-estate.html': ['../tools/real-estate-roi-cap-rate.html'],
    'macro-economics.html': ['../tools/macro-liquidity-cpi-tracker.html'],
    'trading-strategy.html': ['../tools/trade-risk-kelly-criterion.html']
}.items():
    guide_text = (ROOT / 'guides' / guide_file).read_text(encoding='utf-8')
    for tool_href in tool_hrefs:
        if tool_href not in guide_text: errors.append(f'{guide_file} missing global tool link {tool_href}')
    if guide_text.count('data-global-inline-tool') < len(tool_hrefs): errors.append(f'{guide_file} missing global inline tool marker')
    if guide_text.count('data-global-tool-cta') < len(tool_hrefs): errors.append(f'{guide_file} missing global chapter CTA marker')
chapter_tools_by_guide = {}
for tool in TOOLS:
    chapter_tools_by_guide.setdefault(tool['guide'], []).append(tool)
for guide_file, tool_specs in chapter_tools_by_guide.items():
    guide_text = (ROOT / 'guides' / guide_file).read_text(encoding='utf-8')
    for tool in tool_specs:
        href = f'../tools/{tool["file"]}'
        if href not in guide_text: errors.append(f'{guide_file} missing chapter tool link {href}')
    if guide_text.count('data-chapter-inline-tool') < len(tool_specs): errors.append(f'{guide_file} missing chapter inline tool markers')
    if guide_text.count('data-chapter-tool-cta') < len(tool_specs): errors.append(f'{guide_file} missing chapter tool CTA markers')
for tool in TOOLS:
    tool_path = ROOT / 'tools' / tool['file']
    if not tool_path.exists(): continue
    tool_text = tool_path.read_text(encoding='utf-8')
    guide_href = f'../guides/{tool["guide"]}#{tool["chapter"]}'
    for marker in ['chapter-tool-page', 'real-data-tool-page', 'chapter-tools.css', 'chapter-tools-runtime.js', 'global-market-data.js', 'chart.umd.min.js', 'PRACTICAL TOOL', 'TRANSPARENT MODEL', 'chapter-status', 'chapter-retry', 'chapter-run', 'chapter-chart', 'chapter-result', 'chapter-bottom-guide']:
        if marker not in tool_text: errors.append(f'{tool["file"]} missing chapter tool marker {marker}')
    if guide_href not in tool_text: errors.append(f'{tool["file"]} missing guide backlink {guide_href}')
    if 'INPUT / SCENARIO' in tool_text or '教育用情境' in tool_text or '假資料' in tool_text: errors.append(f'{tool["file"]} still contains obsolete fake scenario marker')
rr_text = (ROOT / 'tools/risk-reward-calculator.html').read_text(encoding='utf-8')
for field in ['rr-symbol-search','rr-quick-symbol','rr-load-symbol','rr-timeframe','rr-chart','rr-tv-widget','rr-entry-price','rr-stop-price','rr-target-price','rr-capital','rr-risk-percent','rr-reset-lines','rr-ratio','rr-position-size','rr-support-level','rr-resistance-level','rr-market-scanner','rr-scanner-timeframe','rr-scanner-lookback','rr-scanner-min-rr','rr-scanner-start','rr-scanner-body','rr-scanner-progress-bar','rr-scanner-success','rr-hud','rr-hud-live-price','rr-hud-position','rr-stream-status','rr-history-status','rr-load-older','rr-watchlist-options','rr-watchlist-add','rr-watchlist-manage','rr-watchlist-count','rr-watchlist-panel','rr-watchlist-close','rr-watchlist-items','rr-watchlist-feedback','rr-watchlist-clear']:
    if f'id="{field}"' not in rr_text: errors.append(f'rr calculator missing {field}')
for rr_marker in ['data-rr-timeframe="1m"','data-rr-timeframe="4h"','data-rr-timeframe="1w"','id="rr-quick-symbol"','value="ETHUSDT"','value="SOLUSDT"','value="NQ"','value="ES"','value="GOLD"','value="OIL"','value="AAPL"','value="NVDA"','value="TSLA"','value="AMZN"','global-symbols-tradingview-20260825','watchlist.js','TradingView Advanced Chart']:
    if rr_marker not in rr_text: errors.append(f'rr calculator missing {rr_marker}')
validate_market_picker(rr_text, 'risk-reward-calculator.html', 'rr-symbol-search', 'rr-symbol-suggestions', 'rr-watchlist-options')
if 'lightweight-charts' not in rr_text: errors.append('rr calculator missing Lightweight Charts resource')
if 'rr-chart-labels' in rr_text or 'position:absolute' in rr_text: errors.append('rr calculator still contains legacy overlay marker layer')
rr_script = (ROOT / 'tools/risk-reward-calculator.js').read_text(encoding='utf-8')
for marker in ['getSwingLevels', 'swingHigh', 'swingLow', 'coordinateToPrice', 'startScanner', 'fetchScannerCandles', 'loadScannerSelection', 'fetchBinanceInitial', 'loadOlderHistory', 'connectLiveStream', 'updateLivePrice', 'updateSuggestions', 'activateSuggestion', 'chooseSuggestion', 'isBinanceCrypto', 'tradingViewSymbolFor', 'renderTradingViewWidget', 'widgetembed/?symbol=', 'XAUUSD', 'EURUSD', "'1w'", 'gugopro_rr_state_v1', 'localStorage', 'readPersistedState', 'saveState', 'hydrateState', 'applyRestoredParameters']:
    if marker not in rr_script: errors.append(f'rr script missing {marker}')
for page_name, fields in {
    'etf-dividend-calculator.html': ['etf-symbol','etf-investment','etf-monthly','etf-yield','etf-growth','etf-years','etf-reinvest','etf-chart','etf-reinvest-path','etf-cash-path'],
    'grid-trading-calculator.html': ['grid-quick-symbol','grid-active-symbol','grid-timeframe','grid-refresh','grid-live-price','grid-live-change','grid-live-status','grid-connection-status','grid-history-status','grid-chart','grid-tv-widget','grid-lower','grid-upper','grid-count','grid-mode','grid-capital','grid-stop','grid-take','grid-fee','grid-spacing','grid-net-margin','grid-single-profit','grid-utilization','grid-break-risk','grid-drawdown','grid-realized-profit','grid-final-value','grid-watchlist-options','grid-watchlist-add','grid-watchlist-manage','grid-watchlist-count','grid-watchlist-panel','grid-watchlist-close','grid-watchlist-items','grid-watchlist-feedback','grid-watchlist-clear']
}.items():
    text = (ROOT / 'tools' / page_name).read_text(encoding='utf-8')
    for field in fields:
        if f'id="{field}"' not in text: errors.append(f'{page_name} missing {field}')
    if page_name == 'grid-trading-calculator.html':
        for marker in ['value="4h"','value="1d"','value="1w"','id="grid-quick-symbol"','value="ETHUSDT"','value="SOLUSDT"','value="NQ"','value="ES"','value="GOLD"','value="OIL"','value="AAPL"','value="NVDA"','value="TSLA"','value="AMZN"','global-symbols-tradingview-20260825','watchlist.js','TradingView Advanced Chart','右側 Y 軸只顯示']:
            if marker not in text: errors.append(f'grid calculator missing {marker}')
        validate_market_picker(text, 'grid-trading-calculator.html', 'grid-symbol-search', 'grid-symbol-suggestions', 'grid-watchlist-options')
        if 'grid-load-older' in text or '載入更早歷史' in text: errors.append('grid calculator still contains redundant history button')
grid_script = (ROOT / 'tools/grid-trading-calculator.js').read_text(encoding='utf-8')
for marker in ['fetchMarketInitial', 'fetchYahooPage', 'loadOlderHistory', 'connectLiveStream', 'updateLivePrice', 'activeSymbol', 'updateGridSuggestions', 'activateGridSuggestion', 'chooseGridSuggestion', 'isBinanceCrypto', 'tradingViewSymbolFor', 'widgetembed/?symbol=', 'XAUUSD', 'EURUSD', "'1w'", 'gugopro_grid_state_v1', 'localStorage', 'readPersistedState', 'saveState', 'hydrateState', 'applyRestoredParameters']:
    if marker not in grid_script: errors.append(f'grid script missing {marker}')
if "$('grid-load-older')?.addEventListener" in grid_script: errors.append('grid script still binds redundant history button')
watchlist_script = (ROOT / 'tools/watchlist.js').read_text(encoding='utf-8')
for marker in ['gugopro_academy_watchlist_v1', 'localStorage', 'CustomEvent', 'watchlist-panel', 'watchlist-remove', 'watchlist-clear']:
    if marker not in watchlist_script: errors.append(f'watchlist script missing {marker}')
css_text = (ROOT / 'style.css').read_text(encoding='utf-8') + (ROOT / 'tools' / 'advanced-tools.css').read_text(encoding='utf-8') + (ROOT / 'tools' / 'global-tools.css').read_text(encoding='utf-8')
app_text = (ROOT / 'app.js').read_text(encoding='utf-8')
for app_marker in ['function initGuideNavigation', 'function initKnowledgeCardLinks', 'function initGuideChapterScrollspy', 'IntersectionObserver', "rootMargin: '-20% 0px -70% 0px'", 'scrollIntoView', 'aria-current', "sidebar.querySelectorAll('a[href]')", 'card.dataset.cardLink', "event.target.closest('a,button,input,select,textarea,label')"]:
    if app_marker not in app_text: errors.append(f'app.js missing guide navigation marker {app_marker}')
for css_marker in ['.home-page .hero-shell', '.home-page .hero-copy h1 .hero-title-line', '.home-page .tool-feature-card', '.home-page .knowledge-card[data-card-link]', 'cursor: pointer', 'outline: 2px solid #f97316', '.guide-page .guide-hero', '.guide-page .guide-sidebar a[aria-current="page"]', '.guide-chapter-nav a.active', 'background-color: #f97316 !important', 'color: #ffffff !important', 'font-weight: 700 !important', 'box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35)', 'table-layout: fixed', 'padding:8px 10px 8px 36px', 'max-width:180px', 'background:#1a1f2c !important', 'background:#141824 !important', 'color:#f8fafc !important', '.grid-hud-search', '.rr-suggestion-main', 'z-index:100', '.watchlist-wrap', '.watchlist-panel', 'position:absolute', 'z-index:120', '.tools-library-page', '.tools-hub-sidebar', '.tool-hub-card', '.tw-tool-page', '.tw-inline-tool-link', '.compact-calculator-page', '.compact-tool-page', '.guide-longform main', '.guide-longform .guide-module', '.guide-diagram', '.guide-table-wrap', '.home-page #knowledge-tree .knowledge-grid', 'grid-template-columns: repeat(4', 'height: 38px', 'min-height: 0', 'background: #f97316', 'font-size: 13px', 'font-size: 16px', 'white-space: nowrap', 'transform: none', '@media (max-width: 390px)']:
    if css_marker not in css_text: errors.append(f'style missing {css_marker}')
for forbidden_file in [
    ROOT / 'tools/index.html', ROOT / 'tools/compound-interest.html', ROOT / 'tools/etf-dividend-calculator.html',
    ROOT / 'tools/advanced-tools.js', ROOT / 'tools/advanced-tools.css', ROOT / 'style.css'
]:
    forbidden_text = forbidden_file.read_text(encoding='utf-8').lower()
    for forbidden in ['gemini-api-key', 'gugopro_gemini_api_key', 'savegugoprogeminikey', '本機 ai 設定', 'api-key-panel']:
        if forbidden in forbidden_text: errors.append(f'{forbidden_file.relative_to(ROOT)} still contains forbidden API key marker {forbidden}')

print(f'guides={len(list((ROOT / "guides").glob("*.html")))}')
print('deep_guides_expected=16')
print('workbench_panels=23')
print('global_public_data_tools=14')
print('advanced_tools=3')
print('default_symbols=15_global')
print('knowledge_tree_categories=13')
print('guide_modules=all-primary-topics-4-plus-strategy-5')
print('standalone_rr=chart-enabled')
print(f'errors={len(errors)}')
for error in errors: print(f'ERROR: {error}')
raise SystemExit(1 if errors else 0)
