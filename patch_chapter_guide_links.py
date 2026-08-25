import re
from collections import defaultdict
from pathlib import Path

from chapter_tool_specs import TOOLS

ROOT = Path(__file__).parent
by_guide = defaultdict(list)
for tool in TOOLS:
    by_guide[tool['guide']].append(tool)


def inline(tool):
    return f'<p class="guide-inline-tool-link" data-chapter-inline-tool><a href="../tools/{tool["file"]}"><i class="fa-solid fa-calculator"></i> 使用「{tool["title"]}」</a>：{tool["description"]}</p>'


def cta(tool):
    return f'<div class="guide-practice-card chapter-tool-cta" data-chapter-tool-cta><div><span class="section-kicker">CHAPTER PRACTICE DESK</span><h3>把本章的「{tool["label"]}」放進可操作工具</h3><p>{tool["description"]} 請先以原始文件或自己的紀錄核對輸入，再閱讀公式、圖表與限制。</p></div><a class="button button-light" href="../tools/{tool["file"]}">立即開啟工具 <i class="fa-solid fa-arrow-right"></i></a></div>'


for guide, tools in by_guide.items():
    path = ROOT / 'guides' / guide
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'<p class="guide-inline-tool-link" data-chapter-inline-tool>.*?</p>', '', text, flags=re.S)
    text = re.sub(r'<div class="guide-practice-card chapter-tool-cta" data-chapter-tool-cta>.*?</div>\s*</div>', '', text, flags=re.S)
    for tool in tools:
        marker = f'<section id="{tool["chapter"]}"'
        start = text.find(marker)
        if start < 0:
            raise SystemExit(f'missing chapter {tool["chapter"]} in {guide}')
        end = text.find('</section>', start)
        if end < 0:
            raise SystemExit(f'missing section close for {tool["chapter"]} in {guide}')
        injection = inline(tool) + cta(tool)
        text = text[:end] + injection + text[end:]
    path.write_text(text, encoding='utf-8')
    print('patched', guide, len(tools), 'chapter tools')

print('done')
