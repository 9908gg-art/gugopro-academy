#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path
from typing import Callable

from opencc import OpenCC

try:
    import argostranslate.translate as argos_translate
except Exception as exc:  # pragma: no cover
    argos_translate = None
    ARGOS_ERROR = exc

ACADEMY = Path(__file__).resolve().parents[1]
SITE = Path('/home/ubuntu/gugopro-site')
LOCALES = ['zh-TW', 'zh-CN', 'en', 'ja', 'de', 'fr', 'es', 'pt']
SOURCE_LOCALE = 'zh-TW'

# These terms are intentionally protected/standardized. They are applied longest-first.
GLOSSARY = {
    '財經學院': {'zh-CN': '财经学院', 'en': 'Finance Academy', 'ja': 'ファイナンス・アカデミー', 'de': 'Finanzakademie', 'fr': 'Académie de finance', 'es': 'Academia de Finanzas', 'pt': 'Academia de Finanças'},
    '投資': {'zh-CN': '投资', 'en': 'Investing', 'ja': '投資', 'de': 'Investieren', 'fr': 'Investissement', 'es': 'Inversión', 'pt': 'Investimentos'},
    '工具': {'zh-CN': '工具', 'en': 'Tools', 'ja': 'ツール', 'de': 'Tools', 'fr': 'Outils', 'es': 'Herramientas', 'pt': 'Ferramentas'},
    '計算器': {'zh-CN': '计算器', 'en': 'Calculator', 'ja': '計算機', 'de': 'Rechner', 'fr': 'Calculateur', 'es': 'Calculadora', 'pt': 'Calculadora'},
    '試算工具': {'zh-CN': '试算工具', 'en': 'Calculator', 'ja': '計算ツール', 'de': 'Rechner', 'fr': 'Outil de calcul', 'es': 'Calculadora', 'pt': 'Calculadora'},
    '風險': {'zh-CN': '风险', 'en': 'Risk', 'ja': 'リスク', 'de': 'Risiko', 'fr': 'Risque', 'es': 'Riesgo', 'pt': 'Risco'},
    '報酬': {'zh-CN': '回报', 'en': 'Return', 'ja': 'リターン', 'de': 'Rendite', 'fr': 'Rendement', 'es': 'Rentabilidad', 'pt': 'Retorno'},
    '回撤': {'zh-CN': '回撤', 'en': 'Drawdown', 'ja': 'ドローダウン', 'de': 'Drawdown', 'fr': 'Drawdown', 'es': 'Drawdown', 'pt': 'Drawdown'},
    '波動度': {'zh-CN': '波动率', 'en': 'Volatility', 'ja': 'ボラティリティ', 'de': 'Volatilität', 'fr': 'Volatilité', 'es': 'Volatilidad', 'pt': 'Volatilidade'},
    '相關係數': {'zh-CN': '相关系数', 'en': 'Correlation', 'ja': '相関係数', 'de': 'Korrelation', 'fr': 'Corrélation', 'es': 'Correlación', 'pt': 'Correlação'},
    '相關性': {'zh-CN': '相关性', 'en': 'Correlation', 'ja': '相関', 'de': 'Korrelation', 'fr': 'Corrélation', 'es': 'Correlación', 'pt': 'Correlação'},
    '均線': {'zh-CN': '均线', 'en': 'Moving Average', 'ja': '移動平均線', 'de': 'Gleitender Durchschnitt', 'fr': 'Moyenne mobile', 'es': 'Media móvil', 'pt': 'Média móvel'},
    '除權息': {'zh-CN': '除权除息', 'en': 'Ex-dividend', 'ja': '権利落ち', 'de': 'Ex-Dividende', 'fr': 'Détachement du dividende', 'es': 'Exdividendo', 'pt': 'Ex-dividendo'},
    '本益比': {'zh-CN': '市盈率', 'en': 'P/E Ratio', 'ja': 'PER', 'de': 'KGV', 'fr': 'Ratio cours/bénéfice', 'es': 'Ratio P/E', 'pt': 'Índice P/L'},
    '殖利率': {'zh-CN': '股息率', 'en': 'Dividend Yield', 'ja': '配当利回り', 'de': 'Dividendenrendite', 'fr': 'Rendement du dividende', 'es': 'Rentabilidad por dividendo', 'pt': 'Dividend yield'},
    '債券': {'zh-CN': '债券', 'en': 'Bonds', 'ja': '債券', 'de': 'Anleihen', 'fr': 'Obligations', 'es': 'Bonos', 'pt': 'Obrigações'},
    '基金': {'zh-CN': '基金', 'en': 'Funds', 'ja': 'ファンド', 'de': 'Fonds', 'fr': 'Fonds', 'es': 'Fondos', 'pt': 'Fundos'},
    '外匯': {'zh-CN': '外汇', 'en': 'Forex', 'ja': '外国為替', 'de': 'Forex', 'fr': 'Forex', 'es': 'Forex', 'pt': 'Forex'},
    '原物料': {'zh-CN': '大宗商品', 'en': 'Commodities', 'ja': 'コモディティ', 'de': 'Rohstoffe', 'fr': 'Matières premières', 'es': 'Materias primas', 'pt': 'Commodities'},
    '期貨': {'zh-CN': '期货', 'en': 'Futures', 'ja': '先物', 'de': 'Futures', 'fr': 'Contrats à terme', 'es': 'Futuros', 'pt': 'Futuros'},
    '選擇權': {'zh-CN': '期权', 'en': 'Options', 'ja': 'オプション', 'de': 'Optionen', 'fr': 'Options', 'es': 'Opciones', 'pt': 'Opções'},
    '虛擬貨幣': {'zh-CN': '虚拟货币', 'en': 'Cryptocurrency', 'ja': '暗号資産', 'de': 'Kryptowährungen', 'fr': 'Cryptomonnaies', 'es': 'Criptomonedas', 'pt': 'Criptomoedas'},
    '房地產': {'zh-CN': '房地产', 'en': 'Real Estate', 'ja': '不動産', 'de': 'Immobilien', 'fr': 'Immobilier', 'es': 'Bien immobilier', 'pt': 'Imobiliário'},
    '總體經濟': {'zh-CN': '宏观经济', 'en': 'Macroeconomics', 'ja': 'マクロ経済', 'de': 'Makroökonomie', 'fr': 'Macroéconomie', 'es': 'Macroeconomía', 'pt': 'Macroeconomia'},
    '實戰交易': {'zh-CN': '实战交易', 'en': 'Trading Strategy', 'ja': '実践トレード', 'de': 'Trading-Praxis', 'fr': 'Trading pratique', 'es': 'Trading práctico', 'pt': 'Trading prático'},
    '籌碼': {'zh-CN': '筹码', 'en': 'Market Positioning', 'ja': '需給', 'de': 'Marktpositionierung', 'fr': 'Positionnement du marché', 'es': 'Posicionamiento del mercado', 'pt': 'Posicionamento de mercado'},
    '法人': {'zh-CN': '机构投资者', 'en': 'Institutional Investors', 'ja': '機関投資家', 'de': 'Institutionelle Anleger', 'fr': 'Investisseurs institutionnels', 'es': 'Inversores institucionales', 'pt': 'Investidores institucionais'},
    '買賣超': {'zh-CN': '买卖超', 'en': 'Net Buying/Selling', 'ja': '売買差額', 'de': 'Netto-Käufe/-Verkäufe', 'fr': 'Achats/ventes nets', 'es': 'Compras/ventas netas', 'pt': 'Compras/vendas líquidas'},
    '部位管理': {'zh-CN': '仓位管理', 'en': 'Position Sizing', 'ja': 'ポジション管理', 'de': 'Positionsgrößenmanagement', 'fr': 'Gestion de la taille de position', 'es': 'Gestión del tamaño de posición', 'pt': 'Dimensionamento de posição'},
    '移動停損': {'zh-CN': '移动止损', 'en': 'Trailing Stop', 'ja': 'トレーリングストップ', 'de': 'Trailing-Stop', 'fr': 'Stop suiveur', 'es': 'Stop dinámico', 'pt': 'Stop móvel'},
    '網格交易': {'zh-CN': '网格交易', 'en': 'Grid Trading', 'ja': 'グリッド取引', 'de': 'Grid-Trading', 'fr': 'Grid Trading', 'es': 'Grid Trading', 'pt': 'Grid Trading'},
    '配對交易': {'zh-CN': '配对交易', 'en': 'Pairs Trading', 'ja': 'ペアトレード', 'de': 'Pairs Trading', 'fr': 'Pairs Trading', 'es': 'Trading de pares', 'pt': 'Pairs Trading'},
    '套利': {'zh-CN': '套利', 'en': 'Arbitrage', 'ja': 'アービトラージ', 'de': 'Arbitrage', 'fr': 'Arbitrage', 'es': 'Arbitraje', 'pt': 'Arbitragem'},
    '價差': {'zh-CN': '价差', 'en': 'Spread', 'ja': 'スプレッド', 'de': 'Spread', 'fr': 'Spread', 'es': 'Spread', 'pt': 'Spread'},
    '期現套利': {'zh-CN': '期现套利', 'en': 'Cash-and-carry arbitrage', 'ja': '現物・先物アービトラージ', 'de': 'Cash-and-Carry-Arbitrage', 'fr': 'Arbitrage cash-and-carry', 'es': 'Arbitraje cash-and-carry', 'pt': 'Arbitragem cash-and-carry'},
    '資料': {'zh-CN': '数据', 'en': 'Data', 'ja': 'データ', 'de': 'Daten', 'fr': 'Données', 'es': 'Datos', 'pt': 'Dados'},
    '結果': {'zh-CN': '结果', 'en': 'Result', 'ja': '結果', 'de': 'Ergebnis', 'fr': 'Résultat', 'es': 'Resultado', 'pt': 'Resultado'},
    '計算': {'zh-CN': '计算', 'en': 'Calculation', 'ja': '計算', 'de': 'Berechnung', 'fr': 'Calcul', 'es': 'Cálculo', 'pt': 'Cálculo'},
    '查詢': {'zh-CN': '查询', 'en': 'Lookup', 'ja': '検索', 'de': 'Abfrage', 'fr': 'Recherche', 'es': 'Consulta', 'pt': 'Consulta'},
    '輸入': {'zh-CN': '输入', 'en': 'Enter', 'ja': '入力', 'de': 'Eingabe', 'fr': 'Saisir', 'es': 'Introducir', 'pt': 'Inserir'},
    '無效': {'zh-CN': '无效', 'en': 'Invalid', 'ja': '無効', 'de': 'Ungültig', 'fr': 'Invalide', 'es': 'No válido', 'pt': 'Inválido'},
    '錯誤': {'zh-CN': '错误', 'en': 'Error', 'ja': 'エラー', 'de': 'Fehler', 'fr': 'Erreur', 'es': 'Error', 'pt': 'Erro'},
    '儲存': {'zh-CN': '保存', 'en': 'Save', 'ja': '保存', 'de': 'Speichern', 'fr': 'Enregistrer', 'es': 'Guardar', 'pt': 'Salvar'},
    '載入': {'zh-CN': '加载', 'en': 'Load', 'ja': '読み込み', 'de': 'Laden', 'fr': 'Charger', 'es': 'Cargar', 'pt': 'Carregar'},
    '全部': {'zh-CN': '全部', 'en': 'All', 'ja': 'すべて', 'de': 'Alle', 'fr': 'Tous', 'es': 'Todos', 'pt': 'Todos'},
    '分類': {'zh-CN': '分类', 'en': 'Category', 'ja': 'カテゴリ', 'de': 'Kategorie', 'fr': 'Catégorie', 'es': 'Categoría', 'pt': 'Categoria'},
    '警示': {'zh-CN': '警示', 'en': 'Alert', 'ja': '警告', 'de': 'Warnung', 'fr': 'Alerte', 'es': 'Alerta', 'pt': 'Alerta'},
    '免責聲明': {'zh-CN': '免责声明', 'en': 'Disclaimer', 'ja': '免責事項', 'de': 'Haftungsausschluss', 'fr': 'Avertissement', 'es': 'Aviso legal', 'pt': 'Aviso legal'},
    '僅供教育': {'zh-CN': '仅供教育', 'en': 'For educational purposes only', 'ja': '教育目的のみ', 'de': 'Nur zu Bildungszwecken', 'fr': 'À des fins éducatives uniquement', 'es': 'Solo con fines educativos', 'pt': 'Apenas para fins educacionais'},
}

TOKEN_RE = re.compile(r'(\$\{(?:\\.|[^}])*\}|\{\{.*?\}\}|https?://[^\s<]+|<[^>]*>|`[^`]*`|\b(?:HTML|CSS|JS|JSON|CSV|HTTP|SVG|DOM|API|URL|RWD|Beta|Z-Score|Grid Trading|Futures|Arbitrage|ETF|DCF|MACD|RSI|KDJ|ATR|P/E|PEG)\b)', re.I | re.S)
CJK_RE = re.compile(r'[\u3400-\u9fff]')


def load_json(path: Path, default=None):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding='utf-8'))


def normalize(value: str) -> str:
    return ' '.join(str(value).replace('\xa0', ' ').split())


def is_codeish(text: str, kinds: list[str]) -> bool:
    if 'dynamic-script' not in kinds:
        return False
    return bool(re.search(r'\$\{|=>|\b(?:function|const|let|var|document|querySelector|innerHTML|textContent|classList)\b|<[^>]+>', text))


def protect_tokens(text: str) -> tuple[str, dict[str, str]]:
    tokens: dict[str, str] = {}
    def replace(match: re.Match[str]) -> str:
        key = f'__GUGO_TOKEN_{len(tokens)}__'
        tokens[key] = match.group(0)
        return f' {key} '
    return TOKEN_RE.sub(replace, text), tokens


def restore_tokens(text: str, tokens: dict[str, str]) -> str:
    output = text
    for key, value in tokens.items():
        output = output.replace(key, value)
    return output


def glossary_translate(text: str, locale: str) -> str:
    output = text
    for source in sorted(GLOSSARY, key=len, reverse=True):
        output = output.replace(source, GLOSSARY[source].get(locale, source))
    return output


def make_argos_en(text: str) -> str:
    if not argos_translate:
        return text
    protected, tokens = protect_tokens(text)
    try:
        translated = argos_translate.translate(protected, 'zh', 'en')
    except Exception:
        return text
    return restore_tokens(translated, tokens).strip()


def build_site_seed() -> dict[str, dict[str, str]]:
    seed: dict[str, dict[str, str]] = {locale: {} for locale in LOCALES}
    catalog = load_json(SITE / 'i18n/catalog.json', {'strings': []})
    by_text = {row['text']: str(row['id']) for row in catalog.get('strings', [])}
    for locale in LOCALES:
        pack = load_json(SITE / f'i18n/{locale}.json', {'translations': {}})
        translations = pack.get('translations', {})
        for text, key in by_text.items():
            if key in translations:
                seed[locale][text] = translations[key]
    phrases = load_json(SITE / 'i18n/phrases.json', {'phrases': {}}).get('phrases', {})
    for source, locale_map in phrases.items():
        for locale in LOCALES:
            if locale in locale_map:
                seed[locale][source] = locale_map[locale]
    return seed


def translate_row(row: dict, locale: str, site_seed: dict[str, dict[str, str]], cc: OpenCC) -> tuple[str, str]:
    source = row['text']
    kinds = row.get('kinds', [])
    if locale == SOURCE_LOCALE:
        return source, 'source'
    if source in site_seed.get(locale, {}):
        return site_seed[locale][source], 'reused-site'
    if not CJK_RE.search(source):
        return source, 'protected-international'
    if locale == 'zh-CN':
        return glossary_translate(cc.convert(source), locale), 'opencc-glossary'
    if locale == 'en' and not is_codeish(source, kinds):
        translated = make_argos_en(source)
        return glossary_translate(translated, locale), 'argos-zh-en'
    if is_codeish(source, kinds):
        return source, 'protected-code'
    # Low-fidelity but deterministic fallback for locales without a local model.
    drafted = glossary_translate(source, locale)
    if drafted != source:
        return drafted, 'glossary-draft'
    return source, 'source-fallback'


def generate_pack(catalog: dict, locale: str, site_seed: dict[str, dict[str, str]], cc: OpenCC, out: Path) -> None:
    translations: dict[str, str] = {}
    methods: dict[str, int] = {}
    total = len(catalog['strings'])
    started = time.time()
    for index, row in enumerate(catalog['strings'], 1):
        value, method = translate_row(row, locale, site_seed, cc)
        translations[str(row['id'])] = value
        methods[method] = methods.get(method, 0) + 1
        if locale == 'en' and index % 100 == 0:
            print(f'{locale}: {index}/{total} ({time.time() - started:.1f}s)', flush=True)
    fallback = methods.get('source-fallback', 0) + methods.get('protected-code', 0)
    payload = {
        'sourceLanguage': SOURCE_LOCALE,
        'targetLanguage': locale,
        'catalogVersion': catalog.get('catalogVersion', 1),
        'translationStatus': 'machine-draft',
        'reviewRequired': True,
        'generatedBy': 'local-argos-zh-en-plus-glossary-fallback',
        'glossaryVersion': 1,
        'translationMethods': methods,
        'translatedKeyCount': total - fallback,
        'fallbackKeyCount': fallback,
        'translations': translations,
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{locale}: wrote {total} keys, methods={methods}', flush=True)


def main() -> int:
    catalog = load_json(ACADEMY / 'i18n/catalog.json')
    if not catalog or not catalog.get('strings'):
        raise SystemExit('Academy i18n/catalog.json is missing or empty; run seed_i18n_from_site.py first')
    site_seed = build_site_seed()
    cc = OpenCC('t2s')
    out = ACADEMY / 'i18n'
    out.mkdir(exist_ok=True)
    glossary_payload = {
        'sourceLanguage': SOURCE_LOCALE,
        'targetLanguages': LOCALES,
        'version': 1,
        'status': 'machine-draft',
        'protectedTerms': sorted(GLOSSARY),
        'note': 'Glossary terms are standardized before machine-draft output; native-finance review remains required.',
    }
    (out / 'glossary.json').write_text(json.dumps(glossary_payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for locale in LOCALES:
        generate_pack(catalog, locale, site_seed, cc, out / f'{locale}.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
