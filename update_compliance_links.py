from pathlib import Path
import re

ROOT = Path(__file__).parent
changed = 0
for page in ROOT.rglob('*.html'):
    if any(part in {'.git', 'node_modules'} for part in page.parts):
        continue
    text = page.read_text(encoding='utf-8')
    original = text
    text = re.sub(r'(?:\.\./)*privacy-policy\.html', '/privacy.html', text)
    text = re.sub(r'(?:\.\./)*terms-of-service\.html', '/terms.html', text)
    text = re.sub(r'(?:\.\./)+privacy\.html', '/privacy.html', text)
    text = re.sub(r'(?:\.\./)+terms\.html', '/terms.html', text)
    text = re.sub(r'(?:\.\./)+about\.html', '/about.html', text)
    text = re.sub(r'</footer>\s*<a href="/about\.html">關於我們</a>', '</footer>', text)
    text = re.sub(r'<a href="/about\.html">關於我們</a></footer>', '</footer>', text)
    if '<footer' in text and 'href="/about.html"' not in text and 'href="about.html"' not in text:
        text = text.replace('</footer>', '<a href="/about.html">關於我們</a></footer>', 1)
    if text != original:
        page.write_text(text, encoding='utf-8')
        changed += 1
print(f'Updated compliance links in {changed} HTML pages')
