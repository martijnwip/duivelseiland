import type { GeschiedenisVerhaal } from '../../../payload-types';
import { RichTextContent } from '@/components/site/RichTextContent';
import { ArchiefBeeld, alsFoto, type ArchiefLabels } from './ArchiefBeeld';
import { TijdlijnIcoon } from './icons';

export type TijdvakData = NonNullable<GeschiedenisVerhaal['tijdvakken']>[number];

const BAND: Record<NonNullable<TijdvakData['kleur']>, string> = {
  grijs: 'var(--color-muted-soft)',
  rood: 'var(--color-accent-soft)',
  blauw: 'var(--color-secondary-soft)',
  groen: 'var(--color-primary-soft)',
};

/** Een tijdvak: kop op de as, lopende tekst, de gebeurtenissen als knopen, foto's en een kader. */
export function Tijdvak({ tijdvak, labels }: { tijdvak: TijdvakData; labels: ArchiefLabels }) {
  const gebeurtenissen = tijdvak.gebeurtenissen ?? [];
  const fotos = (tijdvak.fotos ?? []).map(alsFoto).filter((f) => f !== null);
  let kant = 0;

  return (
    <section
      id={tijdvak.anker}
      aria-labelledby={`${tijdvak.anker}-t`}
      className="scroll-mt-24 pt-6 pb-2"
      style={{ '--gs-band': BAND[tijdvak.kleur ?? 'groen'] } as React.CSSProperties}
    >
      <div className="gs-kop mb-6 lg:mx-auto lg:mb-10 lg:max-w-[720px]">
        <span className="inline-block rounded-full bg-[var(--gs-band)] px-2.5 py-0.5 font-heading text-sm font-semibold text-text tabular-nums">
          {tijdvak.band}
        </span>
        <h2 id={`${tijdvak.anker}-t`} className="mt-2 mb-1.5 text-[28px] leading-[1.12] font-semibold text-text lg:text-[40px]">
          {tijdvak.titel}
        </h2>
        {tijdvak.kernzin ? <p className="mb-3 text-xl leading-snug font-semibold text-primary">{tijdvak.kernzin}</p> : null}
        {tijdvak.tekst ? <RichTextContent data={tijdvak.tekst} className="max-w-[62ch] text-lg lg:mx-auto lg:text-left" /> : null}
      </div>

      {gebeurtenissen.length > 0 ? (
        <ol className="gs-as">
          {gebeurtenissen.flatMap((g) => {
            const foto = alsFoto(g.foto);
            const zijde = kant++ % 2 === 0 ? 'gs-links' : 'gs-rechts';
            const items = [];
            if (g.breukLabel) {
              items.push(
                <li key={`${g.id}-breuk`} className="gs-breuk" aria-hidden>
                  <span className="text-sm text-muted italic">{g.breukLabel}</span>
                </li>,
              );
            }
            items.push(
              <li key={g.id} className={zijde} data-jaar={g.jaar ?? tijdvak.band}>
                <span className="gs-knoop">
                  <TijdlijnIcoon naam={g.icoon} />
                </span>
                <time
                  dateTime={g.jaar ? String(g.jaar) : undefined}
                  className="block pt-1.5 font-heading text-[15px] font-semibold text-primary tabular-nums"
                >
                  {g.datum}
                </time>
                <h3 className="mt-0.5 mb-1 text-[19px] leading-snug font-semibold text-text">{g.titel}</h3>
                {g.tekst ? <p className="m-0 max-w-[52ch] text-[17px] leading-normal text-text lg:[.gs-links_&]:ml-auto">{g.tekst}</p> : null}
                {foto ? <ArchiefBeeld foto={foto} labels={labels} className="mt-3 max-w-[420px] lg:[.gs-links_&]:ml-auto" /> : null}
              </li>,
            );
            return items;
          })}
        </ol>
      ) : null}

      {fotos.length > 0 ? (
        <div className="mb-8 ml-14 grid gap-3 sm:grid-cols-2 lg:mx-auto lg:mb-12 lg:max-w-[880px]">
          {fotos.map((foto) => (
            <ArchiefBeeld key={foto.id} foto={foto} labels={labels} />
          ))}
        </div>
      ) : null}

      {tijdvak.kader?.titel || tijdvak.kader?.tekst ? (
        <aside className="mt-2 mb-8 ml-14 max-w-[640px] rounded border border-l-4 border-border border-l-accent bg-card p-5 lg:mx-auto lg:mb-12">
          {tijdvak.kader.titel ? <h3 className="mb-2 text-xl font-semibold text-text">{tijdvak.kader.titel}</h3> : null}
          {tijdvak.kader.tekst ? <p className="m-0 text-[17px] text-text">{tijdvak.kader.tekst}</p> : null}
        </aside>
      ) : null}
    </section>
  );
}
