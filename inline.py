"""Rebuild index.html by inlining css/*.css and js/*.js into its <style> and <script> blocks.
Edit HTML markup directly in index.html; edit CSS/JS in css/ and js/, then run: python inline.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
CSS = ['kawaii-theme', 'animations', 'modals']
JS = ['sudoku-engine', 'makesum-engine', 'wordhunt-engine', 'sichuan-engine', 'tetris-engine',
      'sound-manager', 'particle-system', 'mascot-manager', 'game-economy', 'admob-manager', 'app']


def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8', newline='') as f:
        return f.read()


def concat(folder, names, ext):
    parts = []
    for n in names:
        p = f'{folder}/{n}.{ext}'
        if os.path.exists(os.path.join(ROOT, p)):
            parts.append(read(p).replace('\r\n', '\n').rstrip('\n') + '\n\n')
    return ''.join(parts)


html = read('index.html').replace('\r\n', '\n')

s0 = html.index('<style>\n') + len('<style>\n')
s1 = html.index('    </style>', s0)
html = html[:s0] + concat('css', CSS, 'css') + html[s1:]

# script body starts after the embedded BGM data line
j0 = html.index('window.BGM_EMBEDDED_DATA_URI')
j0 = html.index('\n', j0) + 1
j1 = html.rindex('    </script>')
html = html[:j0] + concat('js', JS, 'js') + html[j1:]

with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8', newline='') as f:
    f.write(html.replace('\n', '\r\n'))
print('index.html rebuilt', len(html), 'chars')
