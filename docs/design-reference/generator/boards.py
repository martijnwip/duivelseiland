from assemble import *


def tag(t):
    return f'<span style="display:inline-block;font:600 12px ui-monospace,Menlo,monospace;border:1px solid var(--rule);border-radius:4px;padding:2px 8px;color:var(--text)">{esc(t)}</span>'


def ul(items):
    return '<ul style="margin:0;padding:0 0 0 18px;display:flex;flex-direction:column;gap:6px;font:400 15px/1.45 ' + F_B + ';color:var(--text)">' + ''.join(f'<li>{esc(i)}</li>' for i in items) + '</ul>'


def h2(t, sz=32):
    return f'<h2 style="margin:0;font:600 {sz}px/1.15 {F_H};color:var(--text)">{esc(t)}</h2>'


def board(theme, title, intro, inner, width=1440):
    head = (f'<div style="display:flex;flex-direction:column;gap:12px;padding-bottom:32px;border-bottom:2px solid var(--text)"><span style="font:600 13px {F_B};letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Buurt statistieken · ontwerpbord</span>'
            f'<h1 style="margin:0;font:700 48px/1.05 {F_S};color:var(--p)">{esc(title)}</h1><p style="margin:0;font:400 19px/1.5 {F_B};max-width:760px">{esc(intro)}</p></div>')
    return f'<div style="padding:64px;display:flex;flex-direction:column;gap:56px">{head}{inner}</div>'


def spec_row(typ, title, bullets, card_html, full):
    aside = f'<div style="display:flex;flex-direction:column;gap:14px;width:240px;flex:none">{tag("type: " + typ)}{h2(title, 22)}{ul(bullets)}</div>'
    return f'<section style="display:flex;gap:48px;align-items:flex-start;padding-top:32px;border-top:1px solid var(--border)">{aside}<div style="width:{1024 if full else 500}px;flex:none">{card_html}</div></section>'


def overlay(svg_str, extra):
    i = svg_str.rindex('</svg>')
    return svg_str[:i] + extra + svg_str[i:]


def specimens(C):
    rows = [
        ('kpi', 'Kerncijfer', ['Groot cijfer, klein label en het jaartal.', 'Vergelijking als markering op een schaal: Duivelseiland (cirkel), Amsterdam (vierkant), Nederland (ruit).', 'Vorm en kleur onderscheiden de gebieden, kleur alleen is niet genoeg.'], C['inkomen'], True),
        ('line', 'Lijn', ['Eén lijn, hooguit drie. Piek en laatste waarde staan direct op de grafiek.', 'Geen legenda waar een direct label kan.', 'De as begint bij nul, behalve waar de noot dat vermeldt.'], C['woz'], True),
        ('stackedArea', 'Gestapeld vlak', ['Kern van hoofdstuk 1: het aandeel Nederland krimpt.', 'Ontbrekend jaar (2022) is gearceerd en benoemd, geen nul.', 'Twee labels in het vlak, de rest als directe label rechts.'], C['herkomst'], True),
        ('bar', 'Staaf', ['Natuurlijke volgorde (leeftijd, label A naar G, bouwperiode).', 'Waarde boven de staaf; terracotta alleen voor de uitzondering (label G).'], C['energie'], False),
        ('barHorizontal', 'Horizontale staaf', ['Gesorteerd op waarde, label boven de balk zodat lange namen passen.', 'Eén kleur voor alle balken; de hoofdrol krijgt een tint.'], C['bedrijven'], False),
        ('donut', 'Donut', ['Alleen bij twee of drie delen.', 'Het totaal staat in het midden; percentages in de legenda.'], C['eigendom'], False),
        ('stackedBar', 'Gestapelde staaf', ['Per afloop gestapeld; het laatste jaar krijgt een sterkere kleur.', 'De annotatie noemt de cijfers van het laatste jaar.'], C['ongevallen'], False),
        ('groupedBar', 'Gegroepeerde staaf', ['Buurt naast wijk, Amsterdam en Nederland.', 'Groen is de buurt, koper de vergelijkingsgebieden, grijs Nederland.'], C['school'], False),
        ('meters', 'Meters', ['Percentages van 0 tot 100 in een raster van dunne balken.', 'Geen taart; schatting krijgt een badge.'], C['tevreden'], False),
        ('distance', 'Afstandsschaal', ['Icoon per voorziening, dichtbij links.', 'De uitzondering (treinstation) in terracotta.'], C['voorzieningen'], True),
        ('barCompare', 'Vergelijking met factor', ['Duivelseiland tegenover Nederland, met de factor in beeld (43×).', 'Elke rij heeft een eigen schaal, dat staat in de noot.'], C['dichtheid'], False),
        ('compare', 'Vergelijking op één schaal', ['Drie markeringen per rij: cirkel, vierkant, ruit.', 'Afgeleide waarde is als zodanig gelabeld.'], C['onderscheid'], True),
        ('scatter', 'Spreiding', ['Alleen de buurt en de wijk hebben een label.', 'Gebieden met minder dan 10 woningen: gestippelde cirkel.'], C['scatter'], False),
        ('sankey', 'Sankey', ['Van geboorteland naar herkomst.', 'Op mobiel vervangen door twee gestapelde balken.'], C['sankey'], True),
    ]
    inner = ''.join(spec_row(*r_) for r_ in rows)
    return board('light', 'Grafiektypes', 'Elk type uit de brief één keer uitgewerkt, met de echte cijfers uit het bestand. Op de pagina wordt elk type herhaald in dezelfde vorm.', inner)


def hover_chart(w, h, mobile=False):
    d = S['woningwaarde']['data']
    xs = [int(x['key']) for x in d]
    vals = [x['waarde'] for x in d]
    kf = lambda v: '€ ' + (f'{nl(v/1000)}k' if v else '0')
    l, rgt, t, b = 56, 20, 14, 28
    X = lin(2013, 2025, l, w - rgt)
    Y = lin(0, 700000, h - b, t)
    base = line_chart(w, h, xs, [dict(vals=vals, cls='p')], 0, 700000, [0, 200000, 400000, 600000], kf, [(2013, '2013'), (2016, '2016'), (2019, '2019'), (2022, '2022'), (2025, '2025')], area=0, l=l, label='Gemiddelde WOZ-waarde, met tooltip bij 2023')
    x, y = X(2019), Y(485000)
    tw = 150
    tx = min(max(x - tw / 2, 4), w - tw - 4)
    ex = (T('line', x1=x, x2=x, y1=t, y2=h - b, stroke='var(--rule)', stroke_width=1, stroke_dasharray='3 3') + T('circle', cx=x, cy=y, r=6, cls='fp', stroke='var(--card)', stroke_width=2)
          + T('rect', x=tx, y=y - 72, width=tw, height=56, rx=6, fill='var(--text)')
          + T('text', '2019', x=tx + 12, y=y - 54, style='font:400 12px "Source Sans 3";fill:var(--bg);opacity:.75')
          + T('text', '€ 485.000', x=tx + 12, y=y - 36, style='font:600 15px Lexend;fill:var(--bg)')
          + T('text', 'Bron: CBS', x=tx + 12, y=y - 22, style='font:400 11px "Source Sans 3";fill:var(--bg);opacity:.75'))
    return overlay(base, ex)


def table_card():
    d = S['woningwaarde']['data']
    half = (len(d) + 1) // 2
    def tbl(rows):
        tr = ''.join(f'<tr><th scope="row" style="text-align:left;font:400 14px {F_B};padding:8px 12px 8px 0;border-top:1px solid var(--border)">{x["key"]}</th><td style="text-align:right;font:600 14px {F_H};padding:8px 0;border-top:1px solid var(--border)">€ {nl(x["waarde"])}</td></tr>' for x in rows)
        return f'<table style="border-collapse:collapse;width:100%"><thead><tr><th scope="col" style="text-align:left;font:600 12px {F_B};color:var(--muted);padding:0 0 6px">Jaar</th><th scope="col" style="text-align:right;font:600 12px {F_B};color:var(--muted);padding:0 0 6px">Gemiddelde WOZ-waarde</th></tr></thead><tbody>{tr}</tbody></table>'
    focus = f'outline:2px solid var(--p);outline-offset:3px;border-radius:4px'
    btn = f'<button type="button" aria-expanded="true" style="display:inline-flex;gap:8px;align-items:center;background:none;border:0;color:var(--muted);font:500 14px {F_B};padding:12px 8px;min-height:44px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;white-space:nowrap;{focus}">{ICON_TABLE}Toon als grafiek</button>'
    return (f'<figure style="margin:0;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:24px;display:flex;flex-direction:column;gap:16px"><div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start">'
            f'<div><h3 style="margin:0;font:600 18px/1.3 {F_H}">Gemiddelde WOZ-waarde per jaar</h3><p style="margin:4px 0 0;font:400 14px {F_B};color:var(--muted)">Tabelweergave van dezelfde cijfers</p></div>{btn}</div>'
            f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">{tbl(d[:half])}{tbl(d[half:])}</div>'
            f'<div style="border-top:1px solid var(--border);padding-top:0;font:400 13px {F_B};color:var(--muted)">Bron: CBS, 2013-2025</div></figure>')


def panel(title, desc, inner, w=None):
    return (f'<section style="display:flex;flex-direction:column;gap:16px;{f"width:{w}px;flex:none;" if w else "min-width:0;"}"><div style="display:flex;flex-direction:column;gap:6px">{h2(title, 22)}'
            f'<p style="margin:0;font:400 15px/1.5 {F_B};color:var(--muted);max-width:560px">{esc(desc)}</p></div>{inner}</section>')


def state_card(title, inner):
    return (f'<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:20px;display:flex;flex-direction:column;gap:12px;min-width:0"><div style="font:600 13px {F_B};letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">{esc(title)}</div>{inner}</div>')


def interactie(C, CM):
    hov_d = card('woningwaarde', 'Gemiddelde WOZ-waarde per jaar', hover_chart(452, 250), sub='Hover of focus toont waarde, eenheid en jaartal.', jaar='2013-2025', mobile=False)
    hov_m = card('woningwaarde', 'Gemiddelde WOZ-waarde per jaar', hover_chart(310, 220, True) +
                 f'<div role="status" style="border:1px solid var(--rule);border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;gap:12px;font:400 14px {F_B}"><span>2019</span><span style="font:600 15px {F_H}">€ 485.000</span><span style="color:var(--muted)">CBS</span></div>', sub='Tap kiest een jaar; de waarde staat ook onder de grafiek.', jaar='2013-2025', mobile=True)
    sec1 = panel('Hover, focus en tap', 'Op desktop verschijnt een tooltip met waarde, eenheid en jaartal. Op mobiel kiest een tik een jaar en staat de waarde vast onder de grafiek, zodat niets van hover afhangt. Grafieken zijn focusbaar; met de pijltjestoetsen schuift de markering per jaar.',
                 f'<div style="display:flex;gap:32px;align-items:flex-start"><div style="width:500px;flex:none">{hov_d}</div><div style="width:342px;flex:none">{hov_m}</div></div>')
    sec2 = panel('Toon als tabel', 'Elke grafiek heeft een knop die dezelfde cijfers als echte tabel toont, met kolomkoppen en jaartal. De knop heeft een zichtbare focusring en een aanraakdoel van minstens 44 pixels.', f'<div style="width:700px">{table_card()}</div>')
    dashed = f'border:1.5px dashed var(--rule);border-radius:8px;padding:28px 20px;display:flex;flex-direction:column;gap:6px;align-items:flex-start'
    geen = state_card('Geen data', f'<div style="{dashed}"><span style="font:600 16px {F_H}">Geen gegevens beschikbaar</span><span style="font:400 14px/1.45 {F_B};color:var(--muted)">De bron levert voor 2022 geen uitsplitsing naar herkomst. Een hele grafiek zonder data toont dit vlak; één ontbrekend jaar toont de arcering uit de gestapelde vlakgrafiek.</span></div>')
    sch = state_card('Schatting', f'<div style="display:flex;flex-direction:column;gap:8px"><span style="font:600 32px/1 {F_H}">90%</span><span style="font:400 14px {F_B}">tevreden met de woonomgeving</span>'
                     f'<span style="display:inline-flex;gap:10px;align-items:center;font:400 13px {F_B};color:var(--muted)">Schatting, bron: RIVM Gezondheidsmonitor, 2024{badge()}</span></div>')
    klein = state_card('Klein aantal', f'<div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font:400 14px {F_B};color:var(--muted)"><span>Buurt Museumplein</span><span>5 woningen</span></div>'
                       f'<div style="height:8px;border-radius:4px;background:var(--border)"></div><span style="font:400 13px/1.45 {F_B};color:var(--muted)">Minder dan 10 woningen: statistisch onbetrouwbaar. Grijs, zonder label op de spreiding.</span></div>')
    afg = state_card('Afgeleid en afgerond', f'<div style="display:flex;flex-direction:column;gap:8px"><span style="display:flex;gap:10px;align-items:baseline"><span style="font:600 32px/1 {F_H}">76%</span><span style="font:400 13px {F_B};border:1px solid var(--rule);border-radius:999px;padding:1px 10px">afgeleid</span></span>'
                     f'<span style="font:400 13px/1.45 {F_B};color:var(--muted)">940 van de 1.230 inwoners. Het CBS rondt af op vijftallen: de leeftijdsgroepen tellen op tot 1.375 in plaats van 1.381; dat staat in een noot, niet als fout.</span></div>')
    sec3 = panel('Toestanden', 'Ontbrekende gegevens, schattingen, kleine aantallen en afgeleide of afgeronde waarden hebben elk een eigen, rustige weergave.', f'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;width:760px">{geen}{sch}{klein}{afg}</div>')
    m1 = more(['Mannen en vrouwen', 'Burgerlijke staat', 'Geboorteland', 'Geboorte en sterfte'], False)
    m2 = more(['Mannen en vrouwen', 'Burgerlijke staat', 'Geboorteland', 'Geboorte en sterfte'], True, f'<div style="font:400 14px {F_B};color:var(--muted)">De uitgeklapte kaarten staan onder de knop; de knop toont een pijl omhoog.</div>')
    sec4 = panel('Meer cijfers', 'Details staan ingeklapt onder één knop met het aantal en de titels. Uitklappen verplaatst de focus niet.', f'<div style="display:flex;flex-direction:column;gap:16px;width:700px">{m1}{m2}</div>')
    navd = f'<div style="display:flex;gap:48px">{rail(3)}<div style="width:280px;padding-top:4px;font:400 14px/1.5 {F_B};color:var(--muted)">Desktop: de inhoudsopgave blijft links staan, het huidige hoofdstuk is vet en de voortgangsbalk loopt mee.</div></div>'
    navm = f'<div style="width:390px;border:1px solid var(--border);border-radius:8px;overflow:hidden">{mobile_nav(3)}</div>'
    lijst = ('<ul style="list-style:none;margin:0;padding:8px 16px;display:flex;flex-direction:column">' + ''.join(f'<li><a href="#{k}" style="display:flex;gap:12px;min-height:44px;align-items:center;text-decoration:none;color:var(--text);font:{600 if i==3 else 400} 15px {F_B}"><span style="width:22px;font:600 12px {F_H};color:var(--p)">{i+1:02d}</span>{esc(n)}</a></li>' for i, (k, n) in enumerate(CHAPTERS)) + '</ul>')
    navm2 = f'<div style="width:390px;border:1px solid var(--border);border-radius:8px;overflow:hidden">{mobile_nav(3)}{lijst}</div>'
    sec5 = panel('Sectienavigatie', 'Op desktop een sticky inhoudsopgave; op mobiel een compacte balk onder de header met het huidige hoofdstuk en een voortgangsbalk. Tik opent de lijst met hoofdstukken.', f'<div style="display:flex;gap:48px;align-items:flex-start;flex-wrap:wrap">{navd}<div style="display:flex;flex-direction:column;gap:16px">{navm}{navm2}</div></div>')
    nlh = card('geboorteland', 'Geboorteland en herkomst', '<div style="height:24px"></div>', sub='820 inwoners zijn in Nederland geboren, 570 daarbuiten.', mobile=True)
    enh = card('geboorteland', 'Country of birth and origin', '<div style="height:24px"></div>', sub='820 residents were born in the Netherlands, 570 elsewhere.', mobile=True).replace('Toon als tabel', 'Show as table').replace('Bron: CBS', 'Source: CBS')
    sec6 = panel('Taalwissel NL en EN', 'Engelse titels en zinnen zijn zo’n 30% langer. Koppen en knoppen mogen over twee regels lopen; er staan geen vaste breedtes op teksten.', f'<div style="display:flex;gap:24px"><div style="width:342px;flex:none">{nlh}</div><div style="width:342px;flex:none">{enh}</div></div>')
    sec7 = panel('Beweging', 'Alleen subtiel: getallen tellen in 600 ms naar hun waarde, lijnen tekenen zich in 800 ms. Bij prefers-reduced-motion staat direct de eindstand op het scherm.',
                 ul(['Kerncijfers tellen omhoog zodra ze in beeld komen.', 'Lijnen en vlakken tekenen zich van links naar rechts.', 'Geen beweging bij hover behalve de tooltip zelf.', 'Met prefers-reduced-motion: geen animatie, wel dezelfde inhoud.']))
    inner = f'<div style="display:flex;flex-direction:column;gap:64px">{sec1}{sec2}{sec3}{sec4}{sec5}{sec6}{sec7}</div>'
    return board('light', 'Interactie en toestanden', 'Hoe de grafieken reageren en wat ze tonen als gegevens ontbreken, geschat of afgerond zijn.', inner)


def make(CD, CM):
    out = {}
    for theme, tn in (('light', 'Licht'),):
        out['Grafiektypes.dc.html'] = dc('Grafiektypes', rootstyle('light', 1440), specimens(CD), 1440, 3000)
        out['Interactie.dc.html'] = dc('Interactie en toestanden', rootstyle('light', 1440), interactie(CD, CM), 1440, 3000)
    return out
