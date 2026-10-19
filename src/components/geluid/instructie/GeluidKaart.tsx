import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { T } from '@/components/stats/cards/card';
import { localizedHref } from '@/i18n/localizedHref';
import { Icon, type IconName } from '@/components/afval/instructie/icons';
import { Arrow, Panel, Scene } from '@/components/afval/instructie/InstructieKaart';
import { PrintButton } from '@/components/afval/instructie/PrintButton';
import { ShareImageButton } from '@/components/afval/instructie/ShareImageButton';
import { ADVIES_LAWAAI_VANAF, BOUW, TELEFOON, uur } from '@/lib/geluid/constants';
import { WeekBalk, type WeekBalkLabels } from '../WeekBalk';

/** Eén stap bij overlast: icoon, titel en (optioneel) een telefoonnummer. */
function Stap({ icon, title, text, tel }: { icon: IconName; title: string; text?: string; tel?: { label: string; href: string } }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border-2 border-primary bg-background p-3 break-inside-avoid">
      <Icon name={icon} className="size-10 flex-none text-primary print:size-8" />
      <div className="flex min-w-0 flex-col">
        <span className="font-heading text-[16px] leading-tight font-semibold text-text">{title}</span>
        {text && <span className="text-[14px] text-muted">{text}</span>}
        {tel && (
          <a href={tel.href} className="font-heading text-[20px] font-bold whitespace-nowrap text-primary no-underline print:text-[17px]">
            {tel.label}
          </a>
        )}
      </div>
    </li>
  );
}

const icons = (...names: [IconName, string][]): ReactNode => names.map(([n, cls], i) => <Icon key={i} name={n} className={cls} />);

export async function GeluidKaart({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'pages.geluidInstructie' })) as unknown as T;
  const tg = (await getTranslations({ locale, namespace: 'pages.geluid' })) as unknown as T;
  const geluidHref = localizedHref(locale, '/geluid');
  const base = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const tijd = { van: uur(BOUW.van, locale), tot: uur(BOUW.tot, locale), advies: uur(ADVIES_LAWAAI_VANAF, locale) };
  const week: WeekBalkLabels = { ...(tg.raw('verbouwen.week') as WeekBalkLabels), summary: tg('verbouwen.week.summary', tijd) };

  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 pt-6 pb-16 sm:px-6 xl:pt-10 print:max-w-none print:p-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={geluidHref}
          className="inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-text no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span aria-hidden>←</span> {t('back')}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <ShareImageButton
            src={`/geluid/instructiekaart-${locale === 'en' ? 'en' : 'nl'}.png`}
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
            <span className="text-[12px] font-semibold tracking-[0.12em] uppercase opacity-85">{t('eyebrow')}</span>
            <h1 className="m-0 text-[34px] leading-[1.02] font-bold xl:text-[48px] print:text-[36px]">{t('title')}</h1>
            <p className="m-0 text-[16px] leading-[1.35] opacity-90 xl:text-[18px] print:text-[14px]">{t('intro')}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/duivelseiland-embleem.svg" alt="" className="h-16 w-auto flex-none xl:h-24 print:h-16" />
        </header>

        <div className="grid md:grid-cols-2 print:grid-cols-2">
          <Panel n={1} title={t('verbouwen.title')} wide>
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] print:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="flex flex-col gap-4">
                <WeekBalk labels={week} />
                <p className="m-0 border-t border-border pt-3 text-[14px] leading-[1.45] text-muted print:text-[12px]">{tg('verbouwen.week.feestdag')}</p>
              </div>
              <div className="grid gap-3">
                <Scene ok title={t('verbouwen.ok', tijd)} caption={t('verbouwen.okCaption')}>
                  {icons(['boor', 'size-11'], ['hamer', 'size-10'])}
                </Scene>
                <Scene ok={false} title={t('verbouwen.later')} caption={t('verbouwen.laterCaption')}>
                  {icons(['zon', 'size-9 text-muted'], ['boor', 'size-11 text-accent'])}
                </Scene>
                <Scene ok={false} title={t('verbouwen.no')} caption={t('verbouwen.noCaption')}>
                  {icons(['kalender', 'size-10'], ['hamer', 'size-10 text-accent'])}
                </Scene>
              </div>
            </div>
          </Panel>

          <Panel n={2} title={t('buren.title')}>
            <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
              <Scene ok title={t('buren.bord')} caption={t('buren.bordCaption')}>
                <Icon name="bouwbord" className="size-13" />
              </Scene>
              <Scene ok title={t('buren.brief')} caption={t('buren.briefCaption')}>
                <Icon name="brief" className="size-11" />
                <Arrow />
                <Icon name="huis" className="size-12" />
              </Scene>
            </div>
          </Panel>

          <Panel n={3} title={t('feest.title')}>
            <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
              <Scene ok title={t('feest.brief')} caption={t('feest.briefCaption')}>
                {icons(['brief', 'size-11'], ['muziek', 'size-10 text-primary'])}
              </Scene>
              <Scene ok title={t('feest.laat')} caption={t('feest.laatCaption')}>
                {icons(['maan', 'size-9'], ['muziek', 'size-8'])}
              </Scene>
              <div className="sm:col-span-2 print:col-span-2">
                <Scene ok={false} title={t('feest.vaak')} caption={t('feest.vaakCaption')}>
                  {icons(['maan', 'size-9'], ['muziek', 'size-10 text-accent'], ['maan', 'size-9'], ['muziek', 'size-10 text-accent'])}
                </Scene>
              </div>
            </div>
          </Panel>

          <Panel n={4} title={t('overlast.title')} wide>
            <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-3 print:grid-cols-3">
              <Stap icon="praten" title={t('overlast.praten')} text={t('overlast.pratenText')} />
              <Stap icon="huis" title={t('overlast.bemiddeling')} text={t('overlast.bemiddelingText')} tel={TELEFOON.beterBuren} />
              <Stap icon="telefoon" title={t('overlast.meldpunt')} text={t('overlast.meldpuntText')} tel={TELEFOON.meldpunt} />
            </ol>
            <p className="m-0 text-[15px] text-text print:text-[13px]">{t('overlast.nood', { politie: TELEFOON.politie.label, nood: TELEFOON.nood.label })}</p>
          </Panel>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t-[3px] border-text bg-background px-5 py-3 text-[14px] text-text xl:px-6 print:text-[12px]">
          <span>{t('footer')}</span>
          <Link href={geluidHref} className="font-semibold text-primary underline underline-offset-3 print:no-underline">
            {base ? `${base}${geluidHref}` : geluidHref}
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
