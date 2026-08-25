from pathlib import Path

ROOT = Path(__file__).parent / "tools"

HEADER = '''<header class="site-header"><div class="nav-container"><a href="../index.html" class="logo" aria-label="GugoPro 財經學院首頁"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><nav class="primary-nav" aria-label="主要導覽"><a href="../index.html#knowledge-tree">知識樹</a><a href="index.html">實戰工具</a><a href="../index.html#reading-room">閱讀室</a></nav><div class="nav-actions"><a class="support-link" data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-mug-hot"></i><span>支持學院</span></a><div class="lang-selector"><button class="lang-btn" type="button"><i class="fa-solid fa-globe"></i><span>繁中</span><i class="fa-solid fa-chevron-down"></i></button><div class="lang-dropdown"><a href="#" onclick="changeLanguage('zh-tw')">繁體中文</a><a href="#" onclick="changeLanguage('zh-cn')">简体中文</a><a href="#" onclick="changeLanguage('en')">English</a></div></div><button class="mobile-nav-toggle" type="button" aria-label="開啟選單" aria-expanded="false"><i class="fa-solid fa-bars"></i></button></div></div></header>'''

FOOTER = '''<section class="resource-strip" data-tradingview-cta aria-label="TradingView 合作資源"><div><span class="sponsor-eyebrow">PARTNER RESOURCE / TRADINGVIEW</span><h2>把工具結果放回圖表驗證</h2><p>工具用來整理假設；實際研究仍應搭配交易所資料、商品文件與市場圖表。</p></div><a href="https://www.tradingview.com/?aff_id=168714" target="_blank" rel="noopener noreferrer" class="button button-light">領取優惠註冊 <i class="fa-solid fa-arrow-up-right-from-square"></i></a></section><footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><a href="../index.html" class="logo"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><p>把市場雜訊，整理成一條可走的路。</p></div><div class="footer-nav"><div><strong>探索</strong><a href="../guides/taiwan-stocks.html">台股四章節指南</a><a href="index.html">實戰工具庫</a><a href="../index.html#knowledge-tree">13 類知識樹</a></div><div><strong>支持</strong><a data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">Ko-fi 贊助支持</a><a href="https://www.amazon.com/?tag=9908qq-20" target="_blank" rel="noopener noreferrer">Amazon Hub</a></div><div><strong>政策</strong><a href="/privacy.html">隱私權政策</a><a href="/terms.html">服務條款與免責</a><a href="/about.html">關於我們</a></div></div></div><div class="footer-bottom"><span>© 2026 GugoPro Academy</span><span>教育內容，不構成投資建議。</span></div></footer>'''


def page(title, description, kicker, heading, intro, chapter, tool_name, content, education, script):
    return f'''<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{description}">
  <title>{title}｜GugoPro 財經學院</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><link rel="stylesheet" href="../style.css?v=tw-chapter-tools-20260825"><link rel="stylesheet" href="advanced-tools.css?v=tw-chapter-tools-20260825">
</head>
<body class="tools-page tw-tool-page">
{HEADER}
<main class="container tw-tool-main">
  <a class="tw-back-link" href="../guides/taiwan-stocks.html#{chapter}"><i class="fa-solid fa-arrow-left"></i> 閱讀完整台股指南：{chapter}</a>
  <section class="tw-tool-hero"><div><div class="eyebrow"><span class="eyebrow-dot"></span>{kicker}</div><h1>{heading}</h1><p>{intro}</p></div><div class="tw-tool-status"><span class="tw-status-dot"></span> BROWSER-ONLY<br><strong>純前端即時計算</strong></div></section>
  <div class="tw-tool-layout">
    <section class="tw-tool-card tw-tool-input-card" aria-labelledby="tw-tool-input-title"><div class="tw-tool-card-head"><div><span class="section-kicker">INPUT / SCENARIO</span><h2 id="tw-tool-input-title">{tool_name}</h2></div><span class="tw-tool-number">{chapter}</span></div>{content}</section>
    <aside class="tw-tool-card tw-tool-education"><span class="section-kicker">READ BEFORE USING</span><h2>章節實戰教學看板</h2><div class="tw-education-copy">{education}</div><p>這個工具只在目前瀏覽器中運算，不代表即時報價或投資建議。請先確認資料日期、單位、交易制度與失效條件，再把結果放回原始公告或圖表驗證。</p><a href="../guides/taiwan-stocks.html#{chapter}" class="tw-guide-return"><i class="fa-solid fa-book-open"></i> 回到本章完整教學 <i class="fa-solid fa-arrow-right"></i></a></aside>
  </div>
  <section class="tw-tool-result-card" aria-live="polite"><div class="tw-result-head"><div><span class="section-kicker">OUTPUT / DECISION SUPPORT</span><h2>計算結果與條件式解讀</h2></div><span class="tw-result-badge">教育用情境</span></div><div id="{script.replace('.js','')}-result" class="tw-tool-result">等待輸入。</div></section>
  <div class="tw-tool-links"><a href="../guides/taiwan-stocks.html#{chapter}"><i class="fa-solid fa-book-open"></i> 返回本章教學</a><a href="index.html"><i class="fa-solid fa-compass"></i> 瀏覽全部工具</a></div>
  <p class="tool-disclaimer">本工具為教育用途的簡化模型；實際資料、費率、稅務、流動性、交易資格與法規可能變動，請以交易所、券商及主管機關最新公告為準。</p>
</main>
{FOOTER}
<script src="../app.js?v=tw-chapter-tools-20260825"></script><script src="{script}?v=tw-chapter-tools-20260825"></script>
</body></html>'''

inst_content = '''<div class="tw-form-grid"><label>台股代碼／情境名稱<input id="tw-inst-symbol" value="2330.TW" autocomplete="off"></label><label>觀察窗口（交易日）<input id="tw-inst-window" type="number" value="5" min="1" max="60"></label><label>外資買賣超（張）<input id="tw-inst-foreign" type="number" value="8000"></label><label>投信買賣超（張）<input id="tw-inst-investment" type="number" value="5000"></label><label>自營商買賣超（張）<input id="tw-inst-dealer" type="number" value="-1000"></label><label>法人連續方向（天）<input id="tw-inst-streak" type="number" value="3" min="0"></label><label>融資餘額（張）<input id="tw-inst-margin" type="number" value="120000" min="0"></label><label>融券餘額（張）<input id="tw-inst-short" type="number" value="18000" min="0"></label><label>大戶／分點集中度（%）<input id="tw-inst-concentration" type="number" value="42" min="0" max="100" step="0.1"></label></div><button class="tw-calc-button" type="button" id="tw-inst-calc"><i class="fa-solid fa-rotate"></i> 更新籌碼條件</button><p class="tw-input-note"><i class="fa-solid fa-circle-info"></i> 將 TWSE／TPEX 日報中的買賣超與餘額貼入；工具不假裝把公開資料即時抓回本站。</p>'''
inst_education = '<h3>三個讀法</h3><p><strong>外資</strong>可能同時調整現貨、期貨與匯率曝險；<strong>投信</strong>受基金申贖與持股限制影響；<strong>自營商</strong>的自行交易與避險交易可能方向相反。</p><p><strong>券資比</strong>＝融券餘額 ÷ 融資餘額 × 100%。比率偏高只代表回補壓力值得研究，不等於必然軋空；集中度也要搭配價格與成交量驗證。</p>'
inst_page = page('三大法人與融資融券籌碼追蹤儀', '台股三大法人、融資融券與籌碼集中度教育用追蹤試算工具。', 'CHAPTER 01 / CHIPS & FLOW', '把法人流向，拆成可驗證的證據鏈。', '輸入台股代碼與公開日報數字，整理外資、投信、自營商動能、券資比與集中度警戒；結果是條件式研究起點，不是主力預測。', 'chips-analysis', '三大法人與籌碼追蹤儀', inst_content, inst_education, 'tw-institutional-tracker.js')

ma_content = '''<div class="tw-form-grid"><label>台股代碼／情境名稱<input id="tw-ma-symbol" value="2330.TW" autocomplete="off"></label><label>未來推算天數<input id="tw-ma-horizon" type="number" value="3" min="1" max="3"></label><label class="tw-form-wide">歷史收盤價（由舊至新，以逗號或空白分隔）<textarea id="tw-ma-prices" rows="4">938,942,935,940,948,955,951,960,968,962,970,978,972,980,988,995,1002,998,1008,1015,1022,1018,1025,1030,1038,1045,1040,1052,1060,1068</textarea></label></div><button class="tw-calc-button" type="button" id="tw-ma-calc"><i class="fa-solid fa-chart-line"></i> 計算均線扣抵</button><div class="tw-diagnostic-pills"><span id="tw-ma-rsi-pill">RSI —</span><span id="tw-ma-kd-pill">KD —</span><span id="tw-ma-macd-pill">MACD —</span></div><p class="tw-input-note"><i class="fa-solid fa-circle-info"></i> 未知的未來收盤價以最新收盤價持平情境推算；扣抵值用來描述斜率，不是價格預測。</p>'''
ma_education = '<h3>扣抵值怎麼讀</h3><p>均線更新會加入新收盤、扣除窗口最舊收盤；若新值高於被扣除值，均線有上推壓力，反之則有下壓壓力。這只描述斜率，不保證行情。</p><p>RSI、KD、MACD 都是價格衍生訊號。先寫出收盤、量能與回踩條件，再把指標當作過濾器，避免多個指標重複計算同一段價格。</p>'
ma_page = page('5MA／20MA 均線扣抵與量價轉折試算器', '台股 5MA、20MA 均線扣抵、RSI、KD 與 MACD 教育用試算工具。', 'CHAPTER 02 / TECHNICAL ANALYSIS', '先看扣抵值，再判斷量價是否確認。', '輸入歷史收盤價，工具會列出今日與未來三日 5MA／20MA 的扣抵價與持平收盤情境，並以 RSI、KD、MACD 提供診斷提示。', 'technical-analysis', '均線扣抵與量價轉折試算器', ma_content, ma_education, 'tw-ma-deduction-calculator.js')

val_content = '''<div class="tw-form-grid"><label>台股代碼／情境名稱<input id="tw-val-symbol" value="2330.TW" autocomplete="off"></label><label>目前股價（元）<input id="tw-val-price" type="number" value="1050" min="0" step="0.01"></label><label>每股盈餘 EPS<input id="tw-val-eps" type="number" value="38" min="0.01" step="0.01"></label><label>本益比下限<input id="tw-val-pe-low" type="number" value="18" min="0.1" step="0.1"></label><label>本益比中位<input id="tw-val-pe-mid" type="number" value="22" min="0.1" step="0.1"></label><label>本益比上限<input id="tw-val-pe-high" type="number" value="27" min="0.1" step="0.1"></label><label>近三年營收 YoY（%）<input id="tw-val-growth" value="12,18,8" autocomplete="off"></label><label>近三年現金股利（元）<input id="tw-val-dividends" value="10,11,12" autocomplete="off"></label></div><button class="tw-calc-button" type="button" id="tw-val-calc"><i class="fa-solid fa-scale-balanced"></i> 計算估值與填息</button><svg id="tw-val-valuation-chart" class="tw-inline-svg" viewBox="0 0 720 190" role="img" aria-label="本益比合理價區間示意圖"></svg><p class="tw-input-note"><i class="fa-solid fa-circle-info"></i> 填息參考分數是透明公式的教育提示，不是統計機率；除權息參考價未納入股票股利、稅費與價格跳動單位。</p>'''
val_education = '<h3>估值三個分母</h3><p><strong>PE</strong>＝股價 ÷ EPS；<strong>PEG</strong>會再把 PE 與成長率連結，但成長率的期間、基期與百分比口徑必須一致。</p><p>除息參考價是除息前價格減現金股利；填息分數只是以殖利率、成長與價格位置組成的透明提示，不是統計機率，也不替代公司公告。</p>'
val_page = page('台股本益比河流圖與填息試算機', '台股 EPS、本益比區間、PEG、除權息參考價與填息教育用試算工具。', 'CHAPTER 03 / FUNDAMENTALS', '讓「合理價」與「填息」都有計算條件。', '輸入 EPS、本益比區間、近三年營收成長與現金股利，建立估值帶、PEG 與除息後參考價，再把分數放回財報與公告驗證。', 'fundamentals-analysis', '本益比河流圖、PEG 與填息試算機', val_content, val_education, 'tw-stock-valuation.js')

fee_content = '''<div class="tw-form-grid"><label>台股代碼／情境名稱<input id="tw-fee-symbol" value="2330.TW" autocomplete="off"></label><label>交易型態<select id="tw-fee-mode"><option value="day">現股當沖（證交稅 0.15%）</option><option value="cash">一般現股（證交稅 0.3%）</option></select></label><label>買進價格（元）<input id="tw-fee-buy" type="number" value="950" min="0.01" step="0.01"></label><label>賣出價格（元）<input id="tw-fee-sell" type="number" value="960" min="0.01" step="0.01"></label><label>股數<input id="tw-fee-shares" type="number" value="1000" min="1"></label><label>手續費折數<select id="tw-fee-discount"><option value="2.8">2.8 折</option><option value="3">3 折</option><option value="3.8">3.8 折</option><option value="4">4 折</option><option value="5">5 折</option><option value="6" selected>6 折</option></select></label><label>借券／資金成本年率（%）<input id="tw-fee-borrow" type="number" value="0.5" min="0" step="0.01"></label><label>承擔成本天數<input id="tw-fee-days" type="number" value="2" min="0"></label><label>交割可用資金（元）<input id="tw-fee-capital" type="number" value="500000" min="0"></label><label>單筆風險上限（%）<input id="tw-fee-risk" type="number" value="1" min="0.1" step="0.1"></label><label>停損價格（元）<input id="tw-fee-stop" type="number" value="940" min="0.01" step="0.01"></label></div><button class="tw-calc-button" type="button" id="tw-fee-calc"><i class="fa-solid fa-receipt"></i> 計算交易成本</button><p class="tw-input-note"><i class="fa-solid fa-circle-info"></i> 手續費基準以 0.1425% 乘折數估算；實際最低手續費、券商優惠與稅規請以最新合約／公告為準。</p>'''
fee_education = '<h3>成本先拆成四層</h3><p>買賣雙邊手續費以 0.1425% 基準乘折數估算；證交稅按賣出金額計算，當沖與一般現股使用不同情境稅率。</p><p>若現股當沖未能反向成交，T+2 可能需要完整交割資金；借券或資金成本、滑價與停損距離都要納入最大損失，不把停損價視為成交保證。</p>'
fee_page = page('台股當沖與現股交易成本計算器', '台股當沖、現股手續費、證交稅、借券成本、保證金與 T+2 風控教育用計算器。', 'CHAPTER 04 / EXECUTION & RISK', '先把成本算進去，再談能不能成交。', '支援 2.8 至 6 折手續費、當沖／現股證交稅、借券或資金成本、保證金短缺與停損風險試算，讓交易制度成為下單前的檢核表。', 'trading-rules', '台股當沖與現股成本計算器', fee_content, fee_education, 'tw-day-trading-fee-calc.js')

files = {
    'tw-institutional-tracker.html': inst_page,
    'tw-ma-deduction-calculator.html': ma_page,
    'tw-stock-valuation.html': val_page,
    'tw-day-trading-fee-calc.html': fee_page,
}
for name, text in files.items():
    (ROOT / name).write_text(text, encoding='utf-8')
print('wrote', ', '.join(files))
