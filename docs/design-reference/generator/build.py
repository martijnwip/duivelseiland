import json, os, sys, re
from assemble import *

OUT = 'project'
os.makedirs(OUT, exist_ok=True)


def check(name, h):
    void = {'meta', 'img', 'br', 'hr', 'input', 'link', 'source'}
    stack = []
    for m in re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(/?)>', h):
        close, tag, rest, selfc = m.groups()
        if tag in void or selfc:
            continue
        if close:
            if not stack or stack[-1] != tag:
                raise SystemExit(f'{name}: mismatch </{tag}> vs {stack[-3:]} at {m.start()} ... {h[max(0,m.start()-120):m.start()+40]}')
            stack.pop()
        else:
            stack.append(tag)
    if stack:
        raise SystemExit(f'{name}: unclosed {stack[-5:]}')
    if '{{' in h.replace('{{"$preview"', '').replace('}}', '}}'):
        pass


CD, CM = build_cards(False), build_cards(True)
files = {}
files['Desktop-Licht.dc.html'] = full_page('light', False, CD)
files['Desktop-Donker.dc.html'] = full_page('dark', False, CD)
files['Mobiel-Licht.dc.html'] = full_page('light', True, CM)
files['Mobiel-Donker.dc.html'] = full_page('dark', True, CM)
if os.path.exists('boards.py'):
    import boards
    files.update(boards.make(CD, CM))
for n, h in files.items():
    check(n, h)
    open(f'{OUT}/{n}', 'w').write(h)
    print(n, len(h) // 1024, 'KB')
