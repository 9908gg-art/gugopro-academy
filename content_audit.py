from pathlib import Path
from bs4 import BeautifulSoup

root = Path(__file__).parent
required = {
    '概念': lambda text: '核心觀念' in text or '基本結構' in text or '核心結構' in text,
    '指標／公式': lambda text: '公式' in text or '指標' in text or '指標與' in text,
    '實例': lambda text: '假設' in text or '例如' in text,
    '實戰': lambda text: '實戰' in text or '交易流程' in text or '研究流程' in text,
    '比較表': lambda body: body.select_one('table.guide-table') is not None,
    '檢查清單': lambda text: '檢查清單' in text,
    '資料來源': lambda body: body.select_one('.guide-references') is not None,
}
errors = []
for page in sorted((root / 'guides').glob('*.html')):
    soup = BeautifulSoup(page.read_text(encoding='utf-8'), 'html.parser')
    body = soup.select_one('.guide-body') or soup.body
    text = ' '.join(body.stripped_strings) if body else ''
    missing = [name for name, check in required.items() if not check(text if name not in {'比較表', '資料來源'} else body)]
    status = 'OK' if len(text) >= 1200 and not missing else 'FAIL'
    print(f'{status}\t{page.name}\tchars={len(text)}\tmissing={",".join(missing) or "none"}')
    if len(text) < 1200: errors.append(f'{page.name}: only {len(text)} chars')
    errors.extend(f'{page.name}: missing {name}' for name in missing)
print(f'guide_count={len(list((root / "guides").glob("*.html")))}')
print(f'errors={len(errors)}')
for error in errors: print(f'ERROR: {error}')
raise SystemExit(1 if errors else 0)
