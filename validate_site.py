from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT = Path(__file__).parent

class Validator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.hrefs = []
        self.text = []
        self.inputs = []
        self.buttons = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if 'id' in data: self.ids.append(data['id'])
        if tag == 'a' and 'href' in data: self.hrefs.append(data['href'])
        if tag == 'input': self.inputs.append(data.get('id', ''))
        if tag == 'button': self.buttons.append(data)
    def handle_data(self, data):
        self.text.append(data)

errors = []
root = ROOT / 'index.html'
parser = Validator(); parser.feed(root.read_text(encoding='utf-8'))
for anchor in ['knowledge-tree', 'tool-deck', 'reading-room', 'support']:
    if f'id="{anchor}"' not in root.read_text(encoding='utf-8'): errors.append(f'root missing #{anchor}')
if len(list((ROOT / 'guides').glob('*.html'))) != 12: errors.append('guide page count is not 12')

for page in [root, ROOT / 'tools/index.html', *sorted((ROOT / 'guides').glob('*.html'))]:
    p = Validator(); p.feed(page.read_text(encoding='utf-8'))
    duplicates = sorted({x for x in p.ids if p.ids.count(x) > 1})
    if duplicates: errors.append(f'{page.relative_to(ROOT)} duplicate ids: {duplicates}')
    for href in p.hrefs:
        parsed = urlparse(href)
        if parsed.scheme or href.startswith('#') or href.startswith('mailto:'): continue
        target = (page.parent / parsed.path).resolve()
        if parsed.path and not target.exists(): errors.append(f'{page.relative_to(ROOT)} broken link: {href}')

workbench = ROOT / 'tools/index.html'
workbench_text = workbench.read_text(encoding='utf-8')
for panel in ['compound-panel','etf-panel','bond-panel','curve-panel','risk-panel','valuation-panel','retirement-panel','allocation-panel','mc-panel']:
    if f'id="{panel}"' not in workbench_text: errors.append(f'workbench missing {panel}')
for calc in ['compound','etf-fee','duration','curve','risk','dcf','retirement','allocation','monte-carlo']:
    if f'data-calc="{calc}"' not in workbench_text: errors.append(f'workbench missing calc {calc}')

print(f'guides={len(list((ROOT / "guides").glob("*.html")))}')
print(f'root_links={len(parser.hrefs)}')
print(f'workbench_panels=9')
print(f'errors={len(errors)}')
for error in errors: print(f'ERROR: {error}')
raise SystemExit(1 if errors else 0)
