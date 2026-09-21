import type { ReactNode } from 'react';
import { section } from '@/lib/stats/load';
import type { AlcoholRow, GezondheidRow } from '@/lib/stats/types';
import { Card, dual, type Ctx } from './card';
import { Legend } from '../charts/base';
import { LineChart } from '../charts/LineChart';
import { BarHorizontal, GroupedHorizontal } from '../charts/Bars';
import { Meters } from '../charts/Circular';

export function safetyHealthCards(ctx: Ctx): Record<string, ReactNode> {
  const { t, f, tl } = ctx;
  const C: Record<string, ReactNode> = {};
  const pct = (v: number) => f.pct(v);

  // misdrijven per jaar
  {
    const d = section('misdaad-jaren').data;
    const xs = d.map((x) => Number(x.key));
    const vals = d.map((x) => x.waarde);
    const ip = vals.indexOf(Math.max(...vals));
    C.misdaadjaren = (
      <Card
        ctx={ctx}
        cardId="misdaadjaren"
        sid="misdaad-jaren"
        chart={dual(false, (w) => (
          <LineChart
            width={w}
            height={230}
            xs={xs}
            series={[{ vals, tone: 'p' }]}
            ymin={0}
            ymax={180}
            yticks={[0, 60, 120, 180]}
            yfmt={f.num}
            xticks={[2012, 2016, 2020, 2025].map((y) => [y, String(y)] as [number, string])}
            marks={[
              { si: 0, i: ip, text: t('marks.peak', { year: xs[ip], value: f.num(vals[ip]) }), dy: -12, dx: 30 },
              { si: 0, i: vals.length - 1, text: f.num(vals[vals.length - 1]), dy: -12, dx: -2 },
            ]}
            area={0}
            left={40}
            label={t('cards.misdaadjaren.aria')}
            tip={(_, i) => `${xs[i]}\n${f.num(vals[i])}`}
          />
        ))}
        head={[t('table.year'), t('table.crimes')]}
        rows={d.map((x) => [x.key, f.num(x.waarde)])}
      />
    );
  }

  // meest voorkomende misdrijven
  {
    const s = section('misdaad-soorten');
    C.misdaadsoorten = (
      <Card
        ctx={ctx}
        cardId="misdaadsoorten"
        sid="misdaad-soorten"
        chart={dual(false, (w) => (
          <BarHorizontal
            width={w}
            rows={s.data.map((x, k) => ({ label: tl(x.label), v: x.waarde, tone: k === 0 ? 'c' : 'p6', tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            mobile
            valueWidth={40}
            label={t('cards.misdaadsoorten.title')}
          />
        ))}
        head={[t('table.type'), t('table.count')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde)])}
      />
    );
  }

  // misdrijven per 1.000 inwoners
  {
    const s = section('misdaad-per-1000');
    const sorted = [...s.data].sort((a, b) => b.waarde - a.waarde);
    C.misdaad1000 = (
      <Card
        ctx={ctx}
        cardId="misdaad1000"
        sid="misdaad-per-1000"
        chart={dual(false, (w) => (
          <BarHorizontal
            width={w}
            rows={sorted.map((x) => ({ label: tl(x.label), v: x.waarde, tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            mobile
            valueWidth={40}
            label={t('cards.misdaad1000.title')}
          />
        ))}
        head={[t('table.type'), t('table.per1000')]}
        rows={sorted.map((x) => [tl(x.label), f.num(x.waarde)])}
      />
    );
  }

  // tevredenheid
  {
    const s = section('tevredenheid');
    C.tevreden = (
      <Card
        ctx={ctx}
        cardId="tevreden"
        sid="tevredenheid"
        chart={<Meters items={s.data.map((x) => ({ label: tl(x.label), v: x.waarde }))} fmt={pct} />}
        head={[t('table.type'), t('table.percentage')]}
        rows={s.data.map((x) => [tl(x.label), pct(x.waarde)])}
      />
    );
  }

  // bewegen en gewicht
  {
    const s = section('leefstijl');
    C.leefstijl = (
      <Card
        ctx={ctx}
        cardId="leefstijl"
        sid="leefstijl"
        chart={
          <Meters
            items={s.data.map((x) => ({ label: tl(x.label), v: x.waarde, tone: /gewicht|obesitas/i.test(x.label) ? 'c' : 'p' }))}
            fmt={pct}
          />
        }
        head={[t('table.type'), t('table.percentage')]}
        rows={s.data.map((x) => [tl(x.label), pct(x.waarde)])}
      />
    );
  }

  // goede gezondheid over de tijd (drie leeftijdsgroepen; koper is geen dunne lijn, dus 65+ in terracotta)
  {
    const g = section<GezondheidRow>('gezondheid-trend').data;
    const yrs = g.map((x) => x.jaar);
    const names = { a: t('legend.age18to65'), b: t('legend.age65plus'), c: t('legend.age18plus') };
    C.gezondheid = (
      <Card
        ctx={ctx}
        cardId="gezondheid"
        sid="gezondheid-trend"
        chart={
          <>
            {dual(false, (w) => (
              <LineChart
                width={w}
                height={230}
                xs={yrs}
                series={[
                  { vals: g.map((x) => x.van_18_tot_65), tone: 'p' },
                  { vals: g.map((x) => x.vanaf_65), tone: 'c' },
                  { vals: g.map((x) => x.vanaf_18), tone: 'm', dash: '5 4' },
                ]}
                ymin={50}
                ymax={100}
                yticks={[50, 75, 100]}
                yfmt={pct}
                xticks={[2012, 2016, 2020, 2024].map((y) => [y, String(y)] as [number, string])}
                left={44}
                label={t('cards.gezondheid.aria')}
                tip={(si, i) => `${yrs[i]}\n${[names.a, names.b, names.c][si]} ${pct([g[i].van_18_tot_65, g[i].vanaf_65, g[i].vanaf_18][si])}`}
              />
            ))}
            <Legend
              items={[
                { label: names.a, tone: 'p' },
                { label: names.b, tone: 'c' },
                { label: t('legend.age18plusDashed'), tone: 'm' },
              ]}
            />
          </>
        }
        head={[t('table.year'), names.a, names.b, names.c]}
        rows={g.map((x) => [x.jaar, pct(x.van_18_tot_65), pct(x.vanaf_65), pct(x.vanaf_18)])}
      />
    );
  }

  // welzijn en eenzaamheid
  {
    const s = section('welzijn');
    C.welzijn = (
      <Card
        ctx={ctx}
        cardId="welzijn"
        sid="welzijn"
        chart={
          <Meters
            items={s.data.map((x) => ({ label: tl(x.label), v: x.waarde, tone: x.key === 'eenzaam' || x.key === 'ernstig-eenzaam' ? 'c' : 'p' }))}
            fmt={pct}
          />
        }
        head={[t('table.type'), t('table.percentage')]}
        rows={s.data.map((x) => [tl(x.label), pct(x.waarde)])}
      />
    );
  }

  // alcohol en roken per leeftijdsgroep
  {
    const s = section<AlcoholRow>('alcohol-roken');
    const groups = ['18 jaar of ouder', '18 tot 65 jaar', '65 jaar of ouder'] as const;
    const gl = groups.map((g) => tl(g));
    C.alcohol = (
      <Card
        ctx={ctx}
        cardId="alcohol"
        sid="alcohol-roken"
        chart={
          <>
            <Legend items={gl.map((label, i) => ({ label, tone: (['p', 'p6', 'p3'] as const)[i] }))} />
            {dual(false, (w) => (
              <GroupedHorizontal
                width={w}
                rows={s.data.map((x) => ({
                  label: tl(x.label),
                  vals: groups.map((g) => x[g]),
                  tips: groups.map((g, i) => `${tl(x.label)}\n${gl[i]}: ${pct(x[g])}`),
                }))}
                tones={['p', 'p6', 'p3']}
                fmt={pct}
                max={100}
                label={t('cards.alcohol.title')}
              />
            ))}
          </>
        }
        head={[t('table.type'), ...gl]}
        rows={s.data.map((x) => [tl(x.label), ...groups.map((g) => pct(x[g]))])}
      />
    );
  }

  // geluidhinder
  {
    const s = section('geluidhinder');
    C.geluid = (
      <Card
        ctx={ctx}
        cardId="geluid"
        sid="geluidhinder"
        chart={dual(false, (w, m) => (
          <BarHorizontal
            width={w}
            rows={s.data.map((x) => ({ label: tl(x.label), v: x.waarde, tip: `${tl(x.label)}\n${pct(x.waarde)}` }))}
            fmt={pct}
            mobile={m}
            labelWidth={110}
            rowHeight={26}
            label={t('cards.geluid.title')}
          />
        ))}
        head={[t('table.source'), t('table.percentage')]}
        rows={s.data.map((x) => [tl(x.label), pct(x.waarde)])}
      />
    );
  }

  return C;
}
