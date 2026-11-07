import Image, { type StaticImageData } from 'next/image';
import { getTranslations } from 'next-intl/server';
import { boxCls, Section, SectionHead } from '@/components/site/Section';
import mimi1 from '../../../public/mascotte/mimi-1.jpg';
import mimi2 from '../../../public/mascotte/mimi-2.jpg';
import pizzeria from '../../../public/mascotte/pizzeria.jpg';

type Rij = { label: string; value: string };
type Stap = { title: string; text: string };

/** Foto als polaroid, licht scheef: de knipoog van de pagina. */
function Polaroid({ src, alt, tilt, caption, priority }: { src: StaticImageData; alt: string; tilt: string; caption?: string; priority?: boolean }) {
  return (
    <figure className={`m-0 rounded-sm border border-border bg-card p-3 pb-4 shadow-lg motion-safe:transition-transform motion-safe:hover:rotate-0 ${tilt}`}>
      <Image
        src={src}
        alt={alt}
        placeholder="blur"
        priority={priority}
        sizes="(min-width: 1280px) 420px, (min-width: 768px) 45vw, 100vw"
        className="h-auto w-full rounded-[2px]"
      />
      {caption ? <figcaption className="mt-3 text-center font-serif text-base text-muted italic">{caption}</figcaption> : null}
    </figure>
  );
}

export async function MascottePage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.mascotte' });
  const rijen = t.raw('paspoort.rows') as Rij[];
  const herken = t.raw('herken.text') as string[];
  const stappen = t.raw('doen.items') as Stap[];
  const quotes = t.raw('app.quotes') as string[];

  return (
    <main>
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-12 xl:pt-14 xl:pb-16">
        <div className="flex flex-col gap-10 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center md:gap-12">
          <div className="flex flex-col gap-4">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
            <h1 className="m-0 text-4xl leading-[1.1] font-bold text-text xl:text-5xl">{t('title')}</h1>
            <p className="m-0 max-w-[560px] text-lg leading-[1.5] text-text">{t('lead')}</p>
          </div>
          <div className="mx-auto w-full max-w-[420px] px-2">
            <Polaroid src={mimi1} alt={t('alt.hero')} tilt="rotate-2" caption="Mimi" priority />
          </div>
        </div>
      </header>

      <Section id="paspoort">
        <SectionHead id="paspoort" eyebrow="Mimi" title={t('paspoort.title')} />
        <div className="relative mt-8 max-w-[620px] rounded-lg border-2 border-dashed border-border bg-card p-5 pt-8 xl:p-7 xl:pt-9">
          <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[max-content_minmax(0,1fr)]">
            {rijen.map((r) => (
              <div key={r.label} className="contents">
                <dt className="text-sm font-semibold tracking-[0.04em] text-muted uppercase sm:pt-0.5">{r.label}</dt>
                <dd className="m-0 mb-2 text-[17px] leading-[1.4] text-text sm:mb-0">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p
            aria-hidden
            className="pointer-events-none absolute -top-4 right-3 m-0 rotate-6 rounded-md border-[3px] border-accent bg-card px-3 py-1 text-sm font-bold tracking-[0.08em] text-accent uppercase sm:right-6"
          >
            {t('paspoort.stempel')}
          </p>
          <p className="sr-only">{t('paspoort.stempel')}</p>
        </div>
      </Section>

      <Section id="herken">
        <SectionHead id="herken" eyebrow="Mimi" title={t('herken.title')} />
        <div className="mt-8 flex flex-col gap-10 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center md:gap-12">
          <div className="mx-auto w-full max-w-[380px] px-2">
            <Polaroid src={mimi2} alt={t('alt.tweede')} tilt="-rotate-2" caption={t('herken.caption')} />
          </div>
          <div className="flex flex-col gap-4">
            {herken.map((p) => (
              <p key={p} className="m-0 text-lg leading-[1.5] text-text">
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section id="doen">
        <SectionHead id="doen" eyebrow="Mimi" title={t('doen.title')} />
        <ol className="mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {stappen.map((s, i) => (
            <li key={s.title} className={boxCls}>
              <div className="flex items-start gap-3">
                <span aria-hidden className="flex size-9 flex-none items-center justify-center rounded-full bg-primary text-base font-bold text-on-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="m-0 text-[17px] leading-[1.3] font-semibold text-text">{s.title}</h3>
                  <p className="mt-1 mb-0 text-[15px] leading-[1.45] text-text">{s.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="buurtapp">
        <SectionHead id="buurtapp" eyebrow="WhatsApp" title={t('app.title')} intro={t('app.intro')} />
        <ul className="mt-8 flex max-w-[620px] list-none flex-col gap-3 p-0">
          {quotes.map((q, i) => (
            <li
              key={q}
              className={`max-w-[85%] rounded-2xl border border-border px-4 py-3 text-[15px] leading-[1.45] text-text ${
                i % 2 === 0 ? 'self-start rounded-bl-sm bg-card' : 'self-end rounded-br-sm bg-primary-soft'
              }`}
            >
              <blockquote className="m-0">{q}</blockquote>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="thuis">
        <SectionHead id="thuis" eyebrow="Hobbemakade" title={t('thuis.title')} />
        <div className="mt-8 flex flex-col gap-10 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center md:gap-12">
          <p className="m-0 max-w-[560px] text-lg leading-[1.5] text-text">{t('thuis.text')}</p>
          <div className="mx-auto w-full max-w-[420px] px-2">
            <Polaroid src={pizzeria} alt={t('alt.pizzeria')} tilt="rotate-1" caption={t('thuis.caption')} />
            <p className="mt-3 mb-0 text-center text-xs text-muted">{t('thuis.bron')}</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
