from pathlib import Path
import re

path = Path(__file__).parent / 'tools' / 'index.html'
text = path.read_text(encoding='utf-8')
marker = '<p class="tools-hub-empty" id="tool-library-empty" hidden>'
cards = [
('18','us-earnings-tracker.html','us','02 · 美股','財報與估值','fa-file-invoice-dollar','美股財報成長與 EPS 驚喜分析儀','抓取公開行情與 SEC XBRL facts，觀察 EPS、營收成長與財報窗口價格反應。','us-earnings'),
('19','us-sec-insider-flow.html','us','02 · 美股','SEC 申報','fa-user-shield','美股內部人持股與 SEC 申報流向儀','整理 SEC submissions 的 Form 4、13F 申報密度與 accession 查證入口，不以筆數偽造交易方向。','us-sec-insider'),
('20','etf-nav-premium-tracker.html','etf','03 · ETF','淨值與費用','fa-layer-group','ETF 淨值折溢價與費用率分析儀','以公開市場價格與 adjusted-close NAV 代理，觀察折溢價、追蹤差與正式 NAV 查證位置。','etf-nav'),
('21','etf-drip-backtester.html','etf','03 · ETF','股息回測','fa-coins','ETF 股息再投入 DRIP 回測儀','以公開股利事件和歷史價格逐日回測 DRIP 與現金領出的資產路徑。','etf-drip-backtest'),
('22','bond-yield-curve-tracker.html','fixed macro','04 · 債券','殖利率曲線','fa-chart-area','美國公債殖利率曲線與倒掛預警儀','讀取 FRED 2Y、10Y、30Y 與 10Y−2Y，標記曲線形狀與倒掛觀測。','bond-curve'),
('23','fund-sharpe-drawdown-analyzer.html','funds','05 · 基金','Sharpe／MDD','fa-chart-line','基金與投資組合 Sharpe、Sortino、MDD 分析儀','使用公開價格計算年化報酬、波動、風險調整績效與水下回撤。','fund-sharpe'),
('24','forex-interest-carry-calc.html','forex','06 · 外匯','Carry／Swap','fa-money-bill-transfer','主要貨幣對利差交易與匯率波動儀','比較公開匯率、FRED 利率代理、carry proxy 與年化波動，避免假裝成券商 swap。','forex-carry'),
('25','commodity-gold-oil-ratio.html','commodities','07 · 商品原物料','金銀比／金油比','fa-gem','金銀比、金油比與通膨週期監控儀','抓取 GC、SI、CL 公開期貨價格，繪製商品比率與歷史標準化位置。','commodity-ratio'),
('26','futures-basis-term-structure.html','futures','08 · 期貨','Basis／轉倉','fa-arrows-left-right-to-line','期現貨實質價差與期限結構儀','比較 NQ／Nasdaq 或 ES／S&P 的期貨、現貨與 basis 代理，提示連續合約限制。','futures-basis'),
('27','options-implied-volatility-rank.html','options','09 · 選擇權','IV Rank／PCR','fa-wave-square','隱含波動率 IV Rank 與 Put／Call Ratio 儀','公開 options chain 可用時呈現 ATM IV 與 OI PCR；資料受限就明確顯示，不補假 IV。','options-iv'),
('28','crypto-funding-rate-liquidations.html','crypto','10 · 虛擬貨幣','Funding／清算','fa-bitcoin','永續合約資金費率與多空清算儀','對接 Binance 公開 Futures，觀察 funding、global long／short 與強平事件樣本。','crypto-funding'),
('29','real-estate-roi-cap-rate.html','real-estate','11 · 房地產','Cap Rate／房貸','fa-house','不動產 Cap Rate 與房貸壓力測試儀','輸入實際物件與銀行條件，計算 NOI、Cap Rate、DSCR 與升息壓力。','real-estate-roi'),
('30','macro-liquidity-cpi-tracker.html','macro','12 · 總體經濟','M2／CPI／流動性','fa-earth-americas','全球流動性、M2 與 CPI 通膨指標儀','讀取 FRED WALCL、M2、CPI 與 SPY，建立標準化相對路徑比較。','macro-liquidity'),
('31','trade-risk-kelly-criterion.html','strategy','13 · 實戰交易','Kelly／R:R','fa-shield-halved','Kelly 部位管理、R:R 與破產機率儀','以真實交易紀錄的勝率與盈虧比計算 Kelly、風險股數與可重現回撤路徑。','trade-risk-kelly'),
]

def card(item):
    if len(item) == 8:
        index, href, category, tag, kicker, icon, title, desc = item
        ident = ''
    else:
        index, href, category, tag, kicker, icon, title, desc, ident = item
    search = f'{tag} {kicker} {title} {desc} {ident}'
    return f'<a class="tool-hub-card" href="{href}" data-tool-card data-global-tool-card data-tool-category="{category}" data-tool-search="{search}"><span class="tool-hub-card-top"><span class="tool-hub-index">{index}</span><span class="tool-hub-tag">{tag}</span><i class="fa-solid {icon}" aria-hidden="true"></i></span><span class="tool-hub-card-kicker">{kicker}</span><strong>{title}</strong><span class="tool-hub-description">{desc}</span><span class="tool-hub-card-action">開啟真實資料工具 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></a>'

block = ''.join(card(item) for item in cards)
text = re.sub(r'<a class="tool-hub-card"[^>]*data-global-tool-card[^>]*>.*?</a>', '', text, flags=re.S)
if marker not in text:
    raise SystemExit('card marker not found')
text = text.replace(marker, block + marker, 1)
text = text.replace('<strong>17</strong><span>可探索工具</span>', '<strong>31</strong><span>可探索工具</span>', 1)
text = re.sub(r'13 類市場導航(?: · 14 張公開資料工具)+', '13 類市場導航 · 14 張公開資料工具', text, count=1)
text = text.replace('QUICK CALCULATORS / 09 PANELS', 'QUICK CALCULATORS / 23 PANELS', 1)
text = text.replace('上方「在本頁計算」卡片', '上方「在本頁計算」或「開啟真實資料」卡片', 1)
path.write_text(text, encoding='utf-8')
print('added', len(cards), 'cards; hub total 31')
