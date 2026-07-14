import os

root_dir = "/root/gugopro-academy"
ga_id = "G-GF1DYLWMKX"

files_to_update = [
    "index.html",
    "privacy-policy.html",
    "terms-of-service.html",
    "fundamentals/index.html",
    "stocks/index.html",
    "stocks/dividend-strategy.html",
    "futures/index.html",
    "futures/futures-basics.html",
    "quant/index.html",
    "quant/pair-trading.html",
    "quant/legendary-traders.html",
    "tools/compound-interest.html"
]

ga_script = f"""<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={ga_id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', '{ga_id}');
    </script>"""

for rel_path in files_to_update:
    filepath = os.path.join(root_dir, rel_path)
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - does not exist")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if Google tag is already added
    if "googletagmanager.com" in content:
        print(f"GA4 tag already exists in {rel_path}, skipping")
        continue

    # Replace <head> with <head> + GA4 script
    if "<head>" in content:
        new_content = content.replace("<head>", ga_script)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully injected GA4 tag into {rel_path}")
    else:
        print(f"ERROR: Could not find <head> in {rel_path}")
