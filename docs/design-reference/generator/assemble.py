from page import *

SUN = '<svg width="20" height="20" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><circle cx="7.5" cy="7.5" r="2.8"></circle><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M12.1 2.9l-1.4 1.4M4.3 10.7l-1.4 1.4"></path></svg>'
MOON = '<svg width="20" height="20" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><path d="M12.5 9A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 6.5 6.5z"></path></svg>'
MENU = '<svg width="24" height="24" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M2 4h11M2 7.5h11M2 11h11"></path></svg>'
ARROW_DOWN = '<svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M7.5 2v10M3 8l4.5 4.5L12 8"></path></svg>'


def ibtn(label, inner):
    return f'<button type="button" aria-label="{esc(label)}" style="display:inline-flex;align-items:center;gap:4px;min-width:44px;height:44px;justify-content:center;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text);cursor:pointer">{inner}</button>'


def header(dark, m):
    themeicon = MOON if dark else SUN
    lang = ibtn('Taal wijzigen', f'<span aria-hidden="true" style="font:600 12px {F_B};border:1px solid var(--rule);border-radius:4px;padding:1px 5px">NL</span>' + ('' if m else f'<span style="font:500 14px {F_B}">Nederlands</span>'))
    return (f'<header style="position:sticky;top:0;z-index:5;height:80px;box-sizing:border-box;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--bg) 95%,transparent);backdrop-filter:blur(6px);'
            f'display:flex;align-items:center;justify-content:space-between;padding:0 {16 if m else 32}px">'
            f'<a href="#top" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--p);font:700 {25 if m else 30}px {F_S};letter-spacing:-0.025em"><img src="{LOGO}" alt="" style="height:36px;width:auto">Duivelseiland</a>'
            f'<div style="display:flex;align-items:center;gap:{0 if m else 4}px">{lang}{ibtn("Thema wijzigen", themeicon)}{ibtn("Menu openen of sluiten", MENU)}</div></header>')


def kpi_strip(m):
    items = S['kerncijfers']['data']
    fm = {'inwoners': ('1.381', 'Inwoners'), 'huishoudens': ('860', 'Huishoudens'), 'woningen': ('885', 'Woningen'), 'gemiddelde-woz-waarde': ('€ 611.000', 'Gemiddelde WOZ-waarde'),
          'oppervlakte': ('6 ha', 'Oppervlakte'), 'inwoners-per-km': ('23.167', 'Inwoners per km²')}
    cells = ''
    for it in items:
        v, lab = fm[it['key']]
        cells += (f'<div style="padding:{"16px 0" if m else "20px 20px 20px 0"};display:flex;flex-direction:column;gap:4px;min-width:0"><span style="font:600 {32 if m else 40}px/1.05 {F_H};color:var(--text);white-space:nowrap">{v}</span>'
                  f'<span style="font:400 15px/1.3 {F_B};color:var(--text)">{lab}</span><span style="font:400 13px {F_B};color:var(--muted)">CBS, {it["jaar"]}</span></div>')
    cols = 2 if m else 6
    return (f'<div style="border-top:2px solid var(--text);border-bottom:1px solid var(--text);display:grid;grid-template-columns:repeat({cols},minmax(0,1fr));column-gap:{24 if m else 0}px">{cells}</div>')


def hero(m):
    logo = f'<img src="{LOGO}" alt="" style="height:{96 if m else 176}px;width:auto;flex:none">'
    txt = (f'<div style="display:flex;flex-direction:column;gap:{16 if m else 20}px;min-width:0"><div style="font:600 13px {F_B};letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Duivelseiland · Museumkwartier · Amsterdam-Zuid</div>'
           f'<h1 style="margin:0;font:700 {46 if m else 84}px/1.02 {F_S};color:var(--p);letter-spacing:-0.02em">Buurt statistieken</h1>'
           f'<p style="margin:0;font:400 {19 if m else 22}px/1.45 {F_B};color:var(--text);max-width:640px">Een buurt van 6 hectare in het Museumkwartier, verteld in acht hoofdstukken. Scroll door het verhaal; onder elke grafiek staat de bron.</p>'
           f'<a href="#mensen" style="display:inline-flex;gap:10px;align-items:center;min-height:44px;color:var(--text);font:500 15px {F_B};text-decoration:none">Begin bij hoofdstuk 1 {ARROW_DOWN}</a></div>')
    top = f'<div style="display:flex;gap:{24 if m else 64}px;align-items:{"flex-start" if m else "center"};justify-content:space-between;{"flex-direction:column-reverse;" if m else ""}">{txt}{logo}</div>'
    return f'<section style="padding:{"32px 0 40px" if m else "80px 0 64px"};display:flex;flex-direction:column;gap:{32 if m else 56}px">{top}{kpi_strip(m)}</section>'


def rail(active=0):
    links = ''
    for k, (key, name) in enumerate(CHAPTERS):
        on = k == active
        links += (f'<a href="#{key}" {"aria-current=\"true\"" if on else ""} style="display:flex;gap:12px;align-items:baseline;padding:8px 0 8px 0;text-decoration:none;color:{"var(--text)" if on else "var(--muted)"};font:{600 if on else 400} 15px/1.3 {F_B}">'
                  f'<span style="width:22px;font:600 12px {F_H};color:{"var(--p)" if on else "var(--muted)"}">{k+1:02d}</span><span>{esc(name)}</span></a>')
    links += f'<a href="#bronnen" style="display:flex;gap:12px;align-items:baseline;padding:8px 0;text-decoration:none;color:var(--muted);font:400 15px/1.3 {F_B}"><span style="width:22px"></span><span>Bronnen</span></a>'
    return (f'<nav aria-label="Hoofdstukken" style="position:sticky;top:104px;align-self:start;display:flex;flex-direction:column;border-left:1px solid var(--border);padding-left:16px">'
            f'<span style="font:600 12px {F_B};letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-bottom:8px">Inhoud</span>{links}'
            f'<div aria-hidden="true" style="margin-top:12px;height:3px;border-radius:2px;background:var(--border)"><div style="width:{(active+0.35)/9*100:.0f}%;height:3px;border-radius:2px;background:var(--p)"></div></div></nav>')


def mobile_nav(active=0):
    key, name = CHAPTERS[active]
    return (f'<nav aria-label="Hoofdstukken" style="position:sticky;top:80px;z-index:4;background:var(--bg);border-bottom:1px solid var(--border)">'
            f'<button type="button" aria-expanded="false" style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:48px;padding:0 16px;background:transparent;border:0;color:var(--text);cursor:pointer;font:500 15px {F_B}">'
            f'<span><span style="font:600 12px {F_H};color:var(--p)">{active+1:02d}</span> &nbsp;{esc(name)}</span><span style="display:inline-flex;gap:8px;align-items:center;color:var(--muted);font:400 13px {F_B}">Hoofdstuk {active+1} van 8 {ICON_CHEV}</span></button>'
            f'<div aria-hidden="true" style="height:3px;background:var(--border)"><div style="width:{(active+0.35)/9*100:.0f}%;height:3px;background:var(--p)"></div></div></nav>')


def sources(m):
    rows = [('CBS', 'Inwoners, huishoudens, wonen, inkomen, werk, voorzieningen', '2013 tot 2026'), ('Kadaster (BAG)', 'Adressen, woningtype, bouwperiode, gebruiksdoelen', '2026'),
            ('RVO / EP-online', 'Energielabels', '2026'), ('RDW', 'Voertuigen en elektrische auto’s', 'september 2026'), ('Politie (data.politie.nl)', 'Geregistreerde misdrijven', '2012 tot 2025'),
            ('Rijkswaterstaat (BRON)', 'Verkeersongevallen', '2003 tot 2025'), ('RIVM Gezondheidsmonitor', 'Gezondheid, welzijn, tevredenheid (schatting)', '2024'), ('Kiesraad', 'Gemeenteraadsverkiezingen', '18 maart 2026')]
    tr = ''.join(f'<tr><th scope="row" style="text-align:left;font:600 14px/1.4 {F_B};padding:10px 16px 10px 0;border-top:1px solid var(--border);vertical-align:top;white-space:nowrap">{esc(a)}</th>'
                 f'<td style="font:400 14px/1.4 {F_B};color:var(--text);padding:10px 16px 10px 0;border-top:1px solid var(--border);vertical-align:top">{esc(b)}</td>'
                 f'<td style="font:400 14px/1.4 {F_B};color:var(--muted);padding:10px 0;border-top:1px solid var(--border);vertical-align:top;white-space:nowrap">{esc(c)}</td></tr>' for a, b, c in rows)
    if m:
        items = ''.join(f'<li style="padding:12px 0;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:2px"><span style="font:600 15px {F_B}">{esc(a_)}</span>'
                        f'<span style="font:400 14px/1.4 {F_B}">{esc(b_)}</span><span style="font:400 13px {F_B};color:var(--muted)">{esc(c_)}</span></li>' for a_, b_, c_ in rows)
        tbl = f'<div><h3 style="margin:0 0 10px;font:600 15px {F_H}">Bronnen en peiljaren</h3><ul style="list-style:none;margin:0;padding:0">{items}</ul></div>'
    else:
        tbl = f'<table style="border-collapse:collapse;width:100%"><caption style="text-align:left;font:600 15px {F_H};padding-bottom:10px">Bronnen en peiljaren</caption><tbody>{tr}</tbody></table>'
    p = lambda t: f'<p style="margin:0;font:400 15px/1.55 {F_B};color:var(--text)">{t}</p>'
    h = lambda t: f'<h3 style="margin:0;font:600 15px {F_H};color:var(--text)">{t}</h3>'
    side = (f'<div style="display:flex;flex-direction:column;gap:14px">{h("Schatting")}{p("Cijfers van het RIVM komen uit een enquête onder een steekproef van inwoners. Ze dragen daarom het label “Schatting” en zijn minder precies dan tellingen.")}'
            f'{h("Afgerond")}{p("Het CBS rondt buurtcijfers af op vijftallen. De leeftijdsgroepen tellen daardoor op tot 1.375 in plaats van 1.381.")}'
            f'{h("Peildatum en gebruik")}{p("Gegevens verzameld op 18 september 2026. CBS-cijfers vallen onder CC BY 4.0; noem bij hergebruik de oorspronkelijke bron.")}</div>')
    body = f'<div style="display:grid;grid-template-columns:{"1fr" if m else "minmax(0,1.5fr) minmax(0,1fr)"};gap:{32 if m else 64}px;align-items:start">{tbl}{side}</div>'
    rule = '<div aria-hidden="true" style="border-top:2px solid var(--text)"></div><div aria-hidden="true" style="border-top:1px solid var(--text);margin-top:3px"></div>'
    return (f'<section id="bronnen" aria-labelledby="bronnen-t" style="display:flex;flex-direction:column;gap:32px;scroll-margin-top:104px"><div>{rule}</div>'
            f'<h2 id="bronnen-t" style="margin:0;font:600 {30 if m else 44}px/1.1 {F_H}">Bronnen en toelichting</h2>{body}</section>')


def footer(m):
    links = ''.join(f'<li><a href="#" style="color:var(--od-m);text-decoration:none;font:400 16px/1.5 {F_B}">{esc(t)}</a></li>' for t in ('Waar komt de naam vandaan?', 'Praktische info', 'Geschiedenis'))
    return (f'<footer style="background:#2b241c;--od-m:#d1d5db;padding:{"48px 16px" if m else "64px 32px"}"><div style="max-width:1216px;margin:0 auto;display:grid;grid-template-columns:{"1fr" if m else "repeat(3,minmax(0,1fr))"};gap:{32 if m else 48}px">'
            f'<span style="font:700 20px {F_S};color:#ffffff">Duivelseiland</span><div><h4 style="margin:0 0 16px;font:700 18px {F_H};color:#ffffff">Snel naar</h4>'
            f'<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px">{links}</ul></div></div></footer>')


def blocks_desktop(C):
    stack = lambda *a: '<div style="display:flex;flex-direction:column;gap:24px;min-width:0">' + ''.join(a) + '</div>'
    ch = []
    ch.append(chapter(1, 'mensen', 'Mensen', 'Jong, veel alleenstaanden, steeds internationaler', ('45%', 'heeft herkomst Nederland; in 2013 was dat nog 66%.'),
                      [C['herkomst'], grid(2, C['leeftijd'], C['huishoudens']), C['inwoners'],
                       more(['Mannen en vrouwen', 'Burgerlijke staat', 'Geboorteland', 'Geboorte en sterfte'], True, grid(2, C['geslacht'], C['burgerlijk']) + C['geboorte'] + C['sankey'])]))
    ch.append(chapter(2, 'wonen', 'Wonen', 'Bijna iedereen woont in een appartement uit vóór 1945', ('950', 'van de 960 adressen dateert van vóór 1925.'),
                      [C['woz'], grid(2, C['eigendom'], C['bouw']), grid(2, C['energie'], C['verbruik']), more(['Soort woningen', 'Bewoond en onbewoond', 'Gebruiksdoelen'], False)]))
    ch.append(chapter(3, 'werk', 'Werk en geld', 'Hoge inkomens, veel zakelijke dienstverlening', ('€ 58.400', 'gemiddeld inkomen per inwoner; Nederland: € 34.900.'),
                      [C['inkomen'], grid(2, C['ikvergelijk'], C['bedrijven']), more(['Werk', 'Personen met een uitkering'], False)]))
    ch.append(chapter(4, 'mobiliteit', 'Mobiliteit', 'Weinig auto’s per huishouden, elektrisch groeit snel', ('63', 'elektrische auto’s in september 2026; in maart 2022 waren het er 16.'),
                      [grid(2, stack(C['voertuigen'], C['autohh']), C['elektrisch']), grid(2, C['ongevallen'], C['dichtheid'])]))
    ch.append(chapter(5, 'veiligheid', 'Veiligheid', 'Zeer dicht bebouwd; fietsendiefstal is de grootste post', ('39', 'van de 115 misdrijven in 2025 waren fietsen-, brom- of snorfietsdiefstal.'),
                      [grid(2, C['misdaadjaren'], C['misdaadsoorten']), more(['Misdrijven per 1.000 inwoners'], False)]))
    ch.append(chapter(6, 'gezondheid', 'Gezondheid en welzijn', 'Goed ervaren gezondheid en tevreden met de omgeving', ('90%', 'is tevreden met de woonomgeving (schatting).'),
                      [grid(2, C['tevreden'], C['leefstijl']), grid(2, C['gezondheid'], C['welzijn']), more(['Alcohol en roken', 'Geluidhinder'], False)]))
    ch.append(chapter(7, 'voorzieningen', 'Voorzieningen en onderwijs', 'Alles binnen loopafstand, behalve de school in de buurt zelf', ('0,1 km', 'gemiddeld naar het dichtstbijzijnde restaurant; supermarkt en huisarts 0,3 km.'),
                      [C['voorzieningen'], grid(2, C['school'], C['bereik']), more(['Leerlingen en studenten', 'Opleidingsniveau'], False)]))
    ch.append(chapter(8, 'vergelijking', 'Vergelijking', 'Wat Duivelseiland anders maakt dan de rest van Nederland', ('43×', 'zo dicht bevolkt als het Nederlandse gemiddelde.'),
                      [C['onderscheid'], grid(2, C['verkiezingen'], more(['Woningwaarde en aandeel 65-plussers'], True, C['scatter']))]))
    return ch


def blocks_mobile(C):
    ch = []
    ch.append(chapter(1, 'mensen', 'Mensen', 'Jong, veel alleenstaanden, steeds internationaler', ('45%', 'heeft herkomst Nederland; in 2013 was dat nog 66%.'),
                      [C['herkomst'], C['leeftijd'], C['huishoudens'], C['inwoners'], more(['Mannen en vrouwen', 'Burgerlijke staat', 'Geboorteland', 'Geboorte en sterfte'], False, mobile=True)], True))
    ch.append(chapter(2, 'wonen', 'Wonen', 'Bijna iedereen woont in een appartement uit vóór 1945', ('950', 'van de 960 adressen dateert van vóór 1925.'),
                      [C['woz'], C['eigendom'], C['bouw'], C['energie'], C['verbruik'], more(['Soort woningen', 'Bewoond en onbewoond', 'Gebruiksdoelen'], False, mobile=True)], True))
    ch.append(chapter(3, 'werk', 'Werk en geld', 'Hoge inkomens, veel zakelijke dienstverlening', ('€ 58.400', 'gemiddeld inkomen per inwoner; Nederland: € 34.900.'),
                      [C['inkomen'], C['ikvergelijk'], C['bedrijven'], more(['Werk', 'Personen met een uitkering'], False, mobile=True)], True))
    ch.append(chapter(4, 'mobiliteit', 'Mobiliteit', 'Weinig auto’s per huishouden, elektrisch groeit snel', ('63', 'elektrische auto’s in september 2026; in maart 2022 waren het er 16.'),
                      [C['voertuigen'], C['autohh'], C['elektrisch'], C['ongevallen'], C['dichtheid']], True))
    ch.append(chapter(5, 'veiligheid', 'Veiligheid', 'Zeer dicht bebouwd; fietsendiefstal is de grootste post', ('39', 'van de 115 misdrijven in 2025 waren fietsen-, brom- of snorfietsdiefstal.'),
                      [C['misdaadjaren'], C['misdaadsoorten'], more(['Misdrijven per 1.000 inwoners'], False, mobile=True)], True))
    ch.append(chapter(6, 'gezondheid', 'Gezondheid en welzijn', 'Goed ervaren gezondheid en tevreden met de omgeving', ('90%', 'is tevreden met de woonomgeving (schatting).'),
                      [C['tevreden'], C['leefstijl'], C['gezondheid'], C['welzijn'], more(['Alcohol en roken', 'Geluidhinder'], False, mobile=True)], True))
    ch.append(chapter(7, 'voorzieningen', 'Voorzieningen en onderwijs', 'Alles binnen loopafstand, behalve de school in de buurt zelf', ('0,1 km', 'gemiddeld naar het dichtstbijzijnde restaurant; supermarkt en huisarts 0,3 km.'),
                      [C['voorzieningen'], C['school'], C['bereik'], more(['Leerlingen en studenten', 'Opleidingsniveau'], False, mobile=True)], True))
    ch.append(chapter(8, 'vergelijking', 'Vergelijking', 'Wat Duivelseiland anders maakt dan de rest van Nederland', ('43×', 'zo dicht bevolkt als het Nederlandse gemiddelde.'),
                      [C['onderscheid'], C['verkiezingen'], more(['Woningwaarde en aandeel 65-plussers'], True, C['scatter'], mobile=True)], True))
    return ch


HELMET = f'<helmet><style>{CSS}</style></helmet>'


def dc(title, root_style, inner, width, height, lang='nl'):
    return (f'<!doctype html>\n<html lang="{lang}">\n<head>\n<meta charset="utf-8">\n<title>{esc(title)}</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n{HELMET}\n'
            f'<div id="top" style="{root_style}">{inner}</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{{"$preview":{{"width":{width},"height":{height}}}}}\'>\n'
            f'class Component extends DCLogic {{\n  renderVals() {{\n    return {{}};\n  }}\n}}\n</script>\n</body>\n</html>\n')


def rootstyle(theme, width):
    return f'width:{width}px;box-sizing:border-box;background:var(--bg);color:var(--text);font-family:{F_B};{theme_style(theme)}'


def full_page(theme, m, C):
    dark = theme == 'dark'
    ch = blocks_mobile(C) if m else blocks_desktop(C)
    if m:
        main = f'<main style="display:flex;flex-direction:column;gap:64px;padding:0 24px 64px">{hero(True)}{"".join(ch)}{sources(True)}</main>'
        inner = header(dark, True) + mobile_nav(0) + main + footer(True)
        return dc(f'Buurt statistieken — mobiel {"donker" if dark else "licht"}', rootstyle(theme, 390), inner, 390, 844)
    main = (f'<main style="width:1288px;margin:0 auto;padding:0 0 96px"><div style="padding:0 0 0 0">{hero(False)}</div>'
            f'<div style="display:grid;grid-template-columns:216px minmax(0,1024px);column-gap:48px;align-items:start">{rail(0)}'
            f'<div style="display:flex;flex-direction:column;gap:112px">{"".join(ch)}{sources(False)}</div></div></main>')
    inner = header(dark, False) + main + footer(False)
    return dc(f'Buurt statistieken — desktop {"donker" if dark else "licht"}', rootstyle(theme, 1440), inner, 1440, 1100)
