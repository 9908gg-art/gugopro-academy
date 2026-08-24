from pathlib import Path

ROOT = Path(__file__).parent
TARGET_DIRS = ['fundamentals', 'stocks', 'futures', 'quant', 'crypto', 'tools']
CTA = '''\n<section class="resource-strip" data-tradingview-cta aria-label="TradingView 合作資源"><div><span class="sponsor-eyebrow">PARTNER RESOURCE / TRADINGVIEW</span><h2>把這篇內容放回圖表驗證</h2><p>使用全球市場圖表、指標腳本與回測工具，把文章裡的假設放回價格與時間軸檢驗。</p></div><a href="https://www.tradingview.com/?aff_id=168714" target="_blank" rel="noopener noreferrer" class="button button-light">領取優惠註冊 <i class="fa-solid fa-arrow-up-right-from-square"></i></a></section>\n'''

changed = 0
for directory in TARGET_DIRS:
    for page in sorted((ROOT / directory).glob('*.html')):
        text = page.read_text(encoding='utf-8')
        if '<footer' not in text:
            continue
        if 'data-tradingview-cta' not in text:
            text = text.replace('<footer', CTA + '<footer', 1)
        text = text.replace('href="/style.css"', 'href="/style.css?v=20260824"')
        text = text.replace('src="/app.js"', 'src="/app.js?v=20260824"')
        page.write_text(text, encoding='utf-8')
        changed += 1
print(f'Added TradingView CTA to {changed} existing pages')
