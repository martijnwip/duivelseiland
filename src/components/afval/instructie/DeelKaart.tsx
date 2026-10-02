import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import type { T } from '@/components/stats/cards/card';
import { Icon, Mark, type IconName } from './icons';
import { Klok } from './Tijdvak';

type Item = { icon: IconName; label: string; short: string };

/*
 * Deelbare afbeelding van de instructiekaart: precies 1080×1920 (9:16) voor WhatsApp en
 * telefoonschermen. Op een telefoon wordt hij ~0,36× getoond, dus tekst is minimaal ~28px.
 * `scripts/afval-deelkaart.ts` maakt hier een PNG van (alleen het element #deelkaart).
 */

function Tile({ ok = true, title, text, children }: { ok?: boolean; title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border-[4px] border-primary bg-card px-6 py-6">
      <div className="flex items-center gap-3">
        <Mark ok={ok} className="size-[44px]" />
        <span className="font-heading text-[34px] leading-[1.1] font-bold whitespace-nowrap text-text">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <div aria-hidden className="flex w-[168px] flex-none items-center justify-center gap-1 text-text">
          {children}
        </div>
        <p className="m-0 text-[28px] leading-[1.3] text-text">{text}</p>
      </div>
    </div>
  );
}

function Grid({ items, ok, title }: { items: Item[]; ok: boolean; title: string }) {
  return (
    <div className={`flex flex-col gap-4 rounded-[28px] border-[4px] bg-card px-5 py-5 ${ok ? 'border-primary' : 'border-accent'}`}>
      <div className="flex items-center gap-3">
        <Mark ok={ok} className="size-[44px]" />
        <span className="font-heading text-[34px] font-bold text-text">{title}</span>
      </div>
      <ul className="m-0 grid list-none grid-cols-3 gap-x-2 gap-y-4 p-0">
        {items.map((it) => (
          <li key={it.icon} className="flex flex-col items-center gap-1 text-center">
            <Icon name={it.icon} className={`size-[58px] ${ok ? 'text-primary' : 'text-accent'}`} />
            <span className="text-[25px] leading-[1.1] font-semibold text-text">{it.short}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function DeelKaart({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'pages.afvalInstructie' })) as unknown as T;
  const s = (k: string) => t(`share.${k}`);
  const wel = t.raw('wel.items') as Item[];
  const niet = t.raw('niet.items') as Item[];

  return (
    <div id="deelkaart" className="deelkaart-licht flex h-[1920px] w-[1080px] flex-none flex-col overflow-hidden bg-background font-body">
      {/* Kopbalk */}
      <header className="flex items-center justify-between gap-6 bg-primary px-14 pt-9 pb-8 text-background">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-serif text-[72px] leading-[1] font-bold whitespace-nowrap">{t('title')}</h1>
          <span className="text-[32px] leading-[1.2] opacity-90">{s('subtitle')}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/duivelseiland-embleem.svg" alt="" className="h-[130px] w-auto flex-none" />
      </header>

      <div className="flex flex-1 flex-col justify-between gap-5 px-12 pt-8 pb-8">
        {/* Tijdvak */}
        <section className="flex items-center gap-8 rounded-[32px] border-[4px] border-text bg-card px-8 py-7">
          <Klok label={s('whenLabel')} className="size-[270px]" />
          <div className="flex min-w-0 flex-col gap-3">
            <span className="text-[28px] font-semibold tracking-[0.1em] text-muted uppercase">{s('whenLabel')}</span>
            <span className="font-heading text-[70px] leading-[1.02] font-bold text-primary">
              {t('grof.when.big').split(' → ')[0]}
              <br />→ {t('grof.when.big').split(' → ')[1]}
            </span>
            <span className="text-[30px] leading-[1.3] text-text">{s('whenNote')}</span>
          </div>
        </section>

        {/* Kernregels */}
        <div className="grid grid-cols-2 gap-5">
          <Tile title={s('tiles.rest.title')} text={s('tiles.rest.text')}>
            <Icon name="zak" className="size-[64px]" />
            <Icon name="container" className="size-[84px]" />
            <Icon name="rat" className="size-[60px] text-accent" strike />
          </Tile>
          <Tile title={s('tiles.karton.title')} text={s('tiles.karton.text')}>
            <Icon name="doos" className="size-[60px]" />
            <Icon name="mes" className="size-[52px]" />
            <Icon name="papiercontainer" className="size-[84px]" />
          </Tile>
          <Tile title={s('tiles.hoeveel.title')} text={s('tiles.hoeveel.text')}>
            <Icon name="kubus" className="size-[88px] text-primary" />
            <Icon name="wasmachine" className="size-[52px]" />
            <Icon name="wasmachine" className="size-[52px]" />
          </Tile>
          <Tile title={s('tiles.waar.title')} text={s('tiles.waar.text')}>
            <Icon name="bank" className="size-[80px]" />
            <Icon name="boom" className="size-[60px] text-primary" />
          </Tile>
        </div>

        {/* Wat wel en niet */}
        <div className="grid grid-cols-2 gap-5">
          <Grid items={wel} ok title={s('wel')} />
          <Grid items={niet} ok={false} title={s('niet')} />
        </div>
      </div>

      {/* Voetbalk met website in de hoek */}
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
