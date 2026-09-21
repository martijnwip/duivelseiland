import type { ReactNode } from 'react';
import { section } from '@/lib/stats/load';
import type { VerbruikRow } from '@/lib/stats/types';
import { Card, dual, type Ctx } from './card';
import { LineChart } from '../charts/LineChart';
import { BarVertical, BarHorizontal } from '../charts/Bars';
import { Donut } from '../charts/Circular';

export function housingCards(ctx: Ctx): Record<string, ReactNode> {
  const { t, f, tl } = ctx;
  const C: Record<string, ReactNode> = {};

  // WOZ-waarde per jaar
  {
    const d = section('woningwaarde').data;
    const xs = d.map((x) => Number(x.key));
    const vals = d.map((x) => x.waarde);
    const ip = vals.indexOf(Math.max(...vals));
    C.woz = (
      <Card
        ctx={ctx}
        cardId="woz"
        sid="woningwaarde"
        chart={dual(true, (w, m) => (
          <LineChart
            width={w}
            height={m ? 220 : 250}
            xs={xs}
            series={[{ vals, tone: 'p' }]}
            ymin={0}
            ymax={700000}
            yticks={[0, 200000, 400000, 600000]}
            yfmt={f.eurK}
            xticks={[2013, 2016, 2019, 2022, 2025].map((y) => [y, String(y)] as [number, string])}
            marks={[
              { si: 0, i: 0, text: f.eur(vals[0]), dy: -14, dx: 18 },
              { si: 0, i: ip, text: t('marks.peak', { year: xs[ip], value: f.eur(vals[ip]) }), dy: -14 },
              { si: 0, i: vals.length - 1, text: f.eur(vals[vals.length - 1]), dy: 22, dx: -4, anchor: 'end' },
            ]}
            area={0}
            left={56}
            label={t('cards.woz.aria')}
            tip={(_, i) => `${xs[i]}\n${f.eur(vals[i])}`}
          />
        ))}
        head={[t('table.year'), t('table.woz')]}
        rows={d.map((x) => [x.key, f.eur(x.waarde)])}
      />
    );
  }

  // koop en huur
  {
    const s = section('eigendom');
    const tones = ['p', 'p3', 'p6'] as const;
    C.eigendom = (
      <Card
        ctx={ctx}
        cardId="eigendom"
        sid="eigendom"
        chart={
          <Donut
            parts={s.data.map((x, i) => ({ label: tl(x.label), v: x.waarde, tone: tones[i] }))}
            centerTop={f.num(s.totaal ?? 0)}
            centerBottom={t('words.homes')}
            label={t('cards.eigendom.aria')}
          />
        }
        head={[t('table.type'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde), f.pct(x.aandeel ?? 0)])}
      />
    );
  }

  // bouwperiode
  {
    const s = section('bouwperiode');
    const first = s.data.slice(0, 4);
    const laterSum = s.data.slice(4).reduce((a, x) => a + x.waarde, 0);
    const bars = [...first.map((x) => ({ label: tl(x.label), v: x.waarde })), { label: t('words.from1950'), v: laterSum }].map((b) => ({
      ...b,
      tip: `${b.label}\n${f.num(b.v)}`,
    }));
    C.bouw = (
      <Card
        ctx={ctx}
        cardId="bouw"
        sid="bouwperiode"
        chart={dual(false, (w, m) => (
          <BarHorizontal width={w} rows={bars} fmt={f.num} mobile={m} labelWidth={172} rowHeight={32} label={t('cards.bouw.title')} />
        ))}
        head={[t('table.period'), t('table.addresses')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde)])}
      />
    );
  }

  // energielabels (A++ t/m G; labels zonder adressen vallen weg)
  {
    const s = section('energielabels');
    const shown = s.data.filter((x) => x.waarde > 0);
    C.energie = (
      <Card
        ctx={ctx}
        cardId="energie"
        sid="energielabels"
        chart={dual(false, (w) => (
          <BarVertical
            width={w}
            height={230}
            gap={0.3}
            items={shown.map((x) => ({ label: x.label, v: x.waarde, tone: x.label === 'G' ? 'c' : 'p', tip: `${x.label}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            label={t('cards.energie.aria')}
          />
        ))}
        head={[t('table.label'), t('table.addresses')]}
        rows={s.data.map((x) => [x.label, f.num(x.waarde)])}
      />
    );
  }

  // gas en stroom per woning: twee grafieken met elk een eigen as
  {
    const d = section<VerbruikRow>('energieverbruik').data;
    const ys = d.map((x) => x.jaar);
    const last = d.length - 1;
    const one = (w: number, key: 'gas_m3' | 'stroom_kwh', max: number, mid: number, label: string) => (
      <LineChart
        width={w}
        height={150}
        xs={ys}
        series={[{ vals: d.map((x) => x[key]), tone: 'p' }]}
        ymin={0}
        ymax={max}
        yticks={[0, mid, max]}
        yfmt={f.num}
        xticks={[2013, 2018, 2024].map((y) => [y, String(y)] as [number, string])}
        marks={[
          { si: 0, i: 0, text: f.num(d[0][key]), dy: -12, dx: 14 },
          { si: 0, i: last, text: f.num(d[last][key]), dy: -12 },
        ]}
        left={44}
        top={20}
        label={label}
        tip={(_, i) => `${ys[i]}\n${f.num(d[i][key])} ${key === 'gas_m3' ? 'm³' : 'kWh'}`}
      />
    );
    const cap = (txt: string) => <div className="-mb-1 text-[13px] font-semibold text-text">{txt}</div>;
    C.verbruik = (
      <Card
        ctx={ctx}
        cardId="verbruik"
        sid="energieverbruik"
        chart={
          <div className="flex flex-col gap-4">
            {cap(t('verbruik.gas'))}
            {dual(false, (w) => one(w, 'gas_m3', 1200, 600, t('verbruik.gas')))}
            {cap(t('verbruik.power'))}
            {dual(false, (w) => one(w, 'stroom_kwh', 2400, 1200, t('verbruik.power')))}
          </div>
        }
        head={[t('table.year'), t('verbruik.gas'), t('verbruik.power')]}
        rows={d.map((x) => [x.jaar, f.num(x.gas_m3), f.num(x.stroom_kwh)])}
      />
    );
  }

  // meer cijfers: bewoning, woningtype, gebruiksdoelen
  {
    const s = section('bewoning');
    const tones = ['p', 'p3'] as const;
    const total = s.data.reduce((a, x) => a + x.waarde, 0);
    C.bewoning = (
      <Card
        ctx={ctx}
        cardId="bewoning"
        sid="bewoning"
        chart={
          <Donut
            parts={s.data.map((x, i) => ({ label: tl(x.label), v: x.waarde, tone: tones[i] }))}
            centerTop={f.num(total)}
            centerBottom={t('words.homes')}
            label={t('cards.bewoning.aria')}
          />
        }
        head={[t('table.type'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde), f.pct(x.aandeel ?? 0)])}
      />
    );
  }
  {
    const s = section('woningtype');
    C.woningtype = (
      <Card
        ctx={ctx}
        cardId="woningtype"
        sid="woningtype"
        chart={dual(false, (w, m) => (
          <BarHorizontal
            width={w}
            rows={s.data.map((x) => ({ label: tl(x.label), v: x.waarde, tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            mobile={m}
            labelWidth={120}
            rowHeight={26}
            label={t('cards.woningtype.title')}
          />
        ))}
        head={[t('table.type'), t('table.count')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde)])}
      />
    );
  }
  {
    const s = section('gebruiksdoelen');
    const shown = s.data.filter((x) => x.waarde > 0);
    C.gebruiksdoelen = (
      <Card
        ctx={ctx}
        cardId="gebruiksdoelen"
        sid="gebruiksdoelen"
        chart={dual(false, (w) => (
          <BarHorizontal
            width={w}
            rows={shown.map((x, k) => ({ label: tl(x.label), v: x.waarde, tone: k === 0 ? 'p' : 'p6', tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            mobile
            valueWidth={48}
            label={t('cards.gebruiksdoelen.title')}
          />
        ))}
        head={[t('table.use'), t('table.addresses')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde)])}
      />
    );
  }

  return C;
}
