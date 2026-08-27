#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
INCLUDE = [ROOT / 'index.html', ROOT / 'guides', ROOT / 'tools', ROOT / 'quant']
EXCLUDE_DIRS = {'en', 'es', 'ja', 'zh-cn', 'de', 'fr', 'pt', 'zh-CN'}
EXCLUDE_TAGS = {'script', 'style', 'noscript', 'svg', 'path', 'template'}
ATTRS = ('placeholder', 'title', 'aria-label', 'alt', 'data-label', 'content')
CJK_RE = re.compile(r'[\u3400-\u9fff]')
URL_RE = re.compile(r'^(?:https?://|mailto:|javascript:|/|\.?\.?/|#|[\w.-]+\.(?:html|js|css|json|png|jpg|svg)(?:[?#].*)?)$', re.I)


def norm(value: str) -> str:
    return ' '.join(value.replace('\xa0', ' ').split())


def useful(value: str) -> bool:
    value = norm(value)
    if len(value) < 2 or URL_RE.match(value):
        return False
    if re.fullmatch(r'[\d\s.,:%+\-–—=()/<>|·•#_~]+', value):
        return False
    return True


def add(store: dict[str, dict], value: str, kind: str, page: str) -> None:
    value = norm(value)
    if useful(value):
        row = store.setdefault(value, {'text': value, 'kinds': set(), 'pages': set()})
        row['kinds'].add(kind)
        row['pages'].add(page)


def script_strings(code: str) -> list[str]:
    found = []
    for match in re.finditer(r"(?P<q>`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\")", code, re.S):
        raw = match.group('q')
        val = raw[1:-1]
        val = re.sub(r'\\([`\'\"\\])', r'\1', val)
        if useful(val) and (CJK_RE.search(val) or re.search(r'\b(?:error|complete|ready|failed|calculate|result|status|choose|enter|invalid|download|upload|clear|save|risk|return|drawdown|strategy|portfolio|volatility|correlation|warning|success|loading|no data)\b', val, re.I)):
            found.append(val)
    return found


def pages() -> list[Path]:
    result = []
    for base in INCLUDE:
        if base.is_file():
            result.append(base)
        elif base.is_dir():
            result.extend(p for p in base.rglob('*.html') if not (set(p.relative_to(ROOT).parts) & EXCLUDE_DIRS))
    return sorted(set(result))


store: dict[str, dict] = {}
selected = pages()
for path in selected:
    rel = path.relative_to(ROOT).as_posix()
    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='replace'), 'html.parser')
    for tag in soup.find_all(True):
        if tag.name in EXCLUDE_TAGS or any(parent.name in EXCLUDE_TAGS for parent in tag.parents):
            continue
        for child in tag.children:
            if isinstance(child, NavigableString) and norm(str(child)):
                add(store, str(child), 'text', rel)
        for attr in ATTRS:
            value = tag.get(attr)
            if isinstance(value, str):
                add(store, value, f'attr:{attr}', rel)
    for script in soup.find_all('script'):
        if script.get('src'):
            src = (path.parent / script['src']).resolve()
            if src.exists() and ROOT in src.parents:
                for value in script_strings(src.read_text(encoding='utf-8', errors='ignore')):
                    add(store, value, 'dynamic-script', rel)
        else:
            for value in script_strings(script.string or script.get_text()):
                add(store, value, 'dynamic-script', rel)

rows = []
for idx, key in enumerate(sorted(store), 1):
    row = store[key]
    rows.append({'id': idx, 'text': row['text'], 'kinds': sorted(row['kinds']), 'pages': sorted(row['pages'])})

out = ROOT / 'i18n-source-catalog.json'
out.write_text(json.dumps({'sourceLanguage': 'zh-TW', 'pageCount': len(selected), 'strings': rows}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'pages': len(selected), 'strings': len(rows), 'chars': sum(len(r['text']) for r in rows), 'output': str(out)}, ensure_ascii=False))
