from pathlib import Path

ROOT = Path(__file__).parent
replacements = {
    'style.css?v=20260824': 'style.css?v=f4b3de7',
    'app.js?v=20260824': 'app.js?v=f4b3de7',
    'advanced-tools.js?v=20260824': 'advanced-tools.js?v=f4b3de7',
    'risk-reward-calculator.js?v=20260824': 'risk-reward-calculator.js?v=f4b3de7',
}
changed = 0
for page in ROOT.rglob('*.html'):
    if any(part in {'.git', 'node_modules'} for part in page.parts):
        continue
    text = page.read_text(encoding='utf-8')
    original = text
    for old, new in replacements.items():
        text = text.replace(old, new)
    if text != original:
        page.write_text(text, encoding='utf-8')
        changed += 1
print(f'Bumped resources in {changed} HTML pages')
