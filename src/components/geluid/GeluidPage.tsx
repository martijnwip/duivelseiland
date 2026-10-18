import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import type { T } from '@/components/stats/cards/card';
import { ChapterNav } from '@/components/stats/ChapterNav';
import { Chapter, Pair, Stack } from '@/components/stats/Chapter';
import { External, linkCls } from '@/components/site/External';
import { Icon, type IconName } from '@/components/afval/instructie/icons';
import { ADVIES_LAWAAI_VANAF, BOUW, BUURTFEEST, DAGWAARDEN, GECONTROLEERD, LINKS, ONTHEFFING, TELEFOON, uur } from '@/lib/geluid/constants';
import { WeekBalk, type WeekBalkLabels } from './WeekBalk';

const boxCls = 'flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4 xl:p-6';
const buttonCls =
  'inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-[15px] font-semibold no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const onPrimaryLink =
  'font-semibold whitespace-nowrap text-background underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background';

function BoxTitle({ title, sub, icon }: { title: string; sub?: string; icon?: IconName }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <Icon name={icon} className="size-9 flex-none text-primary" />}
      <div>
        <h3 className="m-0 text-[17px] leading-[1.3] font-semibold text-text xl:text-lg">{title}</h3>
        {sub && <p className="mt-1 mb-0 text-sm leading-[1.4] text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-[1.45] text-text">
          <span aria-hidden className="mt-2 size-1.5 flex-none rounded-full bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
}

const Para = ({ children }: { children: ReactNode }) => <p className="m-0 text-[15px] leading-[1.5] text-text">{children}</p>;

/** Stappen bij overlast, met de actie die erbij hoort. */
const STAPPEN = ['praten', 'verhuurder', 'beterBuren', 'meldpunt', 'bouw', 'horeca'] as const;

export async function GeluidPage({ locale }: { locale: string }) {
  const tr = await getTranslations({ locale, namespace: 'pages.geluid' });
  const t = tr as unknown as T;
  const note = t('ui.external');
  const tijd = { van: uur(BOUW.van, locale), tot: uur(BOUW.tot, locale), einde: uur(BUURTFEEST.tot, locale), advies: uur(ADVIES_LAWAAI_VANAF, locale) };
  const euro = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(ONTHEFFING.kostenPerNacht);
  const gecontroleerd = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${GECONTROLEERD}T12:00:00Z`));
  const briefjeHref = localizedHref(locale, '/geluid/briefje');
  const kaartHref = localizedHref(locale, '/geluid/instructie');

  const chapterIds = ['verbouwen', 'feestjes', 'overlast', 'vooraf'];
  const chapters = chapterIds.map((id) => ({ id, name: t(`chapters.${id}.name`) }));
  const navLabels = { nav: t('nav.nav'), contents: t('nav.contents'), chapterOf: t('nav.chapterOf', { n: '{n}', total: '{total}' }) };
  const sourcesNav = { id: 'bronnen', name: t('nav.sources') };
  const chapter = (n: number, id: string, children: ReactNode) => (
    <Chapter
      n={n}
      id={id}
      label={t('ui.chapterLabel')}
      title={t(`chapters.${id}.name`)}
      message={t(`chapters.${id}.message`)}
      factBig={t(`chapters.${id}.factBig`, tijd)}
      factText={t(`chapters.${id}.factText`)}
    >
      {children}
    </Chapter>
  );

  const week = t.raw('verbouwen.week') as Omit<WeekBalkLabels, 'summary'>;
  const weekLabels: WeekBalkLabels = { ...week, summary: t('verbouwen.week.summary', tijd) };

  // ---- Hoofdstuk 1: verbouwen ----
  const weekBox = (
    <div className={boxCls}>
      <BoxTitle title={t('verbouwen.weekTitle')} sub={t('verbouwen.weekSub')} />
      <WeekBalk labels={weekLabels} />
      <p className="m-0 border-t border-border pt-3 text-sm leading-[1.45] text-muted">{t('verbouwen.week.feestdag')}</p>
    </div>
  );

  const adviesBox = (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border-2 border-primary bg-card p-4 xl:p-6">
      <BoxTitle title={t('verbouwen.advies.title')} icon="boor" />
      <Para>{t('verbouwen.advies.text')}</Para>
    </div>
  );

  const klussenBox = (
    <div className={boxCls}>
      <BoxTitle title={t('verbouwen.klussen.title')} icon="hamer" />
      {(t.raw('verbouwen.klussen.text') as string[]).map((_, i) => (
        <Para key={i}>{t(`verbouwen.klussen.text.${i}`, tijd)}</Para>
      ))}
    </div>
  );

  const grenzenBox = (
    <div className={boxCls}>
      <BoxTitle title={t('verbouwen.grenzen.title')} sub={t('verbouwen.grenzen.sub')} />
      <table className="w-full border-collapse text-[15px]">
        <thead>
          <tr>
            {(t.raw('verbouwen.grenzen.head') as string[]).map((h) => (
              <th key={h} scope="col" className="border-b-2 border-text py-2 text-left text-sm font-semibold text-text">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAGWAARDEN.map((d) => (
            <tr key={d.db} className="border-b border-border">
              <td className="py-2 font-heading font-semibold text-text tabular-nums">{d.db} dB(A)</td>
              <td className={`py-2 tabular-nums ${d.dagen === 0 ? 'font-semibold text-accent' : 'text-text'}`}>
                {d.dagen === null ? t('verbouwen.grenzen.onbeperkt') : d.dagen === 0 ? t('verbouwen.grenzen.nooit') : t('verbouwen.grenzen.dagen', { n: d.dagen })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0 text-sm leading-[1.45] text-muted">{t('verbouwen.grenzen.note')}</p>
    </div>
  );

  const burenBox = (
    <div className={boxCls}>
      <BoxTitle title={t('verbouwen.buren.title')} icon="brief" />
      <Para>{t('verbouwen.buren.text')}</Para>
      <Para>{t('verbouwen.buren.bouwbord')}</Para>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Link href={briefjeHref} className={linkCls}>
          {t('verbouwen.buren.briefjeCta')}
        </Link>
        <External href={LINKS.vertelBuren} note={note}>
          {t('verbouwen.buren.gemeenteCta')}
        </External>
      </div>
    </div>
  );

  const ontheffingBox = (
    <div className={boxCls}>
      <BoxTitle title={t('verbouwen.ontheffing.title')} icon="maan" />
      <Para>{t('verbouwen.ontheffing.text')}</Para>
      <Bullets items={(t.raw('verbouwen.ontheffing.items') as string[]).map((_, i) => t(`verbouwen.ontheffing.items.${i}`, { weken: ONTHEFFING.wekenVooraf }))} />
      <Para>{t('verbouwen.ontheffing.kosten', { bedrag: euro })}</Para>
      <External href={LINKS.ontheffing} note={note}>
        {t('verbouwen.ontheffing.cta')}
      </External>
    </div>
  );

  // ---- Hoofdstuk 2: feestjes ----
  const thuisBox = (
    <div className={boxCls}>
      <BoxTitle title={t('feestjes.thuis.title')} icon="huis" />
      {(t.raw('feestjes.thuis.text') as string[]).map((p) => (
        <Para key={p}>{p}</Para>
      ))}
    </div>
  );

  const tipsBox = (
    <div className={boxCls}>
      <BoxTitle title={t('feestjes.tips.title')} icon="muziek" />
      <Bullets items={t.raw('feestjes.tips.items') as string[]} />
      <Link href={briefjeHref + '?soort=feestje'} className={`${linkCls} border-t border-border pt-4`}>
        {t('feestjes.tips.briefjeCta')}
      </Link>
    </div>
  );

  const buitenParams = { weken: BUURTFEEST.meldenWeken, van: uur(BUURTFEEST.van, locale), tot: uur(BUURTFEEST.tot, locale), max: BUURTFEEST.maxBezoekers, db: BUURTFEEST.dbC };
  const buitenBox = (
    <div className={boxCls}>
      <BoxTitle title={t('feestjes.buiten.title')} icon="kalender" />
      <Para>{t('feestjes.buiten.intro', buitenParams)}</Para>
      <ul className="m-0 grid list-none gap-x-6 gap-y-2.5 p-0 md:grid-cols-2">
        {(t.raw('feestjes.buiten.items') as string[]).map((_, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-[1.45] text-text">
            <span aria-hidden className="font-bold text-primary">
              ✓
            </span>
            {t(`feestjes.buiten.items.${i}`, buitenParams)}
          </li>
        ))}
      </ul>
      <p className="m-0 border-t border-border pt-3 text-sm leading-[1.45] text-muted">{t('feestjes.buiten.zondag')}</p>
      <External href={LINKS.evenementMelden} note={note}>
        {t('feestjes.buiten.cta')}
      </External>
    </div>
  );

  // ---- Hoofdstuk 3: overlast ----
  const actie: Partial<Record<(typeof STAPPEN)[number], ReactNode>> = {
    beterBuren: (
      <span className="flex flex-wrap gap-x-4 gap-y-1">
        <External href={LINKS.beterBuren} note={note}>
          {t('overlast.beterBurenCta')}
        </External>
        <a href={TELEFOON.beterBuren.href} className={`${linkCls} whitespace-nowrap`}>
          {TELEFOON.beterBuren.label}
        </a>
      </span>
    ),
    meldpunt: (
      <span className="flex flex-wrap gap-x-4 gap-y-1">
        <External href={LINKS.meldpunt} note={note}>
          {t('overlast.meldpuntCta')}
        </External>
        <a href={TELEFOON.meldpunt.href} className={`${linkCls} whitespace-nowrap`}>
          {TELEFOON.meldpunt.label}
        </a>
      </span>
    ),
    bouw: (
      <External href={LINKS.melding} note={note}>
        {t('overlast.melden')}
      </External>
    ),
    horeca: (
      <External href={LINKS.horeca} note={note}>
        {t('overlast.horecaCta')}
      </External>
    ),
  };
  const stappenBox = (
    <div className={boxCls}>
      <BoxTitle title={t('overlast.stappenTitle')} />
      <ol className="m-0 flex list-none flex-col p-0">
        {STAPPEN.map((key, i) => (
          <li key={key} className="flex gap-4 border-t border-border py-3.5 first:border-t-0 first:pt-0">
            <span aria-hidden className="flex size-8 flex-none items-center justify-center rounded-full bg-text font-heading text-[15px] font-semibold text-background">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h4 className="m-0 text-[15px] leading-[1.35] font-semibold text-text">{t(`overlast.stappen.${key}.title`)}</h4>
              <p className="m-0 text-[15px] leading-[1.45] text-text">{t(`overlast.stappen.${key}.text`)}</p>
              {actie[key] && <div className="text-[15px]">{actie[key]}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );

  const belBox = (
    <div className="flex flex-col gap-3 rounded-lg bg-primary p-5 text-background xl:p-6">
      <h3 className="m-0 text-xl font-semibold">{t('overlast.bellen')}</h3>
      <dl className="m-0 flex flex-col gap-2 text-[15px] leading-[1.4]">
        {(
          [
            ['BeterBuren', TELEFOON.beterBuren],
            ['Meldpunt Zorg en Woonoverlast (24/7)', TELEFOON.meldpunt],
          ] as const
        ).map(([naam, tel]) => (
          <div key={naam} className="flex flex-wrap items-baseline justify-between gap-x-4">
            <dt>{naam}</dt>
            <dd className="m-0">
              <a href={tel.href} className={`${onPrimaryLink} font-heading text-lg`}>
                {tel.label}
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-background/40 pt-3">
        <h4 className="m-0 text-[15px] font-semibold">{t('overlast.nood.title')}</h4>
        <p className="mt-1 mb-0 text-[15px] leading-[1.5]">
          {tr.rich('overlast.nood.text', {
            politie: TELEFOON.politie.label,
            nood: TELEFOON.nood.label,
            politieLink: (chunks) => (
              <a href={TELEFOON.politie.href} className={onPrimaryLink}>
                {chunks}
              </a>
            ),
            noodLink: (chunks) => (
              <a href={TELEFOON.nood.href} className={onPrimaryLink}>
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  );

  const logboekBox = (
    <div className={boxCls}>
      <BoxTitle title={t('overlast.logboek.title')} icon="kalender" />
      <Para>{t('overlast.logboek.text')}</Para>
    </div>
  );

  // ---- Hoofdstuk 4: vooraf ----
  const vooraf = [
    { key: 'omgevingsalert', icon: 'bouwbord', href: LINKS.omgevingsalert },
    { key: 'nulmeting', icon: 'huis', href: LINKS.burenVerbouwen },
    { key: 'schade', icon: 'praten', href: LINKS.juridischLoket },
  ] as const satisfies readonly { key: string; icon: IconName; href: string }[];

  return (
    <>
      <ChapterNav variant="bar" chapters={chapters} sources={sourcesNav} labels={navLabels} />
      <main className="mx-auto w-full max-w-[1336px] px-6 pb-16 xl:pb-24">
        <section className="flex flex-col gap-8 pt-8 pb-10 xl:gap-14 xl:pt-20 xl:pb-16">
          <div className="flex flex-col gap-4 xl:gap-5">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('hero.eyebrow')}</div>
            <h1 className="m-0 text-[46px] leading-[1.02] font-bold tracking-[-0.02em] text-text xl:text-[84px]">{t('heading')}</h1>
            <p className="m-0 max-w-[720px] text-[19px] leading-[1.45] text-text xl:text-[22px]">{t('hero.lead')}</p>
            {(t.raw('hero.body') as string[]).map((p) => (
              <p key={p} className="m-0 max-w-[680px] text-[17px] leading-[1.5] text-text">
                {p}
              </p>
            ))}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <a
                href="#verbouwen"
                className="inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium text-text no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t('hero.start')} <span aria-hidden>↓</span>
              </a>
              <Link href={kaartHref} className={`${buttonCls} bg-primary text-on-primary hover:bg-primary-hover`}>
                {t('hero.card')} <span aria-hidden>→</span>
              </Link>
              <Link href={briefjeHref} className={`${buttonCls} border border-input-border bg-card text-text hover:bg-background`}>
                {t('hero.briefje')} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 border-t-2 border-b border-text xl:grid-cols-4 xl:gap-x-0">
            {(t.raw('kern') as { big: string; text: string }[]).map((_, i) => (
              <div key={i} className="flex min-w-0 flex-col gap-1 py-4 xl:py-5 xl:pr-5">
                <span className="font-heading text-[28px] leading-[1.05] font-semibold whitespace-nowrap text-text xl:text-[40px]">{t(`kern.${i}.big`, tijd)}</span>
                <span className="text-[15px] leading-[1.3] text-text">{t(`kern.${i}.text`)}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="xl:grid xl:grid-cols-[216px_minmax(0,1fr)] xl:items-start xl:gap-x-12">
          <ChapterNav variant="rail" chapters={chapters} sources={sourcesNav} labels={navLabels} />
          <div className="flex min-w-0 flex-col gap-16 xl:gap-28">
            {chapter(
              1,
              'verbouwen',
              <>
                <Pair>
                  {weekBox}
                  <Stack>
                    {adviesBox}
                    {klussenBox}
                  </Stack>
                </Pair>
                <Pair>
                  <Stack>
                    {burenBox}
                    {grenzenBox}
                  </Stack>
                  {ontheffingBox}
                </Pair>
              </>,
            )}
            {chapter(
              2,
              'feestjes',
              <>
                <Pair>
                  {thuisBox}
                  {tipsBox}
                </Pair>
                {buitenBox}
              </>,
            )}
            {chapter(
              3,
              'overlast',
              <Pair>
                {stappenBox}
                <Stack>
                  {belBox}
                  {logboekBox}
                </Stack>
              </Pair>,
            )}
            {chapter(
              4,
              'vooraf',
              <ul className="m-0 grid list-none gap-6 p-0 xl:grid-cols-3">
                {vooraf.map(({ key, icon, href }) => (
                  <li key={key} className={boxCls}>
                    <BoxTitle title={t(`vooraf.items.${key}.title`)} icon={icon} />
                    <Para>{t(`vooraf.items.${key}.text`)}</Para>
                    <External href={href} note={note}>
                      {t(`vooraf.items.${key}.cta`)}
                    </External>
                  </li>
                ))}
              </ul>,
            )}

            <section id="bronnen" aria-labelledby="bronnen-t" className="flex scroll-mt-26 flex-col gap-8">
              <div aria-hidden>
                <div className="border-t-2 border-text" />
                <div className="mt-[3px] border-t border-text" />
              </div>
              <h2 id="bronnen-t" className="m-0 text-[30px] leading-[1.1] font-semibold text-text xl:text-[44px]">
                {t('sources.title')}
              </h2>
              <p className="m-0 max-w-[720px] text-[15px] leading-[1.55] text-text">
                {t('sources.intro')} {t('sources.checked', { date: gecontroleerd })} <strong className="font-semibold">{t('sources.disclaimer')}</strong>
              </p>
              <dl className="m-0 grid gap-x-8 xl:grid-cols-[260px_minmax(0,1fr)]">
                {(t.raw('sources.rows') as { name: string; what: string; ref: string }[]).map((r) => (
                  <div key={r.name} className="contents">
                    <dt className="border-t border-border pt-2.5 text-sm font-semibold text-text xl:pb-2.5">{r.name}</dt>
                    <dd className="m-0 flex flex-col gap-0.5 pb-2.5 text-sm leading-[1.4] text-text xl:border-t xl:border-border xl:pt-2.5">
                      {r.what}
                      <span className="font-mono text-xs text-muted">{r.ref}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
