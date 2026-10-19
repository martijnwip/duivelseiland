import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import type { T } from '@/components/stats/cards/card';
import { Icon, Mark } from '@/components/afval/instructie/icons';
import { ADVIES_LAWAAI_VANAF, BOUW, TELEFOON, uur } from '@/lib/geluid/constants';
import { WeekBalk, type WeekBalkLabels } from '../WeekBalk';

/*
 * Deelbare afbeelding van de instructiekaart geluid: precies 1080×1920 (9:16), net als die van afval.
 * Op een telefoon ~0,36× getoond, dus tekst minimaal ~26px.
 * `scripts/afval-deelkaart.ts` maakt hier een PNG van (alleen het element #deelkaart).
 */

function Tile({ ok = true, title, text, children }: { ok?: boolean; title: string; text: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-4 rounded-[28px] border-[4px] bg-card px-6 py-6 ${ok ? 'border-primary' : 'border-accent'}`}>
      <div className="flex items-center gap-3">
        <Mark ok={ok} className="size-[44px]" />
        <span className="font-heading text-[34px] leading-[1.1] font-bold text-text">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <div aria-hidden className="flex w-[120px] flex-none items-center justify-center gap-1 text-text">
          {children}
        </div>
        <p className="m-0 text-[28px] leading-[1.3] text-text">{text}</p>
      </div>
    </div>
  );
}

export async function GeluidDeelKaart({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'pages.geluidInstructie' })) as unknown as T;
  const tg = (await getTranslations({ locale, namespace: 'pages.geluid' })) as unknown as T;
  const s = (k: string) => t(`share.${k}`);
  const tijd = { van: uur(BOUW.van, locale), tot: uur(BOUW.tot, locale), advies: uur(ADVIES_LAWAAI_VANAF, locale) };
  const week: WeekBalkLabels = { ...(tg.raw('verbouwen.week') as WeekBalkLabels), summary: tg('verbouwen.week.summary', tijd) };

  return (
    <div id="deelkaart" className="deelkaart-licht flex h-[1920px] w-[1080px] flex-none flex-col overflow-hidden bg-background font-body">
      <header className="flex items-center justify-between gap-6 bg-primary px-14 pt-9 pb-8 text-background">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="m-0 font-serif text-[72px] leading-[1] font-bold">{t('title')}</h1>
          <span className="text-[32px] leading-[1.2] opacity-90">{s('subtitle')}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/duivelseiland-embleem.svg" alt="" className="h-[130px] w-auto flex-none" />
      </header>

      <div className="flex flex-1 flex-col justify-between gap-5 px-12 pt-8 pb-8">
        <section className="flex flex-col gap-4 rounded-[32px] border-[4px] border-text bg-card px-8 py-7">
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-semibold tracking-[0.1em] text-muted uppercase">{s('weekLabel')}</span>
            <span className="font-heading text-[80px] leading-[1.02] font-bold whitespace-nowrap text-primary">
              {tijd.van}–{tijd.tot}
            </span>
            <span className="text-[30px] leading-[1.3] text-text">{tg('chapters.verbouwen.factText')}</span>
          </div>
          <WeekBalk labels={week} groot />
          <span className="text-[28px] leading-[1.3] font-semibold text-text">{s('weekNote')}</span>
        </section>

        <div className="grid grid-cols-2 gap-5">
          <Tile title={s('tiles.later.title')} text={s('tiles.later.text')}>
            <Icon name="boor" className="size-[84px]" />
          </Tile>
          <Tile title={s('tiles.buren.title')} text={s('tiles.buren.text')}>
            <Icon name="brief" className="size-[80px]" />
          </Tile>
          <Tile title={s('tiles.feest.title')} text={s('tiles.feest.text')}>
            <Icon name="muziek" className="size-[78px] text-primary" />
          </Tile>
          <Tile title={s('tiles.overlast.title')} text={s('tiles.overlast.text')}>
            <Icon name="praten" className="size-[84px]" />
          </Tile>
        </div>

        <section className="flex items-center justify-between gap-6 rounded-[28px] bg-primary px-8 py-6 text-background">
          <div className="flex items-center gap-4">
            <Icon name="telefoon" className="size-[64px]" />
            <span className="text-[30px] leading-[1.2] font-semibold">{s('bellen')}</span>
          </div>
          <span className="font-heading text-[48px] font-bold whitespace-nowrap">{TELEFOON.meldpunt.label}</span>
        </section>
      </div>

      <footer className="flex flex-col gap-3 border-t-[4px] border-text bg-card px-14 pt-7 pb-5">
        <div className="flex items-center justify-between gap-6">
          <span className="max-w-[440px] text-[26px] leading-[1.25] text-muted">{s('footer')}</span>
          <span className="font-heading text-[46px] font-bold text-primary">{s('site')}</span>
        </div>
        <span className="text-right text-[22px] text-muted">{t('credit')}</span>
      </footer>
    </div>
  );
}
