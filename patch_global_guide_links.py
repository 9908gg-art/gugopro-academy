from pathlib import Path

ROOT = Path(__file__).parent

LINKS = {
    'guides/us-stocks.html': [
        ('us-stocks-metrics', 'tools/us-earnings-tracker.html', '美股財報成長與 EPS 分析儀', '把 EPS、營收與財報窗口價格反應放回公開資料圖表。'),
        ('us-stocks-practice', 'tools/us-sec-insider-flow.html', 'SEC Form 4／13F 申報流向儀', '從公開申報索引開始，回到 SEC 原始 accession 文件查證。'),
    ],
    'guides/etf.html': [
        ('etf-metrics', 'tools/etf-nav-premium-tracker.html', 'ETF 淨值折溢價分析儀', '比較市場價格、adjusted-close NAV 代理與追蹤差。'),
        ('etf-practice', 'tools/etf-drip-backtester.html', 'ETF 股息再投入 DRIP 回測儀', '使用公開股利事件與歷史價格比較 DRIP 和領現金。'),
    ],
    'guides/etf-dividend-drip.html': [
        ('drip-practice', 'tools/etf-drip-backtester.html', 'ETF 股息再投入 DRIP 回測儀', '用公開股利事件與歷史價格檢查再投入與領現金差異。'),
    ],
    'guides/bonds.html': [('bonds-metrics', 'tools/bond-yield-curve-tracker.html', '美國公債殖利率曲線儀', '以 FRED 2Y、10Y、30Y 與 10Y−2Y 觀察期限結構。')],
    'guides/funds.html': [('funds-metrics', 'tools/fund-sharpe-drawdown-analyzer.html', '基金 Sharpe／Sortino／MDD 分析儀', '把公開價格序列轉成報酬、波動與水下回撤。')],
    'guides/forex.html': [('forex-carry', 'tools/forex-interest-carry-calc.html', '貨幣對 Carry 與匯率波動儀', '用公開匯率與 FRED 利率代理檢查利差交易風險。')],
    'guides/commodities.html': [('commodities-metrics', 'tools/commodity-gold-oil-ratio.html', '金銀比／金油比監控儀', '以 GC、SI、CL 公開期貨資料比較商品相對位置。')],
    'guides/futures.html': [('futures-metrics', 'tools/futures-basis-term-structure.html', '期現貨 Basis 分析儀', '比較指數期貨、現貨與連續合約價差代理。')],
    'guides/options.html': [('options-metrics', 'tools/options-implied-volatility-rank.html', 'IV Rank／Put-Call Ratio 儀', '公開 options chain 可用時，檢查 ATM IV 與 OI PCR。')],
    'guides/crypto.html': [('crypto-metrics', 'tools/crypto-funding-rate-liquidations.html', '永續合約 Funding／清算儀', '讀取 Binance funding、global long／short 與強平事件樣本。')],
    'guides/real-estate.html': [('real-estate-metrics', 'tools/real-estate-roi-cap-rate.html', 'Cap Rate／房貸壓力測試儀', '輸入真實物件與銀行條件，計算 NOI、DSCR 與升息壓力。')],
    'guides/macro-economics.html': [('macro-economics-metrics', 'tools/macro-liquidity-cpi-tracker.html', '流動性／M2／CPI 指標儀', '用 FRED 公開序列與 SPY 比較相對宏觀路徑。')],
    'guides/trading-strategy.html': [('position-sizing', 'tools/trade-risk-kelly-criterion.html', 'Kelly／R:R 部位管理儀', '用真實交易紀錄的勝率、盈虧比與停損距離計算風險股數。')],
}


def make_inline(href, title, desc):
    return f'<p class="guide-inline-tool-link" data-global-inline-tool><a href="../{href}"><i class="fa-solid fa-chart-line"></i> 使用「{title}」</a>：{desc}</p>'


def make_cta(href, title, desc):
    return f'<div class="guide-practice-card global-tool-cta" data-global-tool-cta><div><span class="section-kicker">REAL DATA PRACTICE DESK</span><h3>把本章概念放進 {title}</h3><p>{desc} 工具會顯示公開資料狀態或資料限制，不用假數字補齊。</p></div><a class="button button-light" href="../{href}">立即開啟工具 <i class="fa-solid fa-arrow-right"></i></a></div>'

for relative, entries in LINKS.items():
    path = ROOT / relative
    text = path.read_text(encoding='utf-8')
    if 'data-global-tool-cta' in text:
        print('skip already patched', relative)
        continue
    for chapter, href, title, desc in entries:
        start = text.find(f'<section id="{chapter}"')
        if start < 0:
            raise SystemExit(f'missing chapter {chapter} in {relative}')
        end = text.find('</section>', start)
        if end < 0:
            raise SystemExit(f'missing closing section for {chapter} in {relative}')
        injection = make_inline(href, title, desc) + make_cta(href, title, desc)
        text = text[:end] + injection + text[end:]
    path.write_text(text, encoding='utf-8')
    print('patched', relative, len(entries), 'chapter links')
print('done')
