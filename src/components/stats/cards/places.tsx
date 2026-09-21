import type { ReactNode } from 'react';
import { section } from '@/lib/stats/load';
import type { Item, OnderscheidRow, ScatterRow, SchoolRow } from '@/lib/stats/types';
import { Card, dual, Stat, type Ctx } from './card';
import { Legend } from '../charts/base';
import { BarVertical, BarHorizontal, GroupedHorizontal } from '../charts/Bars';
import { Donut } from '../charts/Circular';
import { DistanceScale, Dumbbell, Scatter, ShapeLegend } from '../charts/SpecialCharts';

export function placesCards(ctx: Ctx): Record<string, ReactNode> {
  const { t, f, tl } = ctx;
  const C: Record<string, ReactNode> = {};
  const words = { dv: t('words.duivelseiland'), am: t('words.amsterdam'), nl: t('words.nederland') };

  // afstand tot voorzieningen
  {
    const s = section('voorzieningen');
    const meer = s.meer as Item[];
    C.voorzieningen = (
      <Card
        ctx={ctx}
        cardId="voorzieningen"
        sid="voorzieningen"
        chart={dual(true, (w, m) => (
          <DistanceScale
            width={w}
            rows={s.data.map((x) => ({ key: x.key, label: tl(x.label), km: x.waarde }))}
            mobile={m}
            f={f}
            label={t('cards.voorzieningen.aria')}
          />
        ))}
        head={[t('table.facility'), t('table.km'), t('table.year')]}
        rows={[...s.data.map((x) => [tl(x.label), f.num(x.waarde, 1), null]), ...meer.map((x) => [tl(x.label), f.num(x.waarde, 1), (x.jaar as number) ?? null])]}
      />
    );
  }

  // afstand tot scholen en opvang
  {
    const s = section<SchoolRow>('school-afstand');
    const names = [words.dv, t('words.museumkwartier'), words.am, words.nl];
    const tones = ['p', 's', 's5', 'm'] as const;
    C.school = (
      <Card
        ctx={ctx}
        cardId="school"
        sid="school-afstand"
        chart={
          <>
            <Legend items={names.map((label, i) => ({ label, tone: tones[i] }))} />
            {dual(false, (w) => (
              <GroupedHorizontal
                width={w}
                rows={s.data.map((x) => {
                  const vals = [x.duivelseiland, x.museumkwartier, x.amsterdam, x.nederland];
                  return { label: tl(x.label), vals, tips: vals.map((v, i) => `${tl(x.label)}\n${names[i]}: ${f.km(v)}`) };
                })}
                tones={[...tones]}
                fmt={(v) => f.num(v, 1)}
                max={3.6}
                label={t('cards.school.title')}
              />
            ))}
          </>
        }
        head={[t('table.type'), ...names]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.duivelseiland, 1), f.num(x.museumkwartier, 1), f.num(x.amsterdam, 1), f.num(x.nederland, 1)])}
      />
    );
  }

  // leerlingen en studenten
  {
    const s = section('leerlingen');
    const short = (l: string) => l.split(' ').pop() as string;
    C.leerlingen = (
      <Card
        ctx={ctx}
        cardId="leerlingen"
        sid="leerlingen"
        chart={dual(false, (w) => (
          <BarVertical
            width={w}
            height={220}
            gap={0.4}
            items={s.data.map((x) => ({ label: short(x.label), v: x.waarde, tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            label={t('cards.leerlingen.title')}
          />
        ))}
        head={[t('table.type'), t('table.count')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde)])}
      />
    );
  }

  // opleidingsniveau: 76% is afgeleid (de bron toont ten onrechte 100%)
  {
    const s = section('opleidingsniveau');
    const derived = s.hoger_aandeel_afgeleid as number;
    const order = [s.data[2], s.data[1], s.data[0]];
    const tones = ['p', 'p6', 'p3'] as const;
    C.opleiding = (
      <Card
        ctx={ctx}
        cardId="opleiding"
        sid="opleidingsniveau"
        chart={
          <Donut
            parts={order.map((x, i) => ({ label: tl(x.label), v: x.waarde, tone: tones[i] }))}
            centerTop={f.pct(derived)}
            centerBottom={t('words.higherEducated')}
            label={t('cards.opleiding.aria')}
          />
        }
        head={[t('table.type'), t('table.count'), t('table.year')]}
        rows={order.map((x) => [tl(x.label), f.num(x.waarde), (x.jaar as number) ?? null])}
      />
    );
  }

  // binnen bereik
  {
    const s = section('voorzieningen');
    const bk = s.binnen_5_km as Item[];
    C.bereik = (
      <Card
        ctx={ctx}
        cardId="bereik"
        sid="voorzieningen"
        chart={
          <div className="grid grid-cols-2 gap-x-5 gap-y-6">
            {bk.map((x) => (
              <Stat key={x.key} label={tl(x.label)} value={f.auto(x.waarde)} />
            ))}
          </div>
        }
        head={[t('table.type'), t('table.count')]}
        rows={bk.map((x) => [tl(x.label), f.auto(x.waarde)])}
      />
    );
  }

  // wat Duivelseiland onderscheidt (drie markeringen per rij)
  {
    const s = section<OnderscheidRow>('onderscheidend');
    const derived = section('opleidingsniveau').hoger_aandeel_afgeleid as number;
    const fmtFor = (label: string) => (label.includes('€') ? f.eur : label.includes('%') ? (v: number) => f.pct(v) : f.num);
    const rows = s.data.map((x) => ({
      key: x.label,
      title: tl(x.label),
      dv: x.duivelseiland ?? derived,
      am: x.amsterdam,
      nl: x.nederland,
      derived: x.duivelseiland === null,
      fmt: fmtFor(x.label),
    }));
    C.onderscheid = (
      <Card
        ctx={ctx}
        cardId="onderscheid"
        sid="onderscheidend"
        chart={
          <>
            <ShapeLegend names={words} />
            {dual(true, (w, m) => (
              <Dumbbell width={w} rows={rows} mobile={m} names={words} derivedText={t('words.derived')} label={t('cards.onderscheid.aria')} />
            ))}
          </>
        }
        head={[t('table.type'), words.dv, words.am, words.nl]}
        rows={rows.map((x) => [x.title, x.fmt(x.dv) + (x.derived ? ` (${t('words.derived')})` : ''), x.fmt(x.am), x.fmt(x.nl)])}
      />
    );
  }

  // gemeenteraadsverkiezingen (10 grootste partijen, één kleur)
  {
    const s = section('verkiezingen');
    const top = s.data.slice(0, 10);
    const rest = s.data.slice(10).reduce((a, x) => a + x.waarde, 0);
    const total = s.totaal_stemmen as number;
    const restCount = s.data.length - 10;
    C.verkiezingen = (
      <Card
        ctx={ctx}
        cardId="verkiezingen"
        sid="verkiezingen"
        chart={dual(false, (w) => (
          <BarHorizontal
            width={w}
            rows={top.map((x) => ({
              label: `${x.label}  ${f.num(x.aandeel ?? 0, 1)}%`,
              v: x.waarde,
              tip: `${x.label}\n${f.num(x.waarde)} · ${f.num(x.aandeel ?? 0, 1)}%`,
            }))}
            fmt={f.num}
            mobile
            valueWidth={48}
            label={t('cards.verkiezingen.title')}
          />
        ))}
        head={[t('table.party'), t('table.votes'), t('table.share')]}
        rows={s.data.map((x) => [x.label, f.num(x.waarde), f.pct(x.aandeel ?? 0, 1)])}
        noteValues={{ count: restCount, votes: f.num(rest), total: f.num(total) }}
      />
    );
  }

  // spreiding: woningwaarde en 65-plussers
  {
    const s = section<ScatterRow>('vergelijk-woz-65plus');
    const points = s.data.map((x) => ({
      label: x.label,
      woz: x.woz,
      share: x.aandeel_65plus,
      homes: x.woningen,
      role: (x.label === 'Buurt Duivelseiland' ? 'dv' : x.label === 'Wijk Museumkwartier' ? 'wijk' : 'other') as 'dv' | 'wijk' | 'other',
      tip: `${tl(x.label)}\n${f.eur(x.woz)} · ${f.pct(x.aandeel_65plus)}`,
    }));
    C.scatter = (
      <Card
        ctx={ctx}
        cardId="scatter"
        sid="vergelijk-woz-65plus"
        chart={
          <>
            {dual(false, (w, m) => (
              <Scatter
                width={w}
                height={m ? 270 : 300}
                points={points}
                mobile={m}
                f={f}
                names={{ dv: words.dv, wijk: t('words.museumkwartier') }}
                axisLabels={{ x: t('scatter.x'), y: t('scatter.y') }}
                label={t('cards.scatter.aria')}
              />
            ))}
            <Legend
              items={[
                { label: words.dv, tone: 'p' },
                { label: t('words.wijkMuseumkwartier'), tone: 's' },
                { label: t('words.otherAreas'), tone: 'm3' },
              ]}
            />
          </>
        }
        head={[t('table.area'), t('table.woz'), t('table.share65'), t('table.homes')]}
        rows={s.data.map((x) => [tl(x.label), f.eur(x.woz), f.pct(x.aandeel_65plus), f.num(x.woningen)])}
      />
    );
  }

  return C;
}
