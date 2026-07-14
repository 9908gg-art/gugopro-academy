import os
import re

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
    ("tools/compound-interest.html", "../")
]

for rel_path, prefix in files_to_update:
    filepath = os.path.join(root_dir, rel_path)
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - does not exist")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to find the <div class="footer-links">...</div> block
    # and make sure it has the privacy-policy.html and terms-of-service.html links.
    # Let's use regex to find the footer-links div content
    pattern = r'(<div class="footer-links">)(.*?)(</div>)'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        links_content = match.group(2)
        # Check if privacy-policy is already in links
        if "privacy-policy.html" not in links_content:
            new_links = links_content.rstrip() + f'\n            <a href="{prefix}privacy-policy.html">隱私權政策</a>' + f'\n            <a href="{prefix}terms-of-service.html">免責聲明與使用條款</a>\n        '
            new_div = match.group(1) + new_links + match.group(3)
            new_content = content.replace(match.group(0), new_div)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Successfully updated footer links for {rel_path}")
        else:
            print(f"Footer links already updated for {rel_path}")
    else:
        print(f"ERROR: Could not find footer-links div in {rel_path}")
