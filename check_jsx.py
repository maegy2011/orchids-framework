import sys
import re

def check_balance(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    # Find tags
    # Simplified regex for tags, ignoring self-closing tags
    # <tag ... >
    # </tag>
    # Ignore <br/>, <img/> etc.
    tags = re.findall(r'<(?!/)([a-zA-Z0-9\.]+)(?:\s+[^>]*?|)/?>|</([a-zA-Z0-9\.]+)>', content)
    
    stack = []
    for open_tag, close_tag in tags:
        if open_tag:
            # Check if self-closing
            # The regex finds <tag ... /> too, but we need to check if it ends with />
            # Actually the regex above might be too simple.
            pass
        
    # Better approach: find all occurrences of <Tag or </Tag
    # But need to handle self-closing tags <Tag />
    
    # Let's just count divs, buttons, main
    divs_open = content.count('<div')
    divs_close = content.count('</div')
    buttons_open = content.count('<button')
    buttons_close = content.count('</button')
    mains_open = content.count('<main')
    mains_close = content.count('</main')
    
    print(f"Divs: open={divs_open}, close={divs_close}, diff={divs_open-divs_close}")
    print(f"Buttons: open={buttons_open}, close={buttons_close}, diff={buttons_open-buttons_close}")
    print(f"Mains: open={mains_open}, close={mains_close}, diff={mains_open-mains_close}")

check_balance('src/app/watch/[id]/WatchClient.tsx')
