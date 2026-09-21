from lib2 import *

F_B = "'Source Sans 3',system-ui,sans-serif"
F_H = "'Lexend',system-ui,sans-serif"
F_S = "'Fraunces',Georgia,serif"

ICON_TABLE = '<svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="1.5" y="2.5" width="12" height="10" rx="1"></rect><path d="M1.5 6h12M1.5 9h12M6 2.5v10"></path></svg>'
ICON_CHEV = '<svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3.5 5.5l4 4 4-4"></path></svg>'
ICON_UP = '<svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3.5 9.5l4-4 4 4"></path></svg>'

CHAPTERS = [
    ('mensen', 'Mensen'), ('wonen', 'Wonen'), ('werk', 'Werk en geld'), ('mobiliteit', 'Mobiliteit'),
    ('veiligheid', 'Veiligheid'), ('gezondheid', 'Gezondheid en welzijn'), ('voorzieningen', 'Voorzieningen en onderwijs'), ('vergelijking', 'Vergelijking'),
]


def badge(text='Schatting'):
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;border:1px solid var(--rule);border-radius:999px;padding:1px 10px;'
            f'font:600 12px {F_B};color:var(--text);white-space:nowrap"><span style="width:6px;height:6px;border-radius:50%;background:var(--c)"></span>{esc(text)}</span>')


def source(sid, jaar=None, bron=None):
    s = S[sid]
    b, j = bron or s['bron'], jaar or s['jaar']
    if s.get('schatting'):
        return f'Schatting, bron: {b}, {j}', True
    return f'Bron: {b}, {j}', False


def card(sid, title, body, sub=None, note=None, mobile=False, bron=None, jaar=None, extra=''):
    src, sch = source(sid, jaar, bron)
    pad = '16px' if mobile else '24px'
    btn = (f'<button type="button" aria-expanded="false" aria-label="Toon {esc(title)} als tabel" style="display:inline-flex;gap:8px;align-items:center;'
           f'background:none;border:0;color:var(--muted);font:500 14px {F_B};padding:{"10px 0" if mobile else "12px 8px"};min-height:44px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;white-space:nowrap;flex:none">{ICON_TABLE}Toon als tabel</button>')
    head = (f'<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start">'
            f'<div><h3 style="margin:0;font:600 {17 if mobile else 18}px/1.3 {F_H};color:var(--text)">{esc(title)}</h3>'
            + (f'<p style="margin:4px 0 0;font:400 14px/1.4 {F_B};color:var(--muted)">{esc(sub)}</p>' if sub else '') + '</div>'
            + ('' if mobile else btn) + '</div>')
    foot = (f'<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:{"0" if not mobile else "2px"}">'
            f'<span style="display:inline-flex;gap:10px;align-items:center;flex-wrap:wrap;font:400 13px {F_B};color:var(--muted)">{esc(src)}{badge() if sch else ""}</span>'
            + (btn if mobile else '') + '</div>')
    nt = f'<p style="margin:0;font:400 13px/1.45 {F_B};color:var(--muted)">{esc(note)}</p>' if note else ''
    return (f'<figure style="margin:0;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:{pad};display:flex;flex-direction:column;gap:16px;min-width:0">'
            f'{head}{body}{extra}{nt}{foot}</figure>')


def grid(cols, *items, gap=24):
    return f'<div style="display:grid;grid-template-columns:repeat({cols},minmax(0,1fr));gap:{gap}px;align-items:start">' + ''.join(items) + '</div>'


def more(titles, expanded, inner='', mobile=False):
    n = len(titles)
    lst = ' · '.join(titles)
    btn = (f'<button type="button" aria-expanded="{"true" if expanded else "false"}" style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;'
           f'background:transparent;border:1px solid var(--rule);border-radius:8px;padding:0 {16 if mobile else 20}px;min-height:56px;cursor:pointer;color:var(--text);text-align:left">'
           f'<span style="display:flex;flex-direction:column;gap:2px;padding:8px 0"><span style="font:600 15px {F_H}">Meer cijfers ({n})</span>'
           f'<span style="font:400 13px/1.35 {F_B};color:var(--muted)">{esc(lst)}</span></span>'
           f'<span style="flex:none;display:inline-flex">{ICON_UP if expanded else ICON_CHEV}</span></button>')
    return f'<div style="display:flex;flex-direction:column;gap:24px">{btn}{inner if expanded else ""}</div>'


def chapter(n, key, title, message, fact, blocks, mobile=False):
    big, txt = fact
    num = f'{n:02d}'
    if mobile:
        head = (f'<header style="display:flex;flex-direction:column;gap:12px"><div style="font:600 13px {F_B};letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Hoofdstuk {num}</div>'
                f'<h2 style="margin:0;font:600 30px/1.15 {F_H};color:var(--text)">{esc(title)}</h2>'
                f'<p style="margin:0;font:400 19px/1.4 {F_B};color:var(--text)">{esc(message)}</p>'
                f'<div style="display:flex;gap:16px;align-items:baseline;padding-top:12px;border-top:1px solid var(--border)"><span style="font:600 36px/1 {F_H};color:var(--p)">{esc(big)}</span>'
                f'<span style="font:400 15px/1.4 {F_B};color:var(--muted)">{esc(txt)}</span></div></header>')
    else:
        head = (f'<header style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:48px;align-items:end">'
                f'<div style="display:flex;flex-direction:column;gap:14px"><div style="font:600 13px {F_B};letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Hoofdstuk {num}</div>'
                f'<h2 style="margin:0;font:600 44px/1.1 {F_H};color:var(--text)">{esc(title)}</h2>'
                f'<p style="margin:0;font:400 22px/1.4 {F_B};color:var(--text);max-width:560px">{esc(message)}</p></div>'
                f'<div style="border-top:1px solid var(--border);padding-top:16px;display:flex;flex-direction:column;gap:6px"><span style="font:600 56px/1 {F_H};color:var(--p)">{esc(big)}</span>'
                f'<span style="font:400 16px/1.4 {F_B};color:var(--muted);max-width:340px">{esc(txt)}</span></div></header>')
    rule = '<div aria-hidden="true" style="border-top:2px solid var(--text);height:0"></div><div aria-hidden="true" style="border-top:1px solid var(--text);height:0;margin-top:3px"></div>'
    return (f'<section id="{key}" aria-labelledby="{key}-t" style="display:flex;flex-direction:column;gap:{24 if mobile else 32}px;scroll-margin-top:104px">'
            f'<div>{rule}</div>{head}<div style="display:flex;flex-direction:column;gap:24px">{"".join(blocks)}</div></section>')


# --------------- individual charts as cards ----------------
def kpi_stat(label, value, sub=None, big=False):
    return (f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font:600 {28 if big else 22}px/1.1 {F_H};color:var(--text)">{value}</span>'
            f'<span style="font:400 14px/1.35 {F_B};color:var(--muted)">{esc(label)}</span>' + (f'<span style="font:400 12px {F_B};color:var(--muted)">{esc(sub)}</span>' if sub else '') + '</div>')


def build_cards(m):
    """returns dict of card html for both layouts"""
    W_F = 310 if m else 976     # full width inner
    W_H = 310 if m else 452     # half width inner
    C = {}

    # herkomst-trend
    st = stacked_area(W_F, 240 if m else 320, mobile=m)
    lg = legend([('Nederland', 'p'), ('Europa', 's'), ('Buiten Europa', 'm3')]) if m else ''
    C['herkomst'] = card('herkomst-trend', 'Herkomst van inwoners per jaar', st + lg,
                         sub='Het aandeel met herkomst Nederland daalde van 66% (2013) naar 45% (2025).',
                         note='2022: de bron heeft geen uitsplitsing naar Europa en buiten Europa. Dat jaar is gemarkeerd als ontbrekend, niet als nul.', mobile=m)
    # leeftijd
    lf = S['leeftijd']['data']
    C['leeftijd'] = card('leeftijd', 'Inwoners naar leeftijd', bar_v(W_H, 230, [{'label': x['label'].replace('65', '65+') if x['label'] == '65' else x['label'], 'v': x['waarde'], 'cls': 'p'} for x in lf], label='Inwoners naar leeftijd'),
                         sub='De helft van de bewoners is 25 tot 45 jaar.', note='Het CBS rondt af op vijftallen; de groepen tellen daardoor op tot 1.375 in plaats van 1.381.', mobile=m)
    # inwoners-trend
    d = S['inwoners-trend']['data']
    xs = list(range(2013, 2027))
    ln = line_chart(W_F, 230, xs, [dict(vals=[x['waarde'] for x in d], cls='p')], 1300, 1420, [1300, 1340, 1380, 1420], nl,
                    [(2013, '2013'), (2017, '2017'), (2021, '2021'), (2026, '2026')],
                    marks=[dict(si=0, i=11, text='Piek 2024: 1.405', dy=-14), dict(si=0, i=13, text='1.381', dy=22, dx=0)], area=0, l=52, label='Inwoners per jaar 2013-2026')
    C['inwoners'] = card('inwoners-trend', 'Inwoners per jaar', ln, sub='Vrijwel stabiel rond 1.400; sinds 2024 licht dalend.', note='De verticale as begint bij 1.300, zodat de kleine schommelingen zichtbaar zijn.', mobile=m)
    # huishoudens
    hh = S['huishoudens']['data']
    C['huishoudens'] = card('huishoudens', 'Huishoudens', donut([dict(label=x['label'], v=x['waarde'], cls=c) for x, c in zip(hh, ['p', 'p6', 'p3'])], '860', 'huishoudens', size=148, share_fmt=lambda p: f'{p}%', mobile=m),
                            sub='59% woont alleen; gemiddeld 1,6 personen per huishouden.', note='Afgerond op vijftallen; de groepen tellen op tot 855 van 860.', mobile=m)
    # geslacht
    C['geslacht'] = card('geslacht', 'Mannen en vrouwen', donut([dict(label='Mannen', v=670, cls='p'), dict(label='Vrouwen', v=720, cls='p3')], '1.390', 'inwoners', size=132, mobile=m), mobile=m)
    # burgerlijke staat
    bs = S['burgerlijke-staat']['data']
    C['burgerlijk'] = card('burgerlijke-staat', 'Burgerlijke staat', bar_h(W_H, [dict(label=x['label'], v=x['waarde']) for x in bs], mobile=m, lw=120, rh=26), mobile=m)
    # geboorte-sterfte
    g = S['geboorte-sterfte']['data']
    yrs = [x['jaar'] for x in g]
    gl = line_chart(W_F, 220, yrs, [dict(vals=[x['geboorte'] for x in g], cls='p'), dict(vals=[x['sterfte'] for x in g], cls='m', dash='5 4')], 0, 24, [0, 8, 16, 24], nl,
                    [(2013, '2013'), (2017, '2017'), (2021, '2021'), (2025, '2025')],
                    marks=[dict(si=0, i=12, text='Geboorte 10', dy=-12, dx=-4, anchor='end'), dict(si=1, i=12, text='Sterfte 0', dy=20, dx=-4, anchor='end')], l=40, label='Geboorte en sterfte per 1.000 inwoners')
    C['geboorte'] = card('geboorte-sterfte', 'Geboorte en sterfte per 1.000 inwoners', gl + legend([('Geboorte', 'p'), ('Sterfte (streepjes)', 'm')]),
                         note='In 2025: 15 geboorten en 5 sterfgevallen in absolute aantallen.', mobile=m)
    # sankey
    sk = sankey_mobile(W_F) if m else sankey(W_F, 280)
    C['sankey'] = card('geboorteland', 'Geboorteland en herkomst', sk + (legend([('Herkomst Nederland', 'p'), ('Herkomst Europa', 's'), ('Herkomst buiten Europa', 'm3')]) if m else ''),
                       sub='820 inwoners zijn in Nederland geboren, 570 daarbuiten.', mobile=m)

    # woningwaarde
    d = S['woningwaarde']['data']
    xs = [int(x['key']) for x in d]
    vals = [x['waarde'] for x in d]
    kf = lambda v: '€ ' + (f'{nl(v/1000)}k' if v else '0')
    wl = line_chart(W_F, 250 if not m else 220, xs, [dict(vals=vals, cls='p')], 0, 700000, [0, 200000, 400000, 600000], kf,
                    [(2013, '2013'), (2016, '2016'), (2019, '2019'), (2022, '2022'), (2025, '2025')],
                    marks=[dict(si=0, i=0, text='€ 290.000', dy=-14, dx=18), dict(si=0, i=10, text='Piek 2023: € 642.000', dy=-14), dict(si=0, i=12, text='€ 611.000', dy=22, dx=-4, anchor='end')], area=0, l=56, label='Gemiddelde WOZ-waarde 2013-2025')
    C['woz'] = card('woningwaarde', 'Gemiddelde WOZ-waarde per jaar', wl, sub='Van € 290.000 naar € 611.000: meer dan verdubbeld (+111%) sinds 2013.', mobile=m)
    ed = S['eigendom']['data']
    C['eigendom'] = card('eigendom', 'Koop en huur', donut([dict(label=x['label'], v=x['waarde'], cls=c) for x, c in zip(ed, ['p', 'p3', 'p6'])], '885', 'woningen', size=148, share_fmt=lambda p: f'{p}%', mobile=m),
                         sub='Ruim de helft is huur bij een particuliere verhuurder.', mobile=m)
    bp = [('Voor 1700', 0), ('1700 tot 1900', 510), ('1900 tot 1925', 440), ('1925 tot 1950', 8), ('1950 en later (6 periodes)', 0)]
    C['bouw'] = card('bouwperiode', 'Bouwperiode van de adressen', bar_h(W_H, [dict(label=a, v=b_) for a, b_ in bp], mobile=m, lw=172, rh=32), sub='Alle woningen zijn van vóór 1945.', note='Aantal adressen per bouwperiode van het pand; vanaf 1950 is het aantal 0.', mobile=m)
    el = [x for x in S['energielabels']['data'] if x['waarde'] > 0]
    ei = [dict(label=x['label'], v=x['waarde'], cls='c' if x['label'] == 'G' else 'p') for x in el]
    C['energie'] = card('energielabels', 'Energielabels', bar_v(W_H, 230, ei, gap=0.3, label='Energielabels van adressen'), sub='Label C komt het meest voor; 194 adressen hebben label G.',
                        note='Labels A+++ en hoger komen niet voor. 38 adressen hebben geen label, 152 een voorlopig label.', mobile=m)
    ev = S['energieverbruik']['data']
    ys = [x['jaar'] for x in ev]
    gas = line_chart(W_H, 150, ys, [dict(vals=[x['gas_m3'] for x in ev], cls='p')], 0, 1200, [0, 600, 1200], nl, [(2013, '2013'), (2018, '2018'), (2024, '2024')],
                     marks=[dict(si=0, i=0, text='1.100', dy=-12, dx=14), dict(si=0, i=11, text='640', dy=-12)], l=44, t=20, label='Gasverbruik per woning')
    st_ = line_chart(W_H, 150, ys, [dict(vals=[x['stroom_kwh'] for x in ev], cls='p')], 0, 2400, [0, 1200, 2400], nl, [(2013, '2013'), (2018, '2018'), (2024, '2024')],
                     marks=[dict(si=0, i=0, text='2.100', dy=-12, dx=14), dict(si=0, i=11, text='1.780', dy=-12)], l=44, t=20, label='Stroomverbruik per woning')
    lab = lambda t: f'<div style="font:600 13px {F_B};color:var(--text);margin-bottom:-4px">{t}</div>'
    C['verbruik'] = card('energieverbruik', 'Gas en stroom per woning', lab('Gas (m³ per woning)') + gas + lab('Stroom (kWh per woning)') + st_,
                         sub='Gasverbruik daalde van 1.100 m³ (2013) naar 640 m³ (2024).', note='Twee aparte grafieken, elk met een eigen eenheid en as.', mobile=m)

    # inkomen
    ik = S['inkomen']['data']
    stats = ''.join([kpi_stat('Per inkomensontvanger', '€ 67.400', '2023'), kpi_stat('Huishoudinkomen', '€ 51.000', '2023'), kpi_stat('Mediaan vermogen huishoudens', '€ 33.000', '2024'),
                     kpi_stat('Personen in armoede', '6,6%', '2024'), kpi_stat('Huishoudens met laag inkomen', '8,3%', '2023'), kpi_stat('Onder of rond sociaal minimum', '9,5%', '2023')])
    body = (f'<div style="display:grid;grid-template-columns:{"1fr" if m else "minmax(0,1fr) minmax(0,1.6fr)"};gap:{24 if m else 48}px;align-items:end">'
            f'<div style="display:flex;flex-direction:column;gap:4px"><span style="font:600 {44 if m else 64}px/1 {F_H};color:var(--p)">€ 58.400</span><span style="font:400 16px/1.4 {F_B};color:var(--muted)">gemiddeld inkomen per inwoner, 2023</span></div>'
            f'<div>{income_scale(W_F if m else 560)}</div></div>'
            f'<div style="display:grid;grid-template-columns:repeat({2 if m else 3},minmax(0,1fr));gap:20px 24px;border-top:1px solid var(--border);padding-top:20px">{stats}</div>')
    C['inkomen'] = card('inkomen', 'Inkomen', body, sub='Anderhalf keer zoveel als het Nederlandse gemiddelde (€ 34.900).', mobile=m)
    iv = S['inkomen-vergelijking']['data']
    rows = [dict(label=x['label'], v=x['waarde'], cls='p' if x['is_duivelseiland'] else ('s' if x['is_wijk'] else 'm3'), strong=x['is_duivelseiland'] or x['is_wijk']) for x in iv]
    C['ikvergelijk'] = card('inkomen-vergelijking', 'Inkomen per inwoner in de buurten van het Museumkwartier', bar_h(W_H, rows, fmt=lambda v: '€ ' + nl(v), mobile=True, valw=76, mx=105000) + legend([('Duivelseiland', 'p'), ('Wijk Museumkwartier', 's'), ('Andere buurten', 'm3')]),
                            sub='Nederland: € 34.900. Amsterdam: € 41.000.', mobile=m)
    bd = sorted([x for x in S['bedrijven']['data'] if x['waarde'] > 0], key=lambda x: -x['waarde'])
    C['bedrijven'] = card('bedrijven', 'Bedrijfsvestigingen per sector', bar_h(W_H, [dict(label=x['label'], v=x['waarde'], cls='p' if k == 0 else 'p6') for k, x in enumerate(bd)], mobile=True, valw=48), sub='Van de 405 vestigingen is een derde zakelijke dienstverlening.', mobile=m)

    # mobiliteit
    vt = sorted(S['voertuigen']['data'], key=lambda x: -x['waarde'])
    C['voertuigen'] = card('voertuigen', 'Voertuigen op naam van bewoners', bar_v(W_H, 220, [dict(label=x['label'], v=x['waarde']) for x in vt], gap=0.4), sub='717 voertuigen, waarvan 575 personenauto’s.',
                           note='RDW telt alle voertuigen op naam van buurtadressen. De CBS-telling hieronder is een andere reeks; zet ze niet naast elkaar.', mobile=m)
    C['autohh'] = card('vervoer-cbs', 'Auto’s per huishouden', f'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px">{kpi_stat("Personenauto’s per huishouden", "0,34", "2025", big=True)}{kpi_stat("Personenauto’s (CBS)", "295", "2025", big=True)}</div>'
                       f'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px">{kpi_stat("Motorfietsen", "20", "2025")}{kpi_stat("Personenauto’s per km²", "4.917", "Nederland: 275")}</div>', mobile=m)
    d = S['elektrische-autos']['data']
    xs = list(range(len(d)))
    el_ = line_chart(W_H, 230 if m else 330, xs, [dict(vals=[x['waarde'] for x in d], cls='p')], 0, 70, [0, 20, 40, 60], nl, [(0, 'mrt ’22'), (12, 'mrt ’23'), (24, 'mrt ’24'), (36, 'mrt ’25'), (48, 'mrt ’26')],
                     marks=[dict(si=0, i=0, text='16', dy=-12, dx=8), dict(si=0, i=53, text='63', dy=-12, dx=-4, anchor='end')], area=0, l=40, label='Elektrische auto’s per maand')
    C['elektrisch'] = card('elektrische-autos', 'Elektrische auto’s per maand', el_, sub='Van 16 (maart 2022) naar 63 (september 2026).', note='63 elektrische auto’s: 60 personenauto’s en 3 bedrijfsauto’s. De 106 in de brandstofgrafiek bevat ook 43 elektrische bromfietsen.', mobile=m)
    sb = stacked_bar(W_H, 220)
    C['ongevallen'] = card('verkeersongevallen', 'Verkeersongevallen per jaar', sb + legend([('Materiële schade', 'p3'), ('Letsel', 'c4')]), sub='14 ongevallen in 2025: 11 met materiële schade, 3 met letsel, 0 dodelijk.', mobile=m)
    C['dichtheid'] = card('dichtheid', 'Dichtheid per km²', bar_compare(W_H), sub='Duivelseiland is 43 keer zo dicht bevolkt als Nederland.', note='Elke rij heeft een eigen schaal; de grijze balk is Nederland.', mobile=m)

    # veiligheid
    d = S['misdaad-jaren']['data']
    xs = [int(x['key']) for x in d]
    ml = line_chart(W_H, 230, xs, [dict(vals=[x['waarde'] for x in d], cls='p')], 0, 180, [0, 60, 120, 180], nl, [(2012, '2012'), (2016, '2016'), (2020, '2020'), (2025, '2025')],
                    marks=[dict(si=0, i=1, text='Piek 2013: 159', dy=-12, dx=30), dict(si=0, i=13, text='115', dy=-12, dx=-2)], area=0, l=40, label='Geregistreerde misdrijven per jaar')
    C['misdaadjaren'] = card('misdaad-jaren', 'Geregistreerde misdrijven per jaar', ml, sub='Sinds 2015 rond de 110 per jaar; 115 in 2025.', mobile=m)
    ms = S['misdaad-soorten']['data']
    C['misdaadsoorten'] = card('misdaad-soorten', 'Meest voorkomende misdrijven in 2025', bar_h(W_H, [dict(label=x['label'], v=x['waarde'], cls='c' if k == 0 else 'p6') for k, x in enumerate(ms)], mobile=True, valw=40),
                               sub='39 van de 115 misdrijven waren fietsen-, brom- of snorfietsdiefstal.', note='Top 10 van soorten.', mobile=m)
    mp = S['misdaad-per-1000']['data']
    C['misdaad1000'] = card('misdaad-per-1000', 'Misdrijven per 1.000 inwoners', bar_h(W_H, [dict(label=x['label'], v=x['waarde']) for x in sorted(mp, key=lambda x: -x['waarde'])], mobile=True, valw=40), sub='In totaal 83 per 1.000 inwoners.', mobile=m)

    # gezondheid
    tv = S['tevredenheid']['data']
    C['tevreden'] = card('tevredenheid', 'Tevreden met wonen', meters([dict(label=x['label'], v=x['waarde']) for x in tv], cols=1), sub='90% is tevreden met de woonomgeving.', mobile=m)
    lv = S['leefstijl']['data']
    C['leefstijl'] = card('leefstijl', 'Bewegen en gewicht', meters([dict(label=x['label'], v=x['waarde'], cls='c' if 'gewicht' in x['label'].lower() or 'obesitas' in x['label'].lower() else 'p') for x in lv], cols=1), mobile=m)
    g = S['gezondheid-trend']['data']
    yrs = [x['jaar'] for x in g]
    gt = line_chart(W_H, 230, yrs, [dict(vals=[x['van_18_tot_65'] for x in g], cls='p'), dict(vals=[x['vanaf_65'] for x in g], cls='s'), dict(vals=[x['vanaf_18'] for x in g], cls='m', dash='5 4')], 50, 100, [50, 75, 100], lambda v: f'{v}%',
                    [(2012, '2012'), (2016, '2016'), (2020, '2020'), (2024, '2024')], rgt=20, l=44, label='Inwoners met een goede gezondheid')
    C['gezondheid'] = card('gezondheid-trend', 'Inwoners met een goede gezondheid', gt + legend([('18 tot 65 jaar', 'p'), ('65 jaar of ouder', 's'), ('18 jaar of ouder (streepjes)', 'm')]),
                           sub='In 2024: 82% van de 18- tot 65-jarigen.', note='Enquêtegebaseerd (steekproef), daarom een schatting.', mobile=m)
    wz = S['welzijn']['data']
    C['welzijn'] = card('welzijn', 'Welzijn en eenzaamheid', meters([dict(label=x['label'], v=x['waarde'], cls='c' if x['key'] in ('eenzaam', 'ernstig-eenzaam') else 'p') for x in wz], cols=1, colgap=40), sub='93% krijgt steun van anderen; 48% voelt zich eenzaam.', mobile=m)
    ar = S['alcohol-roken']['data']
    rows = [dict(label=x['label'], vals=[x['18 jaar of ouder'], x['18 tot 65 jaar'], x['65 jaar of ouder']]) for x in ar]
    C['alcohol'] = card('alcohol-roken', 'Alcohol en roken', legend([('18 jaar of ouder', 'p'), ('18 tot 65 jaar', 'p6'), ('65 jaar of ouder', 'p3')]) + grouped_h(W_H, rows, [dict(cls='p'), dict(cls='p6'), dict(cls='p3')], fmt=lambda v: f'{v}%', mx=100), mobile=m)
    gh = S['geluidhinder']['data']
    C['geluid'] = card('geluidhinder', 'Ernstige geluidhinder door', bar_h(W_H, [dict(label=x['label'].capitalize(), v=x['waarde']) for x in gh], fmt=lambda v: f'{v}%', mobile=m, lw=110, rh=26), mobile=m)

    # voorzieningen
    C['voorzieningen'] = card('voorzieningen', 'Gemiddelde afstand tot voorzieningen', distance(W_F, mobile=m), sub='Bijna alles binnen een kilometer; alleen het treinstation ligt verder weg (2,1 km).', note='Gemiddelde afstand over de weg vanaf een adres in de buurt.', mobile=m)
    sa = S['school-afstand']['data']
    ser = [dict(cls='p'), dict(cls='s'), dict(cls='s5'), dict(cls='m')]
    rows = [dict(label=x['label'], vals=[x['duivelseiland'], x['museumkwartier'], x['amsterdam'], x['nederland']]) for x in sa]
    C['school'] = card('school-afstand', 'Afstand tot scholen en opvang (km)', legend([('Duivelseiland', 'p'), ('Museumkwartier', 's'), ('Amsterdam', 's5'), ('Nederland', 'm')]) + grouped_h(W_H, rows, ser, mx=3.6),
                       sub='Voortgezet onderwijs ligt gemiddeld 0,4 km weg; in Nederland 2,5 km.', note='In de buurt zelf staat geen school of kinderopvang.', mobile=m)
    lr = S['leerlingen']['data']
    C['leerlingen'] = card('leerlingen', 'Leerlingen en studenten die in de buurt wonen', bar_v(W_H, 220, [dict(label=x['label'].replace('Leerlingen ', '').replace('Studenten ', ''), v=x['waarde']) for x in lr], gap=0.4), sub='180 in totaal; WO-studenten vormen de grootste groep (70).', mobile=m)
    C['opleiding'] = card('opleidingsniveau', 'Opleidingsniveau (15 tot 75 jaar)', donut([dict(label='Hoger', v=940, cls='p', share_text='76%'), dict(label='Middelbaar', v=190, cls='p6', share_text='15%'), dict(label='Praktisch', v=100, cls='p3', share_text='8%')], '76%', 'hoger opgeleid', size=148, mobile=m),
                          sub='940 van de 1.230 inwoners is hoger opgeleid.', note='Het percentage 76% is afgeleid van de aantallen; de bron toont hier ten onrechte 100%. Jaargangen verschillen (2023 en 2024).', mobile=m)

    # vergelijking
    dbg = dumbbell(W_F, mobile=m)
    shp = ('<div style="display:flex;gap:6px 20px;flex-wrap:wrap;font:400 13px ' + F_B + ';color:var(--text)">'
           '<span style="display:inline-flex;gap:8px;align-items:center"><svg width="14" height="14"><circle cx="7" cy="7" r="6" class="fp"></circle></svg>Duivelseiland</span>'
           '<span style="display:inline-flex;gap:8px;align-items:center"><svg width="14" height="14"><rect x="1" y="1" width="12" height="12" class="fs"></rect></svg>Amsterdam</span>'
           '<span style="display:inline-flex;gap:8px;align-items:center"><svg width="14" height="14"><path d="M7 0 L14 7 L7 14 L0 7 Z" class="fm"></path></svg>Nederland</span></div>')
    C['onderscheid'] = card('onderscheidend', 'Wat Duivelseiland onderscheidt van Nederland', shp + dbg, sub='Elke rij heeft een eigen schaal.',
                            note='Hoger opgeleid: 76% is afgeleid van de aantallen (940 van 1.230); de bron toont hier ten onrechte 100%.', mobile=m)
    vk = S['verkiezingen']['data'][:10]
    rest = S['verkiezingen']['data'][10:]
    rest_v = sum(x['waarde'] for x in rest)
    C['verkiezingen'] = card('verkiezingen', 'Gemeenteraadsverkiezingen, 18 maart 2026', bar_h(W_H, [dict(label=x['label'], v=x['waarde']) for x in vk], mobile=True, valw=48, fmt=nl) if False else
                             bar_h(W_H, [dict(label=f"{x['label']}  {nl(x['aandeel'],1)}%", v=x['waarde']) for x in vk], mobile=True, valw=48),
                             sub='Aantal stemmen, geordend op stemmen. Eén kleur voor alle partijen.', note=f'Som van de twee stembureaus in de buurt. Zeven kleinere partijen zijn niet getoond ({nl(rest_v)} stemmen). Aandeel is zelf berekend uit {nl(2368)} stemmen.', mobile=m)
    C['scatter'] = card('vergelijk-woz-65plus', 'Woningwaarde en aandeel 65-plussers', scatter(W_H, 300 if not m else 270, mobile=m) + legend([('Duivelseiland', 'p'), ('Wijk Museumkwartier', 's'), ('Overige gebieden', 'm3')]),
                        note='Museumplein en Vondelpark-Oost hebben minder dan 10 woningen en zijn statistisch onbetrouwbaar (gestippelde cirkels).', mobile=m)

    bk = S['voorzieningen']['binnen_5_km']
    bstats = ''.join(kpi_stat(x['label'], nl(x['waarde'], 1 if x['waarde'] != int(x['waarde']) else 0)) for x in bk)
    C['bereik'] = card('voorzieningen', 'Binnen bereik', f'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 20px">{bstats}</div>', sub='Gemiddeld aantal binnen 1 of 5 kilometer.', mobile=m)
    return C
