import os
import re

root_dir = "/root/gugopro-academy"

files_to_update = [
    ("index.html", "tools/"),
    ("privacy-policy.html", "tools/"),
    ("terms-of-service.html", "tools/"),
    ("fundamentals/index.html", "../tools/"),
    ("stocks/index.html", "../tools/"),
    ("stocks/dividend-strategy.html", "../tools/"),
    ("futures/index.html", "../tools/"),
    ("futures/futures-basics.html", "../tools/"),
    ("quant/index.html", "../tools/"),
    ("quant/pair-trading.html", "../tools/"),
    ("quant/legendary-traders.html", "../tools/"),
    ("tools/compound-interest.html", ""),
    ("tools/tradingview-guide.html", "")
]

for rel_path, prefix in files_to_update:
    filepath = os.path.join(root_dir, rel_path)
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - does not exist")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Search for the tools-dropdown div block
    pattern = r'(<div class="tools-dropdown">)(.*?)(</div>)'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        # Create updated dropdown html
        new_dropdown_content = f'\n                    <a href="{prefix}compound-interest.html">高殖利率複利計算機</a>' + \
                               f'\n                    <a href="{prefix}tradingview-guide.html">TradingView 推薦註冊</a>' + \
                               f'\n                    <a href="#" style="opacity: 0.6;" onclick="event.preventDefault(); alert(\'本工具正在開發中，敬請期待！\');">大師選股篩選器 (Coming Soon)</a>' + \
                               f'\n                    <a href="#" style="opacity: 0.6;" onclick="event.preventDefault(); alert(\'本工具正在開發中，敬請期待！\');">Z-Score 價差分析儀 (Coming Soon)</a>\n                '
        
        new_div = match.group(1) + new_dropdown_content + match.group(3)
        new_content = content.replace(match.group(0), new_div)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully updated tools dropdown for {rel_path}")
    else:
        print(f"ERROR: Could not find tools-dropdown div in {rel_path}")
