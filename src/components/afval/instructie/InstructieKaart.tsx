import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { T } from '@/components/stats/cards/card';
import { localizedHref } from '@/i18n/localizedHref';
import { Icon, Mark, type IconName } from './icons';
import { Klok, Tijdvak } from './Tijdvak';
import { PrintButton } from './PrintButton';
import { ShareImageButton } from './ShareImageButton';

type Item = { icon: IconName; label: string };

/** Paneel met groot nummer, zoals op een safety card. */
export function Panel({ n, title, children, wide = false }: { n: number; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section
      aria-labelledby={`paneel-${n}`}
      className={`flex min-w-0 flex-col gap-4 border-t-[3px] border-text p-5 break-inside-avoid xl:p-6 print:p-4 ${wide ? 'md:col-span-2 print:col-span-2' : ''}`}
    >
      <h2 id={`paneel-${n}`} className="m-0 flex items-center gap-3 text-[22px] leading-[1.15] font-bold text-text xl:text-[26px] print:text-[20px]">
        <span aria-hidden className="flex size-10 flex-none items-center justify-center rounded-full bg-text font-heading text-[20px] text-background print:size-8 print:text-[16px]">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Eén situatie: goed (groen, ✓) of fout (terracotta, ✗), met pictogrammen en korte uitleg. */
export function Scene({ ok, title, caption, children }: { ok: boolean; title: string; caption?: string; children: ReactNode }) {
  return (
    <figure className={`m-0 flex min-w-0 flex-col gap-2 rounded-lg border-2 bg-background p-3 break-inside-avoid ${ok ? 'border-primary' : 'border-accent'}`}>
      <div className="flex items-center gap-2">
        <Mark ok={ok} />
        <span className="font-heading text-[16px] leading-tight font-semibold text-text">{title}</span>
      </div>
      <div aria-hidden className="flex items-center justify-center gap-1.5 py-2 text-text">
        {children}
      </div>
      {caption && <figcaption className="text-[14px] leading-[1.4] text-text">{caption}</figcaption>}
    </figure>
  );
}

export const Arrow = () => <Icon name="pijl" className="size-6 text-muted" />;

export async function InstructieKaart({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'pages.afvalInstructie' })) as unknown as T;
  const afvalHref = localizedHref(locale, '/afval');
  const base = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const wel = t.raw('wel.items') as Item[];
  const niet = t.raw('niet.items') as Item[];

  const itemList = (items: Item[], ok: boolean) => (
    <ul className="m-0 grid list-none grid-cols-1 gap-x-4 gap-y-2 p-0 sm:grid-cols-2 print:grid-cols-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2.5 text-[15px] leading-[1.25] text-text print:text-[13px]">
          <span className={`flex size-10 flex-none items-center justify-center rounded-md bg-background print:size-8 ${ok ? 'text-primary' : 'text-accent'}`}>
            <Icon name={it.icon} className="size-7 print:size-6" />
          </span>
          <span className="sr-only">{ok ? '✓' : '✗'}</span>
          {it.label}
        </li>
      ))}
    </ul>
  );

  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 pt-6 pb-16 sm:px-6 xl:pt-10 print:max-w-none print:p-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={afvalHref}
          className="inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-text no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span aria-hidden>←</span> {t('back')}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <ShareImageButton
            src={`/afval/instructiekaart-${locale === 'en' ? 'en' : 'nl'}.png`}
            fileName={t('share.fileName')}
            title={t('share.shareTitle')}
            text={t('share.shareText')}
            label={t('share.button')}
          />
          <PrintButton label={t('print')} />
        </div>
      </div>

      <article className="instructie-kaart overflow-hidden rounded-2xl border-[3px] border-text bg-card">
        <header className="flex items-center justify-between gap-4 bg-primary px-5 py-5 text-background xl:px-6 print:py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[12px] font-semibold tracking-[0.12em] uppercase">{t('eyebrow')}</span>
            <h1 className="m-0 text-[34px] leading-[1.02] font-bold xl:text-[48px] print:text-[36px]">{t('title')}</h1>
            <p className="m-0 text-[16px] leading-[1.35] opacity-90 xl:text-[18px] print:text-[14px]">{t('intro')}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/duivelseiland-embleem.svg" alt="" className="h-16 w-auto flex-none xl:h-24 print:h-16" />
        </header>

        <div className="grid md:grid-cols-2 print:grid-cols-2">
          <Panel n={1} title={t('grof.title')} wide>
            <div className="flex flex-col gap-2">
              <h3 className="m-0 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">{t('grof.when.label')}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Klok label={t('grof.when.clock')} className="size-24 xl:size-28 print:size-24" />
                <p className="m-0 font-heading text-[26px] leading-none font-bold whitespace-nowrap text-primary sm:text-[30px] xl:text-[34px] print:text-[30px]">{t('grof.when.big')}</p>
              </div>
              {/* De tijdbalk schaalt mee met de breedte; over de hele kaart wordt hij te groot. */}
              <div className="w-full max-w-[640px]">
                <Tijdvak
                  labels={{
                    zondag: t('grof.when.zondag'),
                    maandag: t('grof.when.maandag'),
                    teVroeg: t('grof.when.teVroeg'),
                    buiten: t('grof.when.buiten'),
                    teLaat: t('grof.when.teLaat'),
                    label: t('grof.when.label') + ': ' + t('grof.when.text'),
                  }}
                />
              </div>
              <p className="m-0 text-[15px] leading-[1.45] text-text print:text-[13px]">{t('grof.when.text')}</p>
              <p className="m-0 flex items-start gap-2 rounded-md border-2 border-accent bg-background p-2.5 text-[15px] leading-[1.4] font-semibold text-text print:text-[13px]">
                <Mark ok={false} />
                {t('grof.when.feestdag')}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <h3 className="m-0 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">{t('grof.how.label')}</h3>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div aria-hidden className="flex items-center gap-2 text-text">
                  <Icon name="kubus" className="size-20 text-primary print:size-16" />
                  <span className="font-heading text-[40px] leading-none font-bold text-primary print:text-[32px]">
                    2 m<sup className="text-[22px]">3</sup>
                  </span>
                </div>
                <div aria-hidden className="flex items-center gap-2 text-text">
                  <Icon name="wasmachine" className="size-10" />
                  <Icon name="wasmachine" className="size-10" />
                  <span className="px-1 font-heading text-[15px] font-semibold text-muted">{t('grof.how.or')}</span>
                  <Icon name="bank" className="size-14" />
                </div>
                <p className="m-0 max-w-[420px] text-[15px] leading-[1.45] text-text print:text-[13px]">{t('grof.how.text')}</p>
              </div>
            </div>
          </Panel>

          <Panel n={2} title={t('rest.title')}>
            <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
              <Scene ok title={t('rest.ok')} caption={t('rest.okCaption')}>
                <Icon name="zak" className="size-13" />
                <Arrow />
                <Icon name="container" className="size-14" />
              </Scene>
              <Scene ok={false} title={t('rest.no')} caption={t('rest.noCaption')}>
                <Icon name="container" className="size-14" />
                <Icon name="zak" className="size-10" />
                <Icon name="rat" className="size-13 text-accent" />
              </Scene>
            </div>
          </Panel>

          <Panel n={3} title={t('karton.title')}>
            <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
              <Scene ok title={t('karton.ok')} caption={t('karton.okCaption')}>
                <Icon name="doos" className="size-10" />
                <Arrow />
                <Icon name="papiercontainer" className="size-14" />
              </Scene>
              <Scene ok title={t('karton.big')} caption={t('karton.bigCaption')}>
                <Icon name="doos" className="size-10" />
                <Icon name="mes" className="size-9" />
                <Icon name="stukken" className="size-9" />
                <Arrow />
                <Icon name="papiercontainer" className="size-14" />
              </Scene>
            </div>
          </Panel>

          <Panel n={4} title={t('welniet.title')} wide>
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-lg border-2 border-primary bg-card p-3">
                <h3 className="m-0 flex items-center gap-2 text-[17px] font-semibold text-text">
                  <Mark ok /> {t('wel.title')}
                </h3>
                {itemList(wel, true)}
              </div>
              <div className="flex flex-col gap-3 rounded-lg border-2 border-accent bg-card p-3">
                <h3 className="m-0 flex items-center gap-2 text-[17px] font-semibold text-text">
                  <Mark ok={false} /> {t('niet.title')}
                </h3>
                {itemList(niet, false)}
              </div>
            </div>
          </Panel>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t-[3px] border-text bg-background px-5 py-3 text-[14px] text-text xl:px-6 print:text-[12px]">
          <span>{t('footer')}</span>
          <Link href={afvalHref} className="font-semibold text-primary underline underline-offset-3 print:no-underline">
            {base ? `${base}${afvalHref}` : afvalHref}
          </Link>
        </footer>
        <p className="m-0 bg-background px-5 pb-2 text-right text-[12px] text-muted xl:px-6 print:text-[10px]">
          <a href="https://martijnwip.nl" className="text-muted no-underline hover:underline">
            {t('credit')}
          </a>
        </p>
      </article>
    </main>
  );
}
