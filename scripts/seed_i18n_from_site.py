#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ACADEMY = Path('/home/ubuntu/gugopro-academy')
SITE = Path('/home/ubuntu/gugopro-site')
LOCALES = ['zh-TW', 'zh-CN', 'en', 'ja', 'de', 'fr', 'es', 'pt']

academy_source = json.loads((ACADEMY / 'i18n-source-catalog.json').read_text(encoding='utf-8'))
site_catalog = json.loads((SITE / 'i18n/catalog.json').read_text(encoding='utf-8'))
site_by_text = {row['text']: row for row in site_catalog.get('strings', [])}
out = ACADEMY / 'i18n'
out.mkdir(exist_ok=True)
(out / 'catalog.json').write_text(json.dumps({
    'sourceLanguage': 'zh-TW',
    'catalogVersion': 1,
    'pageCount': academy_source.get('pageCount', 0),
    'strings': academy_source['strings'],
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

for locale in LOCALES:
    source_map = {str(row['id']): row['text'] for row in academy_source['strings']}
    if locale == 'zh-TW':
        translations = source_map
    else:
        source_pack = json.loads((SITE / f'i18n/{locale}.json').read_text(encoding='utf-8'))
        site_translations = source_pack.get('translations', {})
        translations = {}
        for row in academy_source['strings']:
            site_row = site_by_text.get(row['text'])
            if site_row and str(site_row['id']) in site_translations:
                translations[str(row['id'])] = site_translations[str(site_row['id'])]
    (out / f'{locale}.json').write_text(json.dumps({
        'sourceLanguage': 'zh-TW',
        'targetLanguage': locale,
        'catalogVersion': 1,
        'translations': translations,
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(locale, len(translations), '/', len(academy_source['strings']))
