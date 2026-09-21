import type { ReactNode } from 'react';
import { section } from '@/lib/stats/load';
import type { Item, OngevalRow } from '@/lib/stats/types';
import { Card, dual, Stat, type Ctx } from './card';
import { Legend } from '../charts/base';
import { LineChart } from '../charts/LineChart';
import { BarVertical } from '../charts/Bars';
import { StackedBar } from '../charts/StackedCharts';
import { BarCompare } from '../charts/SpecialCharts';

export function mobilityCards(ctx: Ctx): Record<string, ReactNode> {
  const { t, f, tl } = ctx;
  const C: Record<string, ReactNode> = {};

  // voertuigen op naam van bewoners (RDW)
  {
    const s = section('voertuigen');
    const sorted = [...s.data].sort((a, b) => b.waarde - a.waarde);
    const energy = s.per_energiebron as Item[];
    C.voertuigen = (
      <Card
        ctx={ctx}
        cardId="voertuigen"
        sid="voertuigen"
        chart={dual(false, (w) => (
          <BarVertical
            width={w}
            height={220}
            gap={0.4}
            items={sorted.map((x) => ({ label: tl(x.label), v: x.waarde, tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            label={t('cards.voertuigen.title')}
          />
        ))}
        head={[t('table.type'), t('table.count')]}
        rows={[
          ...sorted.map((x) => [tl(x.label), f.num(x.waarde)]),
          ...energy.map((x) => [`${t('table.energySource')}: ${tl(x.label)}`, f.num(x.waarde)]),
        ]}
      />
    );
  }

  // auto's per huishouden (CBS)
  {
    const s = section('vervoer-cbs');
    const [cars, perHh, moto, perKm] = s.data;
    C.autohh = (
      <Card
        ctx={ctx}
        cardId="autohh"
        sid="vervoer-cbs"
        chart={
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <Stat big label={tl(perHh.label)} value={f.num(perHh.waarde, 2)} sub={String(perHh.jaar ?? s.jaar)} />
              <Stat big label={t('words.carsCbs')} value={f.num(cars.waarde)} sub={String(s.jaar)} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Stat label={tl(moto.label)} value={f.num(moto.waarde)} sub={String(s.jaar)} />
              <Stat label={tl(perKm.label)} value={f.num(perKm.waarde)} sub={t('words.netherlandsValue', { n: f.num(perKm.nederland as number) })} />
            </div>
          </div>
        }
        head={[t('table.type'), t('table.value')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde, Number.isInteger(x.waarde) ? 0 : 2)])}
      />
    );
  }

  // elektrische auto's per maand
  {
    const s = section('elektrische-autos');
    const d = s.data;
    const xs = d.map((_, i) => i);
    const vals = d.map((x) => x.waarde);
    const label = (i: number) => ctx.period(d[i].label);
    const ticks = [0, 12, 24, 36, 48].filter((i) => i < d.length).map((i) => [i, label(i)] as [number, string]);
    C.elektrisch = (
      <Card
        ctx={ctx}
        cardId="elektrisch"
        sid="elektrische-autos"
        chart={dual(false, (w, m) => (
          <LineChart
            width={w}
            height={m ? 230 : 330}
            xs={xs}
            series={[{ vals, tone: 'p' }]}
            ymin={0}
            ymax={70}
            yticks={[0, 20, 40, 60]}
            yfmt={f.num}
            xticks={ticks}
            marks={[
              { si: 0, i: 0, text: f.num(vals[0]), dy: -12, dx: 8 },
              { si: 0, i: vals.length - 1, text: f.num(vals[vals.length - 1]), dy: -12, dx: -4, anchor: 'end' },
            ]}
            area={0}
            left={40}
            label={t('cards.elektrisch.aria')}
            tip={(_, i) => `${label(i)}\n${f.num(vals[i])}`}
          />
        ))}
        head={[t('table.month'), t('table.count')]}
        rows={d.map((x, i) => [label(i), f.num(x.waarde)])}
      />
    );
  }

  // verkeersongevallen
  {
    const d = section<OngevalRow>('verkeersongevallen').data;
    const last = d[d.length - 1];
    const tip = (x: OngevalRow) =>
      `${x.jaar}\n${f.num(x.totaal)} ${t('words.accidents')}: ${f.num(x.materiele_schade)} ${t('legend.propertyDamage').toLowerCase()}, ${f.num(x.letselschade)} ${t('legend.injury').toLowerCase()}`;
    C.ongevallen = (
      <Card
        ctx={ctx}
        cardId="ongevallen"
        sid="verkeersongevallen"
        chart={
          <>
            {dual(false, (w) => (
              <StackedBar
                width={w}
                height={220}
                rows={d}
                label={t('cards.ongevallen.aria')}
                annotation={[
                  t('ongevallen.annot1', { year: last.jaar, total: f.num(last.totaal) }),
                  t('ongevallen.annot2', { mat: f.num(last.materiele_schade), injury: f.num(last.letselschade), fatal: f.num(last.dodelijk) }),
                ]}
                tip={tip}
              />
            ))}
            <Legend
              items={[
                { label: t('legend.propertyDamage'), tone: 'p3' },
                { label: t('legend.injury'), tone: 'c4' },
              ]}
            />
          </>
        }
        head={[t('table.year'), t('table.total'), t('legend.propertyDamage'), t('legend.injury'), t('legend.fatal')]}
        rows={d.map((x) => [x.jaar, f.num(x.totaal), f.num(x.materiele_schade), f.num(x.letselschade), f.num(x.dodelijk)])}
      />
    );
  }

  // dichtheid per km2
  {
    const s = section('dichtheid');
    const rows = s.data.map((x) => ({ key: String(x.key), title: t(`dichtheid.${String(x.key)}`), dv: x.duivelseiland as number, nl: x.nederland as number }));
    C.dichtheid = (
      <Card
        ctx={ctx}
        cardId="dichtheid"
        sid="dichtheid"
        chart={dual(false, (w) => (
          <BarCompare width={w} rows={rows} f={f} names={{ dv: t('words.duivelseiland'), nl: t('words.nederland') }} label={t('cards.dichtheid.title')} />
        ))}
        head={[t('table.type'), t('words.duivelseiland'), t('words.nederland')]}
        rows={rows.map((x) => [x.title, f.num(x.dv), f.num(x.nl)])}
      />
    );
  }

  return C;
}
