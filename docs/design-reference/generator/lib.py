import json, html, math, itertools

DATA = json.load(open('/Users/martijnwip/Documents/repos/duivelseiland-stats/src/lib/stats/statistieken.json'))
S = {s['id']: s for s in DATA['secties']}
UID = itertools.count(1)

FONT_FRAUNCES = '/_blob/8fa224ee0be2a4617fa7059201b8a3a1'
FONT_LEXEND = '/_blob/c9564555a3f5cd7dfe57f74172c3b70d'
FONT_SOURCE = '/_blob/78c44d43dd43027d4b07775d34ef1391'
LOGO = '/_blob/35e0e1635199a70420c0f7ea8bba256a'


def esc(x):
    return html.escape(str(x), quote=True)


def r(x):
    if isinstance(x, float):
        s = f"{x:.1f}"
        return s[:-2] if s.endswith('.0') else s
    return str(x)


def nl(n, dec=0):
    s = f"{n:,.{dec}f}"
    return s.replace(',', '§').replace('.', ',').replace('§', '.')


def T(tag, inner='', **a):
    at = ''
    for k, v in a.items():
        if v is None:
            continue
        k = 'class' if k == 'cls' else k.replace('_', '-')
        at += f' {k}="{esc(r(v))}"'
    return f'<{tag}{at}>{inner}</{tag}>'


def lin(d0, d1, r0, r1):
    return lambda v: r0 + (v - d0) * (r1 - r0) / (d1 - d0) if d1 != d0 else r0


def svg(w, h, inner, label):
    return T('svg', f'<title>{esc(label)}</title>' + inner, viewBox=f'0 0 {r(w)} {r(h)}', width=w, height=h, role='img', aria_label=label, style='display:block;max-width:100%;overflow:visible')


THEMES = {
    'light': dict(bg='#f5efe3', card='#faf6ee', text='#2b241c', muted='#6b5f4f', border='#e3d5be', rule='#8f836f', p='#3b5d42', s='#c99a46', c='#b5482e', p6='#7f9a84', p3='#b7c6b8', s5='#e0c48f', c4='#d99a86', m3='#c9bda9'),
    'dark': dict(bg='#211c16', card='#2a241d', text='#f1e8d8', muted='#a99a85', border='#4a4136', rule='#857868', p='#6b9a73', s='#e0b368', c='#e2703f', p6='#4f7358', p3='#3c5142', s5='#8d7443', c4='#8f5236', m3='#4f463a'),
}


def theme_style(name):
    t = THEMES[name]
    return ';'.join(f'--{k}:{v}' for k, v in t.items()) + ';--m:var(--muted)'


CSS = f'''
@font-face{{font-family:"Fraunces";src:url({FONT_FRAUNCES}) format("woff2");font-weight:100 900;font-display:swap}}
@font-face{{font-family:"Lexend";src:url({FONT_LEXEND}) format("woff2");font-weight:100 900;font-display:swap}}
@font-face{{font-family:"Source Sans 3";src:url({FONT_SOURCE}) format("woff2");font-weight:200 900;font-display:swap}}
body{{margin:0}}
a{{color:var(--p)}}a:hover{{color:var(--text)}}
.t{{font:400 12px "Source Sans 3",system-ui,sans-serif;fill:var(--muted)}}
.tt{{font:400 13px "Source Sans 3",system-ui,sans-serif;fill:var(--text)}}
.v{{font:600 12px "Lexend",system-ui,sans-serif;fill:var(--text)}}
.vb{{font:600 14px "Lexend",system-ui,sans-serif;fill:var(--text)}}
.grid{{stroke:var(--border);stroke-width:1}}
.axis{{stroke:var(--rule);stroke-width:1}}
.fp{{fill:var(--p)}}.fp6{{fill:var(--p6)}}.fp3{{fill:var(--p3)}}.fs{{fill:var(--s)}}.fs5{{fill:var(--s5)}}.fc{{fill:var(--c)}}.fc4{{fill:var(--c4)}}.fm{{fill:var(--muted)}}.fm3{{fill:var(--m3)}}.fcard{{fill:var(--card)}}
.sp{{fill:none;stroke:var(--p);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}}
.ss{{fill:none;stroke:var(--s);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}}
.sc{{fill:none;stroke:var(--c);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}}
.sm{{fill:none;stroke:var(--muted);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}}
.pdot{{fill:var(--card);stroke:var(--p);stroke-width:2}}.sdot{{fill:var(--card);stroke:var(--s);stroke-width:2}}.cdot{{fill:var(--card);stroke:var(--c);stroke-width:2}}.mdot{{fill:var(--card);stroke:var(--muted);stroke-width:2}}
.ic{{fill:none;stroke:var(--text);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}}
.h{{font-family:"Lexend",system-ui,sans-serif}}
'''

CLS = {'p': 'var(--p)', 'p6': 'var(--p6)', 'p3': 'var(--p3)', 's': 'var(--s)', 's5': 'var(--s5)', 'c': 'var(--c)', 'c4': 'var(--c4)', 'm': 'var(--muted)', 'm3': 'var(--m3)'}


# ---------- line chart ----------
def line_chart(w, h, xs, series, ymin, ymax, yticks, fmt, xticks, marks=(), area=None, l=48, rgt=20, t=14, b=28, label='Lijngrafiek'):
    X = lin(xs[0], xs[-1], l, w - rgt)
    Y = lin(ymin, ymax, h - b, t)
    o = []
    for yv in yticks:
        o.append(T('line', x1=l, x2=w - rgt, y1=Y(yv), y2=Y(yv), cls='axis' if yv == ymin else 'grid'))
        o.append(T('text', esc(fmt(yv)), x=l - 8, y=Y(yv) + 4, text_anchor='end', cls='t'))
    for xv, lab in xticks:
        o.append(T('text', esc(lab), x=X(xv), y=h - 8, text_anchor='middle', cls='t'))
    if area is not None:
        s = series[area]
        pts = [(X(x), Y(v)) for x, v in zip(xs, s['vals']) if v is not None]
        d = f'M{r(pts[0][0])},{r(Y(ymin))} ' + ' '.join(f'L{r(px)},{r(py)}' for px, py in pts) + f' L{r(pts[-1][0])},{r(Y(ymin))} Z'
        o.append(T('path', d=d, cls='f' + s['cls'] + ('3' if s['cls'] == 'p' else ''), opacity='0.35'))
    for s in series:
        seg, segs = [], []
        for x, v in zip(xs, s['vals']):
            if v is None:
                if seg:
                    segs.append(seg)
                seg = []
            else:
                seg.append((X(x), Y(v)))
        if seg:
            segs.append(seg)
        for sg in segs:
            d = 'M' + ' L'.join(f'{r(px)},{r(py)}' for px, py in sg)
            o.append(T('path', d=d, cls='s' + s['cls'], stroke_dasharray=s.get('dash')))
    for m in marks:
        s = series[m['si']]
        x, v = xs[m['i']], s['vals'][m['i']]
        o.append(T('circle', cx=X(x), cy=Y(v), r=4.5, cls=s['cls'] + 'dot'))
        o.append(T('text', esc(m['text']), x=X(x) + m.get('dx', 0), y=Y(v) + m.get('dy', -12), text_anchor=m.get('anchor', 'middle'), cls=m.get('c', 'v')))
    return svg(w, h, ''.join(o), label)


# ---------- vertical bars ----------
def bar_v(w, h, items, fmt=nl, l=8, rgt=8, t=24, b=34, label='Staafdiagram', gap=0.36, split=True):
    n = len(items)
    mx = max(i['v'] for i in items) or 1
    slot = (w - l - rgt) / n
    bw = slot * (1 - gap)
    Y = lin(0, mx, h - b, t)
    o = [T('line', x1=l, x2=w - rgt, y1=h - b, y2=h - b, cls='axis')]
    for k, it in enumerate(items):
        x = l + k * slot + (slot - bw) / 2
        y = Y(it['v'])
        o.append(T('rect', x=x, y=y, width=bw, height=max(h - b - y, 0), rx=2, cls='f' + it.get('cls', 'p')))
        o.append(T('text', esc(fmt(it['v'])), x=x + bw / 2, y=y - 6, text_anchor='middle', cls='v'))
        lab = it['label']
        parts = lab.split(' ', 1) if (split and ' ' in lab and len(lab) > 9) else [lab]
        for j, part in enumerate(parts):
            o.append(T('text', esc(part), x=x + bw / 2, y=h - b + 16 + j * 13, text_anchor='middle', cls='t'))
    return svg(w, h, ''.join(o), label)


# ---------- horizontal bars ----------
def bar_h(w, rows, fmt=nl, lw=190, rh=28, mobile=False, mx=None, label='Horizontaal staafdiagram', bh=14, valw=64):
    mx = mx or max(x['v'] for x in rows) or 1
    o = []
    y = 4
    for row in rows:
        cls = row.get('cls', 'p')
        strong = row.get('strong')
        if mobile:
            o.append(T('text', esc(row['label']), x=0, y=y + 12, cls='tt', font_weight='600' if strong else None))
            bw = (w - valw) * row['v'] / mx
            o.append(T('rect', x=0, y=y + 18, width=w - valw, height=bh, rx=2, cls='fm3', opacity='0.35'))
            o.append(T('rect', x=0, y=y + 18, width=max(bw, 2 if row['v'] else 0), height=bh, rx=2, cls='f' + cls))
            o.append(T('text', esc(fmt(row['v'])), x=w, y=y + 18 + bh - 2, text_anchor='end', cls='v'))
            y += 18 + bh + 12
        else:
            o.append(T('text', esc(row['label']), x=lw - 12, y=y + rh / 2 + 4, text_anchor='end', cls='tt', font_weight='600' if strong else None))
            bw = (w - lw - valw) * row['v'] / mx
            o.append(T('rect', x=lw, y=y + (rh - bh) / 2, width=max(bw, 2 if row['v'] else 0), height=bh, rx=2, cls='f' + cls))
            o.append(T('text', esc(fmt(row['v'])), x=lw + max(bw, 2) + 8, y=y + rh / 2 + 4, cls='v'))
            y += rh
    o.insert(0, '' if mobile else T('line', x1=lw, x2=lw, y1=0, y2=y, cls='axis'))
    return svg(w, y + 4, ''.join(o), label)


# ---------- donut with legend (html) ----------
def donut(parts, center_top, center_bottom, size=148, total=None, share_fmt=lambda p: nl(p) + '%', val_fmt=nl, gap_x=24, mobile=False):
    tot = total or sum(p['v'] for p in parts)
    rr = size / 2 - 14
    circ = 2 * math.pi * rr
    o = [T('circle', cx=size / 2, cy=size / 2, r=rr, fill='none', stroke='var(--border)', stroke_width=22)]
    off = 0
    for p in parts:
        ln = circ * p['v'] / sum(x['v'] for x in parts)
        o.append(T('circle', cx=size / 2, cy=size / 2, r=rr, fill='none', stroke=CLS[p['cls']], stroke_width=22, stroke_dasharray=f'{r(ln - 2)} {r(circ - ln + 2)}', stroke_dashoffset=r(-off), transform=f'rotate(-90 {r(size/2)} {r(size/2)})'))
        off += ln
    o.append(T('text', esc(center_top), x=size / 2, y=size / 2 + 4, text_anchor='middle', cls='vb'))
    o.append(T('text', esc(center_bottom), x=size / 2, y=size / 2 + 20, text_anchor='middle', cls='t'))
    s = svg(size, size, ''.join(o), 'Cirkeldiagram: ' + ', '.join(f"{p['label']} {nl(p['v'])}" for p in parts))
    legend = ''
    for p in parts:
        share = 100 * p['v'] / sum(x['v'] for x in parts)
        legend += (f'<li style="display:flex;gap:10px;align-items:baseline;padding:6px 0;border-top:1px solid var(--border)">'
                   f'<span style="width:12px;height:12px;border-radius:2px;background:{CLS[p["cls"]]};flex:none;align-self:center"></span>'
                   f'<span style="flex:1;font:400 14px/1.3 \'Source Sans 3\',sans-serif;color:var(--text)">{esc(p["label"])}</span>'
                   f'<span style="font:600 14px \'Lexend\',sans-serif;color:var(--text)">{esc(p.get("share_text") or share_fmt(round(share)))}</span></li>')
    return (f'<div style="display:flex;gap:{gap_x}px;align-items:center;flex-wrap:{"wrap" if mobile else "nowrap"}">'
            f'<div style="flex:none">{s}</div><ul style="list-style:none;margin:0;padding:0;flex:1;min-width:150px">{legend}</ul></div>')


# ---------- meters (html) ----------
def meters(items, cols=2, gap=18, colgap=32):
    cells = ''
    for it in items:
        cells += (f'<div><div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:6px">'
                  f'<span style="font:400 14px/1.3 \'Source Sans 3\',sans-serif;color:var(--text)">{esc(it["label"])}</span>'
                  f'<span style="font:600 15px \'Lexend\',sans-serif;color:var(--text);white-space:nowrap">{nl(it["v"])}%</span></div>'
                  f'<div role="img" aria-label="{esc(it["label"])}: {nl(it["v"])}%" style="height:8px;border-radius:4px;background:var(--border);position:relative">'
                  f'<div style="position:absolute;left:0;top:0;bottom:0;width:{it["v"]}%;border-radius:4px;background:{CLS[it.get("cls","p")]}"></div></div></div>')
    return f'<div style="display:grid;grid-template-columns:repeat({cols},minmax(0,1fr));gap:{gap}px {colgap}px">{cells}</div>'
