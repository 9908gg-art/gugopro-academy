from __future__ import annotations

import csv
import json
from datetime import date
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
BASE_RAW = 'https://raw.githubusercontent.com/JerBouma/FinanceDatabase/main/database'
API_BASE = 'https://api.github.com/repos/JerBouma/FinanceDatabase/contents/database'
EXCHANGE_FLAGS = {
    'NMS': '🇺🇸', 'NYQ': '🇺🇸', 'PCX': '🇺🇸', 'PNK': '🇺🇸', 'NAS': '🇺🇸', 'CME': '🇺🇸',
    'TAI': '🇹🇼', 'TWO': '🇹🇼', 'TAIFEX': '🇹🇼', 'JPX': '🇯🇵', 'HKG': '🇭🇰', 'SHH': '🇨🇳',
    'SHZ': '🇨🇳', 'KSC': '🇰🇷', 'KLS': '🇲🇾', 'SET': '🇹🇭', 'SGO': '🇸🇬', 'NSE': '🇮🇳',
    'BSE': '🇮🇳', 'ASX': '🇦🇺', 'NZE': '🇳🇿', 'TOR': '🇨🇦', 'CNQ': '🇨🇦', 'LSE': '🇬🇧',
    'FRA': '🇩🇪', 'GER': '🇩🇪', 'AMS': '🇳🇱', 'PAR': '🇫🇷', 'MIL': '🇮🇹', 'STO': '🇸🇪',
    'OSL': '🇳🇴', 'SAO': '🇧🇷', 'JKT': '🇮🇩', 'BUD': '🇭🇺', 'IST': '🇹🇷', 'JSE': '🇿🇦',
    'KAR': '🇮🇳', 'MEX': '🇲🇽',
}
EXCHANGE_NAMES = {
    'NMS': 'NASDAQ', 'NYQ': 'NYSE', 'PCX': 'NYSE Arca', 'PNK': 'OTC', 'NAS': 'NASDAQ',
    'TAI': 'TWSE', 'TWO': 'TPEx', 'JPX': 'JPX', 'HKG': 'HKEX', 'SHH': 'SSE', 'SHZ': 'SZSE',
    'KSC': 'KOSDAQ', 'KLS': 'Bursa Malaysia', 'SET': 'SET Thailand', 'SGO': 'SGX',
    'NSE': 'NSE India', 'BSE': 'BSE India', 'ASX': 'ASX', 'NZE': 'NZX', 'TOR': 'TSX',
    'CNQ': 'CSE', 'LSE': 'LSE', 'FRA': 'Frankfurt', 'GER': 'Xetra', 'AMS': 'Euronext Amsterdam',
    'PAR': 'Euronext Paris', 'MIL': 'Borsa Italiana', 'STO': 'Nasdaq Stockholm', 'OSL': 'Oslo Børs',
    'SAO': 'B3 Brazil', 'JKT': 'IDX Indonesia', 'CME': 'CME', 'TAIFEX': 'TAIFEX',
}


def get(url: str) -> bytes:
    request = Request(url, headers={'User-Agent': 'GugoPro-Academy global catalog builder'})
    with urlopen(request, timeout=60) as response:
        return response.read()


def clean(value: object) -> str:
    return str(value or '').strip()


def valid_symbol(symbol: str) -> bool:
    return bool(symbol) and len(symbol) <= 64 and not symbol.lower().startswith('file creation time')


def list_csv(path: str) -> list[str]:
    payload = json.loads(get(f'{API_BASE}/{path}?ref=main'))
    return sorted(item['name'][:-4] for item in payload if item.get('type') == 'file' and item.get('name', '').endswith('.csv'))


def exchange_meta(code: str, country: str = '') -> tuple[str, str]:
    return EXCHANGE_NAMES.get(code, code or 'PUBLIC'), EXCHANGE_FLAGS.get(code, '🌐') if not country else EXCHANGE_FLAGS.get(code, '🌐')


def put(entries: dict[str, dict], item: dict, asset_type: str, exchange_code: str = '') -> None:
    symbol = clean(item.get('symbol') or item.get('Symbol') or item.get('ticker')).upper()
    if not valid_symbol(symbol) or clean(item.get('delisted')).lower() in {'true', '1', 'yes', 'y'}:
        return
    source_category = {'equities': 'stocks', 'etfs': 'stocks', 'funds': 'funds', 'indices': 'indices', 'moneymarkets': 'moneymarkets', 'forex': 'forex', 'crypto': 'crypto'}[asset_type]
    name = clean(item.get('name') or item.get('Security Name') or item.get('description')) or symbol
    exchange_code = clean(item.get('exchange')) or exchange_code
    exchange_name, flag = exchange_meta(exchange_code, clean(item.get('country')))
    market = clean(item.get('market') or item.get('category') or item.get('category_group'))
    if source_category == 'stocks':
        market = '股票／ETF' if asset_type == 'equities' else 'ETF'
    elif source_category == 'indices':
        market = clean(item.get('category')) or '全球指數'
    elif source_category == 'funds':
        market = clean(item.get('category')) or '共同基金'
    elif source_category == 'moneymarkets':
        market = '貨幣市場基金'
    key = f'{source_category}:{symbol}:{exchange_code}:{asset_type}'
    entries[key] = {
        'symbol': symbol,
        'name': name,
        'market': market or {'forex': '外匯', 'crypto': '加密貨幣'}.get(source_category, '全球商品'),
        'modalCategory': source_category,
        'exchange': exchange_name,
        'country': flag,
        'badge': symbol.replace('.', '').replace('-', '')[:4],
        'isin': clean(item.get('isin')),
        'source': 'FinanceDatabase',
        'assetType': asset_type,
    }


def read_exchange(asset_type: str, code: str, entries: dict[str, dict]) -> None:
    raw = get(f'{BASE_RAW}/{asset_type}/{quote(code)}.csv').decode('utf-8-sig', errors='replace')
    for row in csv.DictReader(raw.splitlines()):
        put(entries, row, asset_type, code)
    print(f'loaded {asset_type}/{code}.csv')


def read_flat(asset_type: str, filename: str, entries: dict[str, dict]) -> None:
    raw = get(f'{BASE_RAW}/{filename}').decode('utf-8-sig', errors='replace')
    for row in csv.DictReader(raw.splitlines()):
        symbol = clean(row.get('symbol')).upper()
        if not valid_symbol(symbol):
            continue
        if asset_type == 'forex':
            base = clean(row.get('base_currency'))
            quote_currency = clean(row.get('quote_currency'))
            put(entries, {'symbol': symbol.replace('=X', ''), 'name': f'{base}/{quote_currency}' if base and quote_currency else clean(row.get('name')), 'market': '外匯', 'exchange': 'FX'}, 'forex', 'FX')
        elif asset_type == 'crypto':
            put(entries, {'symbol': symbol, 'name': clean(row.get('name')), 'market': '加密貨幣'}, 'crypto', 'CRYPTO')
            key = f'crypto:{symbol}:CRYPTO:crypto'
            if key in entries:
                entries[key]['country'] = '🪙'
                entries[key]['badge'] = symbol.split('-')[0][:4]
                entries[key]['binance'] = bool(symbol.endswith('USDT') and '-' not in symbol)
        else:
            put(entries, row, asset_type, clean(row.get('exchange')))


def write_shard(category: str, entries: list[dict]) -> None:
    entries.sort(key=lambda item: (item['symbol'], item.get('exchange', ''), item.get('name', '')))
    result = {
        'version': f'{date.today().isoformat()}-financedatabase-complete',
        'source': 'FinanceDatabase (MIT License)',
        'sourceUrl': 'https://github.com/JerBouma/FinanceDatabase',
        'generatedAt': date.today().isoformat(),
        'category': category,
        'count': len(entries),
        'entries': entries,
    }
    path = ROOT / f'global-symbol-catalog-{category}.json'
    path.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'wrote {path.name}: {len(entries)}')


all_entries: dict[str, dict] = {}
for code in list_csv('equities'):
    read_exchange('equities', code, all_entries)
for code in list_csv('etfs'):
    read_exchange('etfs', code, all_entries)
for code in list_csv('funds'):
    read_exchange('funds', code, all_entries)
read_flat('indices', 'indices.csv', all_entries)
read_flat('moneymarkets', 'moneymarkets.csv', all_entries)
read_flat('forex', 'currencies.csv', all_entries)
read_flat('crypto', 'cryptos.csv', all_entries)
by_category: dict[str, list[dict]] = {}
for entry in all_entries.values():
    by_category.setdefault(entry['modalCategory'], []).append(entry)
for category, entries in sorted(by_category.items()):
    write_shard(category, entries)
print(f'total={len(all_entries)} categories={ {key: len(value) for key, value in sorted(by_category.items())} }')
