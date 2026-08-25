from pathlib import Path
import re
from chapter_tool_specs import TOOLS

ROOT = Path(__file__).parent
runtime = (ROOT / 'tools/chapter-tools-runtime.js').read_text(encoding='utf-8')
hub = (ROOT / 'tools/index.html').read_text(encoding='utf-8')
errors = []
seen_files = set()
for tool in TOOLS:
    file = tool['file']
    if file in seen_files: errors.append(f'duplicate file {file}')
    seen_files.add(file)
    page = ROOT / 'tools' / file
    if not page.exists():
        errors.append(f'missing page {file}')
        continue
    text = page.read_text(encoding='utf-8')
    for marker in [f'data-chapter-tool="{tool["id"]}"', f'data-chapter-kind="{tool["kind"]}"', f'../guides/{tool["guide"]}#{tool["chapter"]}', 'id="chapter-run"', 'id="chapter-chart"', 'id="chapter-result"']:
        if marker not in text: errors.append(f'{file} missing {marker}')
    for control in tool['controls']:
        if f'id="{control["id"]}"' not in text: errors.append(f'{file} missing control {control["id"]}')
    if f"'{tool['kind']}':" not in runtime: errors.append(f'runtime missing action {tool["kind"]}')
    if f'href="{file}"' not in hub: errors.append(f'Hub missing href {file}')
    if f'<strong>{tool["title"]}</strong>' not in hub: errors.append(f'Hub missing title {file}')
for guide in sorted({tool['guide'] for tool in TOOLS}):
    text = (ROOT / 'guides' / guide).read_text(encoding='utf-8')
    expected = [tool for tool in TOOLS if tool['guide'] == guide]
    for tool in expected:
        if f'../tools/{tool["file"]}' not in text: errors.append(f'{guide} missing link {tool["file"]}')
    if text.count('data-chapter-inline-tool') < len(expected): errors.append(f'{guide} insufficient inline markers')
    if text.count('data-chapter-tool-cta') < len(expected): errors.append(f'{guide} insufficient CTA markers')
print(f'specs={len(TOOLS)} pages={len(seen_files)} errors={len(errors)}')
for error in errors: print(error)
raise SystemExit(1 if errors else 0)
