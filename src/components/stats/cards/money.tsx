import type { ReactNode } from 'react';
import { section } from '@/lib/stats/load';
import type { VergelijkItem } from '@/lib/stats/types';
import { Card, dual, Stat, type Ctx } from './card';
import { Dual, Legend } from '../charts/base';
import { BarHorizontal } from '../charts/Bars';
import { IncomeScale } from '../charts/SpecialCharts';

export function moneyCards(ctx: Ctx): Record<string, ReactNode> {
  const { t, f, tl } = ctx;
  const C: Record<string, ReactNode> = {};
  const words = { dv: t('words.duivelseiland'), am: t('words.amsterdam'), nl: t('words.nederland') };

  // inkomen
  {
    const s = section('inkomen');
    const [main, ...rest] = s.data;
    const values = { dv: main.waarde, am: main.amsterdam as number, nl: main.nederland as number };
    const money = (x: (typeof rest)[number]) => (x.eenheid === '€' ? f.eur(x.waarde) : f.pct(x.waarde, 1));
    C.inkomen = (
      <Card
        ctx={ctx}
        cardId="inkomen"
        sid="inkomen"
        chart={
          <div className="flex flex-col gap-6">
            <div className="grid items-end gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-12">
              <div className="flex flex-col gap-1">
                <span className="font-heading text-[44px] leading-none font-semibold text-primary xl:text-[64px]">{f.eur(main.waarde)}</span>
                <span className="text-base leading-[1.4] text-muted">{t('inkomen.mainLabel', { year: main.jaar as number })}</span>
              </div>
              <Dual
                desktop={<IncomeScale width={560} values={values} f={f} names={words} label={t('cards.inkomen.aria')} />}
                mobile={<IncomeScale width={310} values={values} f={f} names={words} label={t('cards.inkomen.aria')} />}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 xl:grid-cols-3">
              {rest.map((x) => (
                <Stat key={x.key} label={tl(x.label)} value={money(x)} sub={String(x.jaar)} />
              ))}
            </div>
          </div>
        }
        head={[t('table.type'), t('table.value'), t('table.year')]}
        rows={s.data.map((x) => [tl(x.label), x.eenheid === '€' ? f.eur(x.waarde) : f.pct(x.waarde, 1), x.jaar as number])}
      />
    );
  }

  // inkomen per buurt in het Museumkwartier
  {
    const s = section<VergelijkItem>('inkomen-vergelijking');
    const rows = s.data.map((x) => ({
      label: x.label,
      v: x.waarde,
      tone: (x.is_duivelseiland ? 'p' : x.is_wijk ? 's' : 'm3') as 'p' | 's' | 'm3',
      strong: x.is_duivelseiland || x.is_wijk,
      tip: `${x.label}\n${f.eur(x.waarde)}`,
    }));
    C.ikvergelijk = (
      <Card
        ctx={ctx}
        cardId="ikvergelijk"
        sid="inkomen-vergelijking"
        chart={
          <>
            {dual(false, (w) => (
              <BarHorizontal width={w} rows={rows} fmt={f.eur} mobile valueWidth={76} max={105000} label={t('cards.ikvergelijk.aria')} />
            ))}
            <Legend
              items={[
                { label: words.dv, tone: 'p' },
                { label: t('words.wijkMuseumkwartier'), tone: 's' },
                { label: t('words.otherNeighbourhoods'), tone: 'm3' },
              ]}
            />
          </>
        }
        head={[t('table.area'), t('table.incomePerResident')]}
        rows={s.data.map((x) => [x.label, f.eur(x.waarde)])}
      />
    );
  }

  // bedrijfsvestigingen
  {
    const s = section('bedrijven');
    const shown = s.data.filter((x) => x.waarde > 0).sort((a, b) => b.waarde - a.waarde);
    C.bedrijven = (
      <Card
        ctx={ctx}
        cardId="bedrijven"
        sid="bedrijven"
        chart={dual(false, (w) => (
          <BarHorizontal
            width={w}
            rows={shown.map((x, k) => ({ label: tl(x.label), v: x.waarde, tone: k === 0 ? 'p' : 'p6', tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            mobile
            valueWidth={48}
            label={t('cards.bedrijven.title')}
          />
        ))}
        head={[t('table.sector'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde), f.pct(x.aandeel ?? 0, 1)])}
      />
    );
  }

  // meer cijfers: werk en uitkeringen
  {
    const s = section('arbeid');
    C.arbeid = (
      <Card
        ctx={ctx}
        cardId="arbeid"
        sid="arbeid"
        chart={dual(false, (w) => (
          <BarHorizontal
            width={w}
            rows={s.data.map((x) => ({ label: tl(x.label), v: x.waarde, tip: `${tl(x.label)}\n${f.pct(x.waarde)}` }))}
            fmt={(v) => f.pct(v)}
            mobile
            max={100}
            valueWidth={48}
            label={t('cards.arbeid.title')}
          />
        ))}
        head={[t('table.type'), t('table.percentage')]}
        rows={s.data.map((x) => [tl(x.label), f.pct(x.waarde)])}
      />
    );
  }
  {
    const s = section('uitkeringen');
    C.uitkeringen = (
      <Card
        ctx={ctx}
        cardId="uitkeringen"
        sid="uitkeringen"
        chart={dual(false, (w, m) => (
          <BarHorizontal
            width={w}
            rows={s.data.map((x) => ({ label: tl(x.label), v: x.waarde, tip: `${tl(x.label)}\n${f.num(x.waarde)}` }))}
            fmt={f.num}
            mobile={m}
            labelWidth={190}
            label={t('cards.uitkeringen.title')}
          />
        ))}
        head={[t('table.type'), t('table.count'), t('table.share')]}
        rows={s.data.map((x) => [tl(x.label), f.num(x.waarde), f.pct(x.aandeel ?? 0)])}
      />
    );
  }

  return C;
}
