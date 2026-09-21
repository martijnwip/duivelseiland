import type { ReactNode } from 'react';
import { section } from '@/lib/stats/load';
import type { GeboorteRow, HerkomstRow, Item } from '@/lib/stats/types';
import { Card, dual, type Ctx } from './card';
import { Legend } from '../charts/base';
import { LineChart } from '../charts/LineChart';
import { BarVertical, BarHorizontal } from '../charts/Bars';
import { Donut, Sankey, SankeyStacked } from '../charts/Circular';
import { StackedArea } from '../charts/StackedCharts';

export function peopleCards(ctx: Ctx): Record<string, ReactNode> {
  const { t, f, tl } = ctx;
  const C: Record<string, ReactNode> = {};

  // herkomst per jaar
  {
    const rows = section<HerkomstRow>('herkomst-trend').data;
    const names = { nl: t('words.nederland'), eu: t('words.europa'), non: t('words.buitenEuropa') };
    const tip = (d: HerkomstRow) =>
      d.europa === null
        ? `${d.jaar}\n${names.nl} ${f.num(d.nederland)} · ${t('stackedArea.gap')}`
        : `${d.jaar}\n${names.nl} ${f.num(d.nederland)} · ${names.eu} ${f.num(d.europa)} · ${names.non} ${f.num(d.buiten_europa ?? 0)}`;
    C.herkomst = (
      <Card
        ctx={ctx}
        cardId="herkomst"
        sid="herkomst-trend"
        chart={
          <>
            {dual(true, (w, m) => (
              <StackedArea
                width={w}
                height={m ? 240 : 320}
                rows={rows}
                mobile={m}
                f={f}
                names={names}
                gapLabel={t('stackedArea.gap')}
                label={t('cards.herkomst.aria')}
                tip={tip}
              />
            ))}
            <div className="xl:hidden">
              <Legend
                items={[
                  { label: names.nl, tone: 'p' },
                  { label: names.eu, tone: 's' },
                  { label: names.non, tone: 'm3' },
                ]}
              />
            </div>
          </>
        }
        head={[t('table.year'), names.nl, names.eu, names.non]}
        rows={rows.map((d) => [d.jaar, f.num(d.nederland), d.europa === null ? null : f.num(d.europa), d.buiten_europa === null ? null : f.num(d.buiten_europa)])}
      />
    );
  }

  // leeftijd
  {
    const s = section('leeftijd');
    const items = s.data.map((x) => ({ label: x.label === '65' ? '65+' : x.label, v: x.waarde, tip: `${x.label === '65' ? '65+' : x.label}\n${f.num(x.waarde)}` }));
    C.leeftijd = (
      <Card
        ctx={ctx}
        cardId="leeftijd"
        sid="leeftijd"
        chart={dual(false, (w) => (
          <BarVertical width={w} height={230} items={items} fmt={f.num} label={t('cards.leeftijd.title')} />
        ))}
        head={[t('table.age'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [x.label, f.num(x.waarde), f.pct(x.aandeel ?? 0, 1)])}
      />
    );
  }

  // inwoners per jaar
  {
    const d = section('inwoners-trend').data;
    const xs = d.map((x) => Number(x.key));
    const vals = d.map((x) => x.waarde);
    const ip = vals.indexOf(Math.max(...vals));
    C.inwoners = (
      <Card
        ctx={ctx}
        cardId="inwoners"
        sid="inwoners-trend"
        chart={dual(true, (w) => (
          <LineChart
            width={w}
            height={230}
            xs={xs}
            series={[{ vals, tone: 'p' }]}
            ymin={1300}
            ymax={1420}
            yticks={[1300, 1340, 1380, 1420]}
            yfmt={f.num}
            xticks={[2013, 2017, 2021, 2026].map((y) => [y, String(y)] as [number, string])}
            marks={[
              { si: 0, i: ip, text: t('marks.peak', { year: xs[ip], value: f.num(vals[ip]) }), dy: -14 },
              { si: 0, i: vals.length - 1, text: f.num(vals[vals.length - 1]), dy: 22 },
            ]}
            area={0}
            left={52}
            label={t('cards.inwoners.aria')}
            tip={(_, i) => `${xs[i]}\n${f.num(vals[i])}`}
          />
        ))}
        head={[t('table.year'), t('table.residents')]}
        rows={d.map((x) => [x.key, f.num(x.waarde)])}
      />
    );
  }

  // huishoudens
  {
    const s = section('huishoudens');
    const tones = ['p', 'p6', 'p3'] as const;
    C.huishoudens = (
      <Card
        ctx={ctx}
        cardId="huishoudens"
        sid="huishoudens"
        chart={
          <Donut
            parts={s.data.map((x, i) => ({ label: tl(x.label), v: x.waarde, tone: tones[i] }))}
            centerTop={f.num(s.totaal ?? 0)}
            centerBottom={t('words.households')}
            label={t('cards.huishoudens.aria')}
          />
        }
        head={[t('table.type'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde), f.pct(x.aandeel ?? 0)])}
      />
    );
  }

  // geslacht
  {
    const s = section('geslacht');
    const tones = ['p', 'p3'] as const;
    const total = s.data.reduce((a, x) => a + x.waarde, 0);
    C.geslacht = (
      <Card
        ctx={ctx}
        cardId="geslacht"
        sid="geslacht"
        chart={
          <Donut
            parts={s.data.map((x, i) => ({ label: tl(x.label), v: x.waarde, tone: tones[i] }))}
            centerTop={f.num(total)}
            centerBottom={t('words.residents')}
            size={132}
            label={t('cards.geslacht.aria')}
          />
        }
        head={[t('table.type'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde), f.pct(x.aandeel ?? 0)])}
      />
    );
  }

  // burgerlijke staat
  {
    const s = section('burgerlijke-staat');
    C.burgerlijk = (
      <Card
        ctx={ctx}
        cardId="burgerlijk"
        sid="burgerlijke-staat"
        chart={dual(false, (w, m) => (
          <BarHorizontal
            width={w}
            rows={s.data.map((x) => ({ label: tl(x.label), v: x.waarde, tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            mobile={m}
            labelWidth={120}
            rowHeight={26}
            label={t('cards.burgerlijk.title')}
          />
        ))}
        head={[t('table.type'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde), f.pct(x.aandeel ?? 0, 1)])}
      />
    );
  }

  // geboorte en sterfte
  {
    const g = section<GeboorteRow>('geboorte-sterfte').data;
    const yrs = g.map((x) => x.jaar);
    const last = g.length - 1;
    C.geboorte = (
      <Card
        ctx={ctx}
        cardId="geboorte"
        sid="geboorte-sterfte"
        chart={
          <>
            {dual(true, (w) => (
              <LineChart
                width={w}
                height={220}
                xs={yrs}
                series={[
                  { vals: g.map((x) => x.geboorte), tone: 'p' },
                  { vals: g.map((x) => x.sterfte), tone: 'm', dash: '5 4' },
                ]}
                ymin={0}
                ymax={24}
                yticks={[0, 8, 16, 24]}
                yfmt={f.num}
                xticks={[2013, 2017, 2021, 2025].map((y) => [y, String(y)] as [number, string])}
                marks={[
                  { si: 0, i: last, text: t('marks.birth', { n: f.num(g[last].geboorte) }), dy: -12, dx: -4, anchor: 'end' },
                  { si: 1, i: last, text: t('marks.death', { n: f.num(g[last].sterfte) }), dy: -12, dx: -10, anchor: 'end' },
                ]}
                left={40}
                label={t('cards.geboorte.aria')}
                tip={(si, i) => `${yrs[i]}\n${si === 0 ? t('words.birth') : t('words.death')} ${f.num(si === 0 ? g[i].geboorte : g[i].sterfte)}`}
              />
            ))}
            <Legend
              items={[
                { label: t('words.birth'), tone: 'p' },
                { label: t('legend.deathDashed'), tone: 'm' },
              ]}
            />
          </>
        }
        head={[t('table.year'), t('words.birth'), t('words.death')]}
        rows={g.map((x) => [x.jaar, f.num(x.geboorte), f.num(x.sterfte)])}
      />
    );
  }

  // geboorteland en herkomst
  {
    const s = section('geboorteland');
    const d = s.data as Item[];
    const tot = s.totalen as { geboren_in_nederland: number; geboren_buiten_nederland: number };
    const v = (i: number) => d[i].waarde;
    const nlN = t('words.bornNl');
    const abroad = t('words.bornAbroad');
    const flows = [
      { from: 0, to: 0, v: v(0) },
      { from: 0, to: 1, v: v(1) },
      { from: 0, to: 2, v: v(2), at: 0.8 },
      { from: 1, to: 1, v: v(3), at: 0.2 },
      { from: 1, to: 2, v: v(4) },
    ];
    const rightNodes = [
      { name: t('words.originNl'), v: v(0) },
      { name: t('words.originEu'), v: v(1) + v(3) },
      { name: t('words.originNonEu'), v: v(2) + v(4) },
    ];
    C.sankey = (
      <Card
        ctx={ctx}
        cardId="sankey"
        sid="geboorteland"
        chart={
          <>
            <div className="hidden xl:block">
              <Sankey
                width={976}
                left={[
                  { name: nlN, v: tot.geboren_in_nederland },
                  { name: abroad, v: tot.geboren_buiten_nederland },
                ]}
                right={rightNodes}
                rightTones={['p', 's', 'm3']}
                flows={flows}
                fmt={f.num}
                label={t('cards.sankey.aria')}
              />
            </div>
            <div className="xl:hidden">
              <div className="max-w-[480px]">
                <SankeyStacked
                  width={310}
                  scaleTo={tot.geboren_in_nederland}
                  rows={[
                    {
                      name: nlN,
                      total: tot.geboren_in_nederland,
                      segs: [
                        { v: v(0), tone: 'p' },
                        { v: v(1), tone: 's' },
                        { v: v(2), tone: 'm3' },
                      ],
                    },
                    {
                      name: abroad,
                      total: tot.geboren_buiten_nederland,
                      segs: [
                        { v: v(3), tone: 's' },
                        { v: v(4), tone: 'm3' },
                      ],
                    },
                  ]}
                  fmt={f.num}
                  label={t('cards.sankey.aria')}
                />
              </div>
              <div className="mt-3">
                <Legend
                  items={[
                    { label: t('words.originNl'), tone: 'p' },
                    { label: t('words.originEu'), tone: 's' },
                    { label: t('words.originNonEu'), tone: 'm3' },
                  ]}
                />
              </div>
            </div>
          </>
        }
        head={[t('table.type'), t('table.count')]}
        rows={d.map((x) => [tl(x.label), f.num(x.waarde)])}
      />
    );
  }

  return C;
}
