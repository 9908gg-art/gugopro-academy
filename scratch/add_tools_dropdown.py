import os

root_dir = "/root/gugopro-academy"

files_to_update = [
    ("index.html", ""),
    ("fundamentals/index.html", "../"),
    ("stocks/index.html", "../"),
    ("stocks/dividend-strategy.html", "../"),
    ("futures/index.html", "../"),
    ("futures/futures-basics.html", "../"),
    ("quant/index.html", "../"),
    ("quant/pair-trading.html", "../"),
    ("quant/legendary-traders.html", "../"),
    ("tools/compound-interest.html", "")  # inside tools/ it should point to compound-interest.html
]

for rel_path, prefix in files_to_update:
    filepath = os.path.join(root_dir, rel_path)
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - does not exist")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Skip if tools-selector is already added
    if "tools-selector" in content:
        print(f"Tools selector already exists in {rel_path}, skipping")
        continue

    # Define the link to compound-interest.html
    if rel_path.startswith("tools/"):
        tool_link = "compound-interest.html"
    else:
        tool_link = f"{prefix}tools/compound-interest.html"

    tools_dropdown_html = f"""<!-- Tools Selector -->
            <div class="tools-selector">
                <button class="tools-btn">
                    <i class="fa-solid fa-screwdriver-wrench"></i> 實戰工具 / Tools <i class="fa-solid fa-caret-down"></i>
                </button>
                <div class="tools-dropdown">
                    <a href="{tool_link}">高殖利率複利計算機</a>
                    <a href="#" style="opacity: 0.6;" onclick="event.preventDefault(); alert('本工具正在開發中，敬請期待！');">大師選股篩選器 (Coming Soon)</a>
                    <a href="#" style="opacity: 0.6;" onclick="event.preventDefault(); alert('本工具正在開發中，敬請期待！');">Z-Score 價差分析儀 (Coming Soon)</a>
                </div>
            </div>
            
            <!-- Language Selector -->"""

    # Look for <!-- Language Selector --> to replace
    target = "<!-- Language Selector -->"
    if target in content:
        new_content = content.replace(target, tools_dropdown_html)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully added tools selector to {rel_path}")
    else:
        print(f"ERROR: Could not find target in {rel_path}")
