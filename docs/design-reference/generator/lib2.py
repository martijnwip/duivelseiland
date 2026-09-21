from lib import *

ICONS = {
    'huisartsenpraktijk': 'M8 3v10M3 8h10',
    'supermarkt': 'M2 6h12l-1.5 7h-9zM5 6l2-3M11 6l-2-3',
    'restaurant': 'M4 2v4a1.5 1.5 0 0 0 3 0V2M5.5 7v7M12 14V2c-1.6 1-2.2 3-2.2 5.2H12',
    'basisonderwijs': 'M3 13l1-3.2 7.2-7.2 2.2 2.2-7.2 7.2z',
    'voortgezet-onderwijs': 'M2 4c2-1 4-1 6 1 2-2 4-2 6-1v9c-2-1-4-1-6 1-2-2-4-2-6-1zM8 5v9',
    'bibliotheek': 'M3 3v10M6.2 3v10M9.4 4.2l3 8.8M2 14h12',
    'treinstation': 'M4 2h8v9H4zM4 8h8M6 14l-1 1.5M10 14l1 1.5',
    'sportterrein': 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM2.3 6.5c3 1.6 8.4 1.6 11.4 0M2.3 9.5c3-1.6 8.4-1.6 11.4 0',
    'bioscoop': 'M2 4h12v8H2zM5 4v8M11 4v8M2 8h3M11 8h3',
    'museum': 'M2 6l6-3 6 3H2zM4 7.5V12M8 7.5V12M12 7.5V12M2 13.5h12',
}


def stacked_area(w, h, mobile=False):
    s = S['herkomst-trend']['data']
    yrs = [d['jaar'] for d in s]
    l, rgt, t, b = 48, (96 if not mobile else 20), 16, 28
    X = lin(yrs[0], yrs[-1], l, w - rgt)
    tot = [d['nederland'] + (d['europa'] or 0) + (d['buiten_europa'] or 0) for d in s]
    ymax = 1500
    Y = lin(0, ymax, h - b, t)
    uid = next(UID)
    o = [T('defs', T('pattern', T('rect', width=6, height=6, fill='none') + T('path', d='M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2', stroke='var(--rule)', stroke_width=1), id=f'hatch{uid}', width=6, height=6, patternUnits='userSpaceOnUse'))]
    for yv in (0, 500, 1000, 1500):
        o.append(T('line', x1=l, x2=w - rgt, y1=Y(yv), y2=Y(yv), cls='axis' if yv == 0 else 'grid'))
        o.append(T('text', nl(yv), x=l - 8, y=Y(yv) + 4, text_anchor='end', cls='t'))
    for yr in yrs:
        if yr in (2013, 2016, 2019, 2022, 2025):
            o.append(T('text', str(yr), x=X(yr), y=h - 8, text_anchor='middle', cls='t'))
    # nederland layer (continuous)
    pts = [(X(d['jaar']), Y(d['nederland'])) for d in s]
    o.append(T('path', d=f'M{r(X(yrs[0]))},{r(Y(0))} ' + ' '.join(f'L{r(a)},{r(b_)}' for a, b_ in pts) + f' L{r(X(yrs[-1]))},{r(Y(0))} Z', cls='fp'))
    # europa + buiten europa in two segments
    def seg(i0, i1):
        top_eu = [(X(s[i]['jaar']), Y(s[i]['nederland'] + s[i]['europa'])) for i in range(i0, i1 + 1)]
        base = [(X(s[i]['jaar']), Y(s[i]['nederland'])) for i in range(i0, i1 + 1)]
        top_all = [(X(s[i]['jaar']), Y(s[i]['nederland'] + s[i]['europa'] + s[i]['buiten_europa'])) for i in range(i0, i1 + 1)]
        def poly(up, lo):
            return 'M' + ' L'.join(f'{r(a)},{r(b_)}' for a, b_ in up) + ' L' + ' L'.join(f'{r(a)},{r(b_)}' for a, b_ in reversed(lo)) + ' Z'
        return T('path', d=poly(top_eu, base), cls='fs') + T('path', d=poly(top_all, top_eu), cls='fm3')
    i22 = yrs.index(2022)
    o.append(seg(0, i22 - 1))
    o.append(seg(i22 + 1, len(s) - 1))
    # gap hatch above nederland between 2021 and 2023
    a, c = yrs.index(2021), yrs.index(2023)
    gap = (f'M{r(X(2021))},{r(Y(s[a]["nederland"]))} L{r(X(2022))},{r(Y(s[i22]["nederland"]))} L{r(X(2023))},{r(Y(s[c]["nederland"]))} '
           f'L{r(X(2023))},{r(Y(tot[c]))} L{r(X(2021))},{r(Y(tot[a]))} Z')
    o.append(T('path', d=gap, fill=f'url(#hatch{uid})', stroke='var(--rule)', stroke_width=1, stroke_dasharray='3 3'))
    o.append(T('text', 'geen uitsplitsing in de bron', x=X(2022), y=Y(tot[a]) - 8, text_anchor='middle', cls='t'))
    o.append(T('line', x1=X(2022), x2=X(2022), y1=Y(tot[a]) - 4, y2=Y(s[i22]['nederland']) - 4, cls='grid'))
    # direct labels
    if not mobile:
        xe = w - rgt + 10
        y0 = Y(s[-1]['nederland'] / 2)
        y1 = Y(s[-1]['nederland'] + s[-1]['europa'] / 2)
        y2 = Y(s[-1]['nederland'] + s[-1]['europa'] + s[-1]['buiten_europa'] / 2)
        for yy, txt, sub in ((y0, 'Nederland', '630 (45%)'), (y1, 'Europa', '380 (27%)'), (y2, 'Buiten Europa', '380 (27%)')):
            o.append(T('text', txt, x=xe, y=yy - 2, cls='tt'))
            o.append(T('text', sub, x=xe, y=yy + 13, cls='t'))
        o.append(T('text', '66%', x=X(2013) + 6, y=Y(437) + 5, cls='vb', fill='#ffffff', style='fill:var(--card)'))
        o.append(T('text', '45%', x=X(2025) - 6, y=Y(315) + 5, text_anchor='end', cls='vb', style='fill:var(--card)'))
    else:
        o.append(T('text', '66%', x=X(2013) + 6, y=Y(437) + 5, cls='vb', style='fill:var(--card)'))
        o.append(T('text', '45%', x=X(2025) - 6, y=Y(315) + 5, text_anchor='end', cls='vb', style='fill:var(--card)'))
    return svg(w, h, ''.join(o), 'Gestapeld vlakdiagram: herkomst van inwoners 2013-2025; Nederland daalt van 66% naar 45%')


def stacked_bar(w, h):
    d = S['verkeersongevallen']['data']
    n = len(d)
    l, rgt, t, b = 34, 10, 30, 26
    slot = (w - l - rgt) / n
    bw = slot * 0.66
    mx = 14
    Y = lin(0, 16, h - b, t)
    o = []
    for yv in (0, 4, 8, 12, 16):
        o.append(T('line', x1=l, x2=w - rgt, y1=Y(yv), y2=Y(yv), cls='axis' if yv == 0 else 'grid'))
        o.append(T('text', str(yv), x=l - 8, y=Y(yv) + 4, text_anchor='end', cls='t'))
    for k, x in enumerate(d):
        xx = l + k * slot + (slot - bw) / 2
        mat, let = x['materiele_schade'], x['letselschade']
        o.append(T('rect', x=xx, y=Y(mat), width=bw, height=max(Y(0) - Y(mat), 0), rx=1, cls='fp3' if x['jaar'] != 2025 else 'fp6'))
        o.append(T('rect', x=xx, y=Y(mat + let), width=bw, height=max(Y(mat) - Y(mat + let), 0), rx=1, cls='fc4' if x['jaar'] != 2025 else 'fc'))
        if x['jaar'] in (2003, 2010, 2015, 2020, 2025):
            o.append(T('text', str(x['jaar']), x=xx + bw / 2, y=h - 8, text_anchor='middle', cls='t'))
    k = n - 1
    xx = l + k * slot + slot / 2
    o.append(T('text', '2025: 14 ongevallen', x=xx, y=Y(14) - 18, text_anchor='end', cls='v'))
    o.append(T('text', '11 materiële schade, 3 letsel, 0 dodelijk', x=xx, y=Y(14) - 5, text_anchor='end', cls='t'))
    return svg(w, h, ''.join(o), 'Gestapeld staafdiagram: verkeersongevallen per jaar 2003-2025; in 2025 14 ongevallen')


def grouped_h(w, rows, series, mobile=False, fmt=lambda v: nl(v, 1), mx=None, bh=9, gap=3):
    mx = mx or max(v for r_ in rows for v in r_['vals'] if v is not None)
    o = []
    y = 0
    vw = 44
    for row in rows:
        o.append(T('text', esc(row['label']), x=0, y=y + 12, cls='tt'))
        y += 18
        for k, v in enumerate(row['vals']):
            if v is None:
                y += bh + gap
                continue
            bw = (w - vw) * v / mx
            o.append(T('rect', x=0, y=y, width=max(bw, 2), height=bh, rx=2, cls='f' + series[k]['cls']))
            o.append(T('text', esc(fmt(v)), x=max(bw, 2) + 6, y=y + bh - 0.5, cls='t' if k else 'v'))
            y += bh + gap
        y += 12
    return svg(w, y, ''.join(o), 'Gegroepeerd staafdiagram')


def legend(items):
    return '<div style="display:flex;gap:6px 18px;flex-wrap:wrap">' + ''.join(
        f'<span style="display:inline-flex;gap:8px;align-items:center;font:400 13px \'Source Sans 3\',sans-serif;color:var(--text)"><span style="width:12px;height:12px;border-radius:2px;background:{CLS[c]}"></span>{esc(n)}</span>' for n, c in items) + '</div>'


def distance(w, mobile=False):
    d = sorted(S['voorzieningen']['data'], key=lambda x: x['waarde'])
    lw = 132 if mobile else 190
    rh = 30
    mx = 2.5
    X = lin(0, mx, lw, w - 34)
    o = []
    hh = len(d) * rh + 30
    for tv in (0, 0.5, 1, 1.5, 2, 2.5):
        o.append(T('line', x1=X(tv), x2=X(tv), y1=6, y2=hh - 26, cls='grid' if tv else 'axis'))
        if not mobile or tv in (0, 1, 2):
            o.append(T('text', (nl(tv, 1) + ' km') if tv in (0, 1, 2) else nl(tv, 1), x=X(tv), y=hh - 8, text_anchor='middle', cls='t'))
    for k, x in enumerate(d):
        y = 6 + k * rh + rh / 2
        far = x['waarde'] > 2
        o.append(T('g', T('path', d=ICONS[x['key']], cls='ic'), transform=f'translate(0,{r(y - 8)})'))
        o.append(T('text', esc(x['label']), x=24, y=y + 4, cls='tt'))
        o.append(T('line', x1=lw, x2=X(x['waarde']), y1=y, y2=y, stroke='var(--border)', stroke_width=2))
        o.append(T('circle', cx=X(x['waarde']), cy=y, r=6, cls='fc' if far else 'fp'))
        o.append(T('text', nl(x['waarde'], 1) + ' km', x=X(x['waarde']) + 12, y=y + 4, cls='v', text_anchor='start' if X(x['waarde']) + 60 < w else 'end'))
    return svg(w, hh, ''.join(o), 'Gemiddelde afstand tot voorzieningen in kilometers; dichtbij links')


def bar_compare(w, mobile=False):
    d = S['dichtheid']['data']
    o = []
    y = 0
    names = {'bevolking': 'Inwoners per km²', 'adressen': 'Adressen per km²', 'autos': 'Auto’s per km²'}
    fw = 74
    for it in d:
        f = it['duivelseiland'] / it['nederland']
        o.append(T('text', names[it['key']], x=0, y=y + 12, cls='tt'))
        y += 20
        full = w - fw - 8
        bw = full
        nw = max(full * it['nederland'] / it['duivelseiland'], 3)
        o.append(T('rect', x=0, y=y, width=bw, height=14, rx=2, cls='fp'))
        o.append(T('text', nl(it['duivelseiland']), x=bw - 8, y=y + 11, text_anchor='end', style='fill:var(--card)', cls='v'))
        o.append(T('text', 'Duivelseiland', x=8, y=y + 11, style='fill:var(--card)', cls='t'))
        y += 20
        o.append(T('rect', x=0, y=y, width=nw, height=14, rx=2, cls='fm'))
        o.append(T('text', nl(it['nederland']) + ' Nederland', x=nw + 8, y=y + 11, cls='t'))
        o.append(T('text', (nl(f, 0) if f >= 10 else nl(f, 1)) + '×', x=w, y=y - 4, text_anchor='end', cls='h', style='font:600 26px Lexend,sans-serif;fill:var(--p)'))
        y += 32
    return svg(w, y, ''.join(o), 'Dichtheid: Duivelseiland versus Nederland, per km²')


def dumbbell(w, mobile=False):
    d = S['onderscheidend']['data']
    o = []
    y = 0
    lw = 0 if True else 0
    for it in d:
        dv = it['duivelseiland']
        derived = dv is None
        if derived:
            dv = 76
        vals = {'Duivelseiland': dv, 'Amsterdam': it['amsterdam'], 'Nederland': it['nederland']}
        mx = max(vals.values()) * 1.1
        pad = 44
        X = lin(0, mx, 0, w - pad)
        o.append(T('text', esc(it['label']), x=0, y=y + 12, cls='tt'))
        yy = y + 56
        o.append(T('line', x1=0, x2=w - pad, y1=yy, y2=yy, cls='grid'))
        a, bb = min(vals.values()), max(vals.values())
        o.append(T('line', x1=X(a), x2=X(bb), y1=yy, y2=yy, stroke='var(--rule)', stroke_width=3))
        fm = (lambda v: '€ ' + nl(v)) if '€' in it['label'] else (lambda v: nl(v) + ('%' if '%' in it['label'] else ''))
        for name, v in sorted(vals.items(), key=lambda kv: kv[1]):
            x = X(v)
            if name == 'Duivelseiland':
                o.append(T('circle', cx=x, cy=yy, r=8, cls='fp'))
            elif name == 'Amsterdam':
                o.append(T('rect', x=x - 6, y=yy - 6, width=12, height=12, cls='fs'))
            else:
                o.append(T('path', d=f'M{r(x)},{r(yy-8)} L{r(x+8)},{r(yy)} L{r(x)},{r(yy+8)} L{r(x-8)},{r(yy)} Z', cls='fm'))
        # value labels stacked above/below to avoid collisions
        order = sorted(vals.items(), key=lambda kv: kv[1])
        for j, (name, v) in enumerate(order):
            x = X(v)
            up = j % 2 == 0
            txt = fm(v) + (' (afgeleid)' if derived and name == 'Duivelseiland' else '')
            o.append(T('text', esc(f'{name} {txt}') if not mobile else esc(txt), x=min(max(x, 0), w - pad), y=yy - 14 if up else yy + 26, text_anchor='middle' if 20 < x < w - pad - 20 else ('start' if x <= 20 else 'end'), cls='v' if name == 'Duivelseiland' else 't'))
        y += 100
    return svg(w, y, ''.join(o), 'Duivelseiland vergeleken met Amsterdam en Nederland')


def income_scale(w):
    d = S['inkomen']['data'][0]
    mx = 70000
    X = lin(0, mx, 0, w - 8)
    ay = 64
    o = [T('line', x1=0, x2=w - 8, y1=ay, y2=ay, cls='axis')]
    for tv in (0, 20000, 40000, 60000):
        o.append(T('line', x1=X(tv), x2=X(tv), y1=ay, y2=ay + 6, cls='axis'))
        o.append(T('text', '€ ' + nl(tv), x=X(tv), y=ay + 22, text_anchor='middle' if tv else 'start', cls='t'))
    for name, v, shape in (('Nederland', d['nederland'], 'm'), ('Amsterdam', d['amsterdam'], 's'), ('Duivelseiland', d['waarde'], 'p')):
        x = X(v)
        if shape == 'p':
            o.append(T('circle', cx=x, cy=ay, r=9, cls='fp'))
        elif shape == 's':
            o.append(T('rect', x=x - 6, y=ay - 6, width=12, height=12, cls='fs'))
        else:
            o.append(T('path', d=f'M{r(x)},{ay-8} L{r(x+8)},{ay} L{r(x)},{ay+8} L{r(x-8)},{ay} Z', cls='fm'))
        ly = 14 if shape == 's' else 34
        o.append(T('line', x1=x, x2=x, y1=ay, y2=ly + 4, stroke='var(--rule)', stroke_width=1))
        anchor = 'middle' if shape == 'p' else ('end' if shape == 'm' else 'start')
        dx = 0 if shape == 'p' else (-5 if shape == 'm' else 5)
        o.append(T('text', f'{name} € {nl(v)}', x=x + dx, y=ly, text_anchor=anchor, cls='v' if shape == 'p' else 't'))
    return svg(w, 96, ''.join(o), 'Gemiddeld inkomen per inwoner: Duivelseiland € 58.400, Amsterdam € 41.000, Nederland € 34.900')


def scatter(w, h, mobile=False):
    pts = [p for p in S['vergelijk-woz-65plus']['data']]
    l, rgt, t, b = 44, 16, 14, 40
    X = lin(300000, 1800000, l, w - rgt)
    Y = lin(0, 55, h - b, t)
    o = []
    for yv in (0, 10, 20, 30, 40, 50):
        o.append(T('line', x1=l, x2=w - rgt, y1=Y(yv), y2=Y(yv), cls='axis' if yv == 0 else 'grid'))
        o.append(T('text', f'{yv}%', x=l - 8, y=Y(yv) + 4, text_anchor='end', cls='t'))
    for xv in (400000, 800000, 1200000, 1600000):
        o.append(T('text', '€ ' + nl(xv / 1000) + 'k' if False else f'€ {nl(xv/1000)}k', x=X(xv), y=h - 22, text_anchor='middle', cls='t'))
    o.append(T('text', 'Gemiddelde WOZ-waarde →', x=w - rgt, y=h - 6, text_anchor='end', cls='t'))
    o.append(T('text', '65-plus, aandeel ↑', x=l, y=t - 2, cls='t'))
    for p in pts:
        x, y = X(p['woz']), Y(p['aandeel_65plus'])
        small = p['woningen'] < 10
        if p['label'] == 'Buurt Duivelseiland':
            o.append(T('circle', cx=x, cy=y, r=9, cls='fp'))
            o.append(T('text', 'Duivelseiland', x=x + 14, y=y + 4, cls='v'))
        elif p['label'] == 'Wijk Museumkwartier':
            o.append(T('rect', x=x - 7, y=y - 7, width=14, height=14, cls='fs'))
            o.append(T('text', 'Museumkwartier', x=x - 12, y=y - 12, text_anchor='end' if not mobile else 'middle', cls='tt'))
        elif small:
            o.append(T('circle', cx=x, cy=y, r=5, fill='none', stroke='var(--rule)', stroke_width=1.5, stroke_dasharray='2 2'))
        else:
            o.append(T('circle', cx=x, cy=y, r=5, cls='fm3', stroke='var(--muted)', stroke_width=1))
    return svg(w, h, ''.join(o), 'Spreidingsdiagram: woningwaarde tegenover aandeel 65-plussers per buurt')


def sankey(w, h=300):
    tot = S['geboorteland']['totalen']
    flows = {(0, 0): 630, (0, 1): 60, (0, 2): 130, (1, 1): 320, (1, 2): 250}
    left = [('Geboren in Nederland', tot['geboren_in_nederland']), ('Geboren buiten Nederland', tot['geboren_buiten_nederland'])]
    rightv = [630, 380, 380]
    rnames = ['Herkomst Nederland', 'Herkomst Europa', 'Herkomst buiten Europa']
    rcls = ['p', 's', 'm3']
    lw, rw, nw = 170, 170, 14
    top, bot = 8, h - 8
    scale = (bot - top - 24) / 1390
    ly, y = [], top
    for _, v in left:
        ly.append(y)
        y += v * scale + 24
    ry, y = [], top
    for v in rightv:
        ry.append(y)
        y += v * scale + 12
    o = []
    x0, x1 = lw + nw, w - rw - nw
    lo = list(ly)
    ro = list(ry)
    for (a, b), v in flows.items():
        th = v * scale
        y0, y1 = lo[a], ro[b]
        lo[a] += th
        ro[b] += th
        d = f'M{r(x0)},{r(y0)} C{r((x0+x1)/2)},{r(y0)} {r((x0+x1)/2)},{r(y1)} {r(x1)},{r(y1)} L{r(x1)},{r(y1+th)} C{r((x0+x1)/2)},{r(y1+th)} {r((x0+x1)/2)},{r(y0+th)} {r(x0)},{r(y0+th)} Z'
        o.append(T('path', d=d, cls='f' + rcls[b], opacity='0.62'))
        o.append(T('text', str(v), x=(x0 + x1) / 2, y=(y0 + y1) / 2 + th / 2 + 4, text_anchor='middle', cls='v'))
    for k, (nm, v) in enumerate(left):
        o.append(T('rect', x=lw, y=ly[k], width=nw, height=v * scale, cls='fm'))
        o.append(T('text', nm, x=lw - 10, y=ly[k] + v * scale / 2, text_anchor='end', cls='tt'))
        o.append(T('text', nl(v), x=lw - 10, y=ly[k] + v * scale / 2 + 15, text_anchor='end', cls='v'))
    for k, v in enumerate(rightv):
        o.append(T('rect', x=w - rw - nw, y=ry[k], width=nw, height=v * scale, cls='fm'))
        o.append(T('text', rnames[k], x=w - rw + 4, y=ry[k] + v * scale / 2, cls='tt'))
        o.append(T('text', nl(v), x=w - rw + 4, y=ry[k] + v * scale / 2 + 15, cls='v'))
    return svg(w, h, ''.join(o), 'Van geboorteland naar herkomst: 820 in Nederland geboren, 570 buiten Nederland')


def sankey_mobile(w):
    rows = [('Geboren in Nederland', 820, [(630, 'p', 'Nederland'), (60, 's', 'Europa'), (130, 'm3', 'Buiten Europa')]),
            ('Geboren buiten Nederland', 570, [(320, 's', 'Europa'), (250, 'm3', 'Buiten Europa')])]
    o, y = [], 0
    for nm, tot, segs in rows:
        o.append(T('text', f'{nm} ({nl(tot)})', x=0, y=y + 12, cls='tt'))
        y += 20
        x = 0
        for v, c, lab in segs:
            wd = w * v / 820
            o.append(T('rect', x=x, y=y, width=max(wd - 2, 1), height=22, rx=2, cls='f' + c))
            if wd > 36:
                o.append(T('text', str(v), x=x + 6, y=y + 15, cls='v'))
            x += wd
        y += 36
    o.append(T('text', 'Herkomst:', x=0, y=y + 4, cls='t'))
    return svg(w, y + 10, ''.join(o), 'Geboorteland en herkomst, gestapelde balken')
