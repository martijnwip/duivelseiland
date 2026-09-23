import type { ReactNode } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getTranslations } from 'next-intl/server';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import type { AgendaRichFields } from '@/lib/agenda/richFields';
import { BuurtborrelForm } from './BuurtborrelForm';
import { Icon, WhatsAppIcon, type BuurtborrelIconName } from './icons';
import { PlantsoenKaart } from './PlantsoenKaart';

// Het Schoonmaak-nummer staat al bij het agenda-item (zie HomeDuivelseSchoonmaak).
const SCHOONMAAK_SLUG = 'duivelse-schoonmaak';

const EDITIES = [
  { key: 'winter', icon: 'vuurkorf' },
  { key: 'zomer', icon: 'zon' },
] as const satisfies readonly { key: string; icon: BuurtborrelIconName }[];

const IDEEEN = [
  { key: 'nieuwjaarstoast', icon: 'proost' },
  { key: 'picknick', icon: 'mand' },
  { key: 'paasbrunch', icon: 'ei' },
  { key: 'koningsdag', icon: 'kroon' },
  { key: 'ruilbeurs', icon: 'ruilen' },
  { key: 'jouwIdee', icon: 'idee' },
] as const satisfies readonly { key: string; icon: BuurtborrelIconName }[];

const DANK = ['wildschut', 'hendrik', 'bistrot', 'kerk', 'schoonmaakploeg', 'iedereen'] as const;

const boxCls = 'flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4 xl:p-6';

function SectionHead({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <>
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{eyebrow}</div>
        <h2 id={id} className="m-0 text-[28px] leading-[1.15] font-semibold text-text xl:text-[38px] xl:leading-[1.1]">
          {title}
        </h2>
        {intro ? <p className="m-0 max-w-[620px] text-lg leading-[1.45] text-text">{intro}</p> : null}
      </div>
    </>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      {children}
    </section>
  );
}

function WhatsAppButton({ href, label, context, note }: { href: string; label: string; context: string; note: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-cta px-5 py-2 font-medium text-on-cta no-underline transition-colors hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <WhatsAppIcon />
      {label}
      <span className="sr-only">
        {' '}
        {context} ({note})
      </span>
    </a>
  );
}

export async function BuurtborrelPage({ locale }: { locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'buurtborrel' });

  const payload = await getPayload({ config });
  const [instellingen, { docs: schoonmaakDocs }] = await Promise.all([
    payload.findGlobal({ slug: 'buurtborrel', depth: 0 }),
    payload.find({
      collection: 'agenda',
      where: { slug: { equals: SCHOONMAAK_SLUG }, status: { equals: 'published' } },
      depth: 0,
      limit: 1,
    }),
  ]);
  const schoonmaak = schoonmaakDocs[0] as ((typeof schoonmaakDocs)[number] & AgendaRichFields) | undefined;

  const burenAppHref = buildWhatsAppLink(instellingen.burenAppNummer, t('doeMee.burenApp.bericht'));
  const schoonmaakHref = buildWhatsAppLink(schoonmaak?.whatsappNumber, t('doeMee.schoonmaak.bericht'));
  const barryHref = buildWhatsAppLink(instellingen.barryNummer, t('dank.barry.bericht'));
  const nieuwVenster = t('nieuwVenster');

  const appgroepen = [
    { key: 'burenApp', icon: 'appgroep', href: burenAppHref },
    { key: 'schoonmaak', icon: 'bezem', href: schoonmaakHref },
  ] as const;

  return (
    <main>
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-12 xl:pt-14 xl:pb-16">
        <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-end xl:gap-12">
          <div className="flex flex-col gap-4">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('intro.eyebrow')}</div>
            <h1 className="m-0 text-4xl leading-[1.1] font-bold text-primary xl:text-5xl">{t('intro.title')}</h1>
            <p className="m-0 max-w-[620px] text-lg leading-[1.5] text-text">{t('intro.lead')}</p>
            <p className="m-0 max-w-[620px] text-lg leading-[1.5] text-text">{t('intro.doel')}</p>
          </div>
          <div className="flex items-baseline gap-4 border-t border-border pt-3 xl:flex-col xl:items-start xl:gap-1.5 xl:pt-4">
            <span className="font-heading text-4xl leading-none font-semibold text-primary xl:text-[48px]">2×</span>
            <span className="max-w-[280px] text-[15px] leading-[1.4] text-muted xl:text-base">{t('intro.factText')}</span>
          </div>
        </div>
      </header>

      <Section id="buurtborrel-terugblik">
        <SectionHead id="buurtborrel-terugblik" eyebrow={t('terugblik.eyebrow')} title={t('terugblik.title')} />
        <ol className="mt-8 grid list-none gap-4 p-0 md:grid-cols-2">
          {EDITIES.map(({ key, icon }) => (
            <li key={key} className={boxCls}>
              <div className="flex items-center gap-4">
                <span className="flex size-14 flex-none items-center justify-center rounded-full border border-border bg-background text-primary">
                  <Icon name={icon} className="size-9" />
                </span>
                <div>
                  <p className="m-0 text-sm font-medium text-muted">{t(`terugblik.${key}.wanneer`)}</p>
                  <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t(`terugblik.${key}.title`)}</h3>
                </div>
              </div>
              <p className="m-0 leading-[1.5] text-text">{t(`terugblik.${key}.text`)}</p>
            </li>
          ))}
        </ol>
        <figure className={`${boxCls} mt-4 mb-0`}>
          <PlantsoenKaart label={t('kaart.label')} />
          <figcaption className="text-sm leading-[1.4] text-muted">{t('kaart.bijschrift')}</figcaption>
        </figure>
        <p className="mt-6 mb-0 flex items-center gap-2 font-medium text-text">
          <Icon name="pijl" className="size-6 text-primary" />
          {t('terugblik.vervolg')}
        </p>
      </Section>

      <Section id="buurtborrel-ideeen">
        <SectionHead id="buurtborrel-ideeen" eyebrow={t('ideeen.eyebrow')} title={t('ideeen.title')} intro={t('ideeen.intro')} />
        <ul className="mt-8 flex list-none flex-wrap gap-3 p-0">
          {IDEEEN.map(({ key, icon }) => (
            <li
              key={key}
              className={`flex items-center gap-2.5 rounded-full border py-2 pr-4 pl-2.5 text-[15px] font-medium ${
                key === 'jouwIdee' ? 'border-dashed border-primary text-primary' : 'border-border bg-card text-text'
              }`}
            >
              <Icon name={icon} className="size-6 text-primary" />
              {t(`ideeen.items.${key}`)}
            </li>
          ))}
        </ul>
        <p className="mt-6 mb-0 font-heading text-xl text-text italic">{t('ideeen.motto')}</p>
      </Section>

      <Section id="buurtborrel-doe-mee">
        <SectionHead id="buurtborrel-doe-mee" eyebrow={t('doeMee.eyebrow')} title={t('doeMee.title')} intro={t('doeMee.intro')} />
        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className={boxCls}>
            <div>
              <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t('doeMee.lijst.title')}</h3>
              <p className="mt-1 mb-0 leading-[1.5] text-muted">{t('doeMee.lijst.text')}</p>
            </div>
            <BuurtborrelForm
              strings={{
                legend: t('form.legend'),
                aanmelden: t('form.aanmelden'),
                afmelden: t('form.afmelden'),
                emailLabel: t('form.emailLabel'),
                emailPlaceholder: t('form.emailPlaceholder'),
                berichtLabel: t('form.berichtLabel'),
                berichtHint: t('form.berichtHint'),
                submitAanmelden: t('form.submitAanmelden'),
                submitAfmelden: t('form.submitAfmelden'),
                submitting: t('form.submitting'),
                successAanmelden: t('form.successAanmelden'),
                successAfmelden: t('form.successAfmelden'),
                error: t('form.error'),
              }}
            />
          </div>

          <div className="flex flex-col gap-4">
            {appgroepen.map(({ key, icon, href }) => (
              <div key={key} className={boxCls}>
                <div className="flex items-start gap-4">
                  <Icon name={icon} className="size-10 flex-none text-primary" />
                  <div>
                    <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t(`doeMee.${key}.title`)}</h3>
                    <p className="mt-1 mb-0 leading-[1.5] text-muted">{t(`doeMee.${key}.text`)}</p>
                  </div>
                </div>
                {href ? (
                  <WhatsAppButton href={href} label={t(`doeMee.${key}.knop`)} context={t(`doeMee.${key}.title`)} note={nieuwVenster} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="buurtborrel-dank">
        <SectionHead id="buurtborrel-dank" eyebrow={t('dank.eyebrow')} title={t('dank.title')} />
        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <ul className="m-0 flex list-none flex-col p-0">
            {DANK.map((key) => (
              <li key={key} className="flex gap-3 border-b border-border py-3 first:pt-0 last:border-b-0">
                <Icon name="hart" className="mt-0.5 size-5 flex-none text-primary" />
                <p className="m-0 leading-[1.5] text-text">
                  {t.rich(`dank.items.${key}`, { b: (chunks) => <strong className="font-semibold">{chunks}</strong> })}
                </p>
              </li>
            ))}
          </ul>

          <div className={boxCls}>
            <div className="flex items-start gap-4">
              <Icon name="pan" className="size-10 flex-none text-primary" />
              <div>
                <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t('dank.barry.title')}</h3>
                <p className="mt-1 mb-0 leading-[1.5] text-muted">{t('dank.barry.text')}</p>
              </div>
            </div>
            {barryHref ? <WhatsAppButton href={barryHref} label={t('dank.barry.knop')} context={t('dank.barry.title')} note={nieuwVenster} /> : null}
          </div>
        </div>

        <p className="mt-10 mb-0 text-lg leading-[1.5] text-text">
          {t('afsluiting.groet')}
          <br />
          <span className="font-heading font-semibold text-primary">{t('afsluiting.namen')}</span>
        </p>
      </Section>
    </main>
  );
}
