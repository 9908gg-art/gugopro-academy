from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

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
root = ROOT / 'index.html'
root_text = root.read_text(encoding='utf-8')
for anchor in ['knowledge-tree', 'tool-deck', 'reading-room', 'support']:
    if f'id="{anchor}"' not in root_text: errors.append(f'root missing #{anchor}')
for href in ['tools/risk-reward-calculator.html', 'tools/etf-dividend-calculator.html', 'tools/grid-trading-calculator.html']:
    if href not in root_text: errors.append(f'root missing tool link {href}')

expected_guides = ['taiwan-stocks','us-stocks','etf','bonds','funds','forex','commodities','futures','options','warrants','crypto','cfd-indices','risk-reward-ratio']
for slug in expected_guides:
    if not (ROOT / 'guides' / f'{slug}.html').exists(): errors.append(f'missing guide {slug}')
required_files = [
    'privacy.html', 'terms.html', 'about.html',
    'tools/risk-reward-calculator.html', 'tools/risk-reward-calculator.js',
    'tools/etf-dividend-calculator.html', 'tools/etf-dividend-calculator.js',
    'tools/grid-trading-calculator.html', 'tools/grid-trading-calculator.js'
]
for required in required_files:
    if not (ROOT / required).exists(): errors.append(f'missing required file {required}')

pages = [
    root, ROOT / 'tools/index.html', ROOT / 'tools/risk-reward-calculator.html',
    ROOT / 'tools/etf-dividend-calculator.html', ROOT / 'tools/grid-trading-calculator.html',
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

workbench_text = (ROOT / 'tools/index.html').read_text(encoding='utf-8')
for panel in ['compound-panel','etf-panel','bond-panel','curve-panel','risk-panel','valuation-panel','retirement-panel','allocation-panel','mc-panel']:
    if f'id="{panel}"' not in workbench_text: errors.append(f'workbench missing {panel}')
for calc in ['compound','etf-fee','duration','curve','risk','dcf','retirement','allocation','monte-carlo']:
    if f'data-calc="{calc}"' not in workbench_text: errors.append(f'workbench missing calc {calc}')
for link in ['risk-reward-calculator.html', 'etf-dividend-calculator.html', 'grid-trading-calculator.html']:
    if link not in workbench_text: errors.append(f'workbench missing link {link}')
rr_text = (ROOT / 'tools/risk-reward-calculator.html').read_text(encoding='utf-8')
for field in ['rr-symbol-search','rr-load-symbol','rr-timeframe','rr-chart','rr-chart-labels','rr-chart-zones','rr-entry-price','rr-stop-price','rr-target-price','rr-capital','rr-risk-percent','rr-ratio','rr-position-size','rr-support-level','rr-resistance-level']:
    if f'id="{field}"' not in rr_text: errors.append(f'rr calculator missing {field}')
if 'lightweight-charts' not in rr_text: errors.append('rr calculator missing Lightweight Charts resource')
for page_name, fields in {
    'etf-dividend-calculator.html': ['etf-symbol','etf-investment','etf-monthly','etf-yield','etf-growth','etf-years','etf-reinvest','etf-chart','etf-reinvest-path','etf-cash-path'],
    'grid-trading-calculator.html': ['grid-lower','grid-upper','grid-count','grid-mode','grid-capital','grid-volatility','grid-days','grid-chart','grid-lines','grid-path','grid-equity-path']
}.items():
    text = (ROOT / 'tools' / page_name).read_text(encoding='utf-8')
    for field in fields:
        if f'id="{field}"' not in text: errors.append(f'{page_name} missing {field}')

print(f'guides={len(list((ROOT / "guides").glob("*.html")))}')
print('deep_guides_expected=13')
print('workbench_panels=9')
print('advanced_tools=3')
print('standalone_rr=chart-enabled')
print(f'errors={len(errors)}')
for error in errors: print(f'ERROR: {error}')
raise SystemExit(1 if errors else 0)
