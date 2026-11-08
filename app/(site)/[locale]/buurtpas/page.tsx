import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { BuurtpasForm } from '@/components/buurtpas/BuurtpasForm';
import { formStrings } from '@/components/buurtpas/BuurtpasSlot';
import { beeindigBuurtpas, ideeenMetBuurtpas, nieuwsbriefMetBuurtpas, zegBuurtpasOp } from '@/components/buurtpas/actions';
import { buurtpasAdres, veiligTerugpad } from '@/lib/buurtpas/toegang';
import { krijgtIdeeen, krijgtNieuwsbrief } from '@/lib/buurtpas/nieuwsbrief';
import { getPayload } from 'payload';
import config from '@payload-config';
import { localizedHref } from '@/i18n/localizedHref';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'buurtpas' });
  return metDeelinfo(locale, { title: t('heading'), description: t('intro') });
}

export default async function BuurtpasRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ terug?: string; opgezegd?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'buurtpas' });
  // Komt de bezoeker van een afgeschermde knop, dan gaat hij na het activeren daarheen terug.
  const zoek = await searchParams;
  const terug = veiligTerugpad(zoek.terug, localizedHref(locale, '/buurtpas'));
  const hier = localizedHref(locale, '/buurtpas');
  const adres = await buurtpasAdres();
  const payload = adres ? await getPayload({ config }) : null;
  const nieuwsbrief = adres && payload ? await krijgtNieuwsbrief(payload, adres.email) : false;
  const ideeen = adres && payload && nieuwsbrief ? await krijgtIdeeen(payload, adres.email) : false;
  const knopCls =
    'inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary';

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="buurtpas">
        <SectionHead id="buurtpas" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />
        <ul className="mt-6 max-w-xl list-disc pl-5 leading-[1.6] text-text">
          <li>{t('punten.wat')}</li>
          <li>{t('punten.geenAccount')}</li>
          <li>{t('punten.apparaat')}</li>
        </ul>
        <div className={`${boxCls} mt-8 max-w-xl`}>
          {adres ? (
            <>
              <p className="m-0 font-medium text-primary">{t('actief', { email: adres.email })}</p>

              <form action={nieuwsbriefMetBuurtpas} className="flex flex-col gap-2 border-t border-border pt-4">
                <input type="hidden" name="terug" value={hier} />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="aan" value={nieuwsbrief ? 'nee' : 'ja'} />
                <p className="m-0 text-text">{nieuwsbrief ? t('beheer.nieuwsbriefAan') : t('beheer.nieuwsbriefUit')}</p>
                <button type="submit" className={knopCls}>
                  {nieuwsbrief ? t('beheer.nieuwsbriefAfmelden') : t('beheer.nieuwsbriefAanmelden')}
                </button>
              </form>

              {nieuwsbrief ? (
                <form action={ideeenMetBuurtpas} className="flex flex-col gap-2 border-t border-border pt-4">
                  <input type="hidden" name="terug" value={hier} />
                  <input type="hidden" name="aan" value={ideeen ? 'nee' : 'ja'} />
                  <p className="m-0 text-text">{ideeen ? t('beheer.ideeenAan') : t('beheer.ideeenUit')}</p>
                  <button type="submit" className={knopCls}>
                    {ideeen ? t('beheer.ideeenAfmelden') : t('beheer.ideeenAanmelden')}
                  </button>
                </form>
              ) : null}

              <form action={beeindigBuurtpas} className="flex flex-col gap-2 border-t border-border pt-4">
                <input type="hidden" name="terug" value={hier} />
                <p className="m-0 text-sm text-muted">{t('beheer.apparaatUitleg')}</p>
                <button type="submit" className={knopCls}>
                  {t('uitloggen')}
                </button>
              </form>

              <form action={zegBuurtpasOp} className="flex flex-col gap-2 border-t border-border pt-4">
                <input type="hidden" name="terug" value={hier} />
                <p className="m-0 text-sm text-muted">{t('beheer.opzeggenUitleg')}</p>
                <button type="submit" className={`${knopCls} text-accent`}>
                  {t('beheer.opzeggen')}
                </button>
              </form>
            </>
          ) : (
            <>
              {zoek.opgezegd ? (
                <p role="status" className="m-0 font-medium text-primary">
                  {t('beheer.opgezegd')}
                </p>
              ) : null}
              <BuurtpasForm locale={locale} terug={terug} strings={await formStrings(locale)} />
            </>
          )}
        </div>
        <p className="mt-4 mb-0 max-w-xl text-sm text-muted">{t('privacy')}</p>
      </Section>
    </main>
  );
}
