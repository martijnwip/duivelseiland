import { getTranslations } from 'next-intl/server';
import { makeFormatters } from '@/lib/stats/format';
import { ChapterNav } from './ChapterNav';
import { Chapter, Pair, Stack } from './Chapter';
import { Hero } from './Hero';
import { MoreCijfers } from './MoreCijfers';
import { Sources } from './Sources';
import type { Ctx, T } from './cards/card';
import { peopleCards } from './cards/people';
import { housingCards } from './cards/housing';
import { moneyCards } from './cards/money';
import { mobilityCards } from './cards/mobility';
import { safetyHealthCards } from './cards/safetyHealth';
import { placesCards } from './cards/places';

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Nederlandse maandafkortingen die in het Engels anders zijn.
const MONTHS_EN: Record<string, string> = { mrt: 'Mar', mei: 'May', okt: 'Oct' };

export async function StatsPage({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'pages.buurtStatistieken' })) as unknown as T;

  const ctx: Ctx = {
    locale,
    f: makeFormatters(locale),
    t,
    tl: (label) => {
      const key = `labels.${slug(label)}`;
      return t.has(key) ? t(key) : label;
    },
    period: (jaar) => {
      const s = String(jaar);
      return locale === 'en' ? s.replace(/\b(mrt|mei|okt)\b/g, (m) => MONTHS_EN[m]) : s;
    },
  };

  const C: Record<string, React.ReactNode> = {
    ...peopleCards(ctx),
    ...housingCards(ctx),
    ...moneyCards(ctx),
    ...mobilityCards(ctx),
    ...safetyHealthCards(ctx),
    ...placesCards(ctx),
  };

  const chapterIds = ['mensen', 'wonen', 'werk', 'mobiliteit', 'veiligheid', 'gezondheid', 'voorzieningen', 'vergelijking'];
  const chapters = chapterIds.map((id) => ({ id, name: t(`chapters.${id}.name`) }));

  const chapter = (n: number, id: string, children: React.ReactNode) => (
    <Chapter
      n={n}
      id={id}
      label={t('ui.chapterLabel')}
      title={t(`chapters.${id}.name`)}
      message={t(`chapters.${id}.message`)}
      factBig={t(`chapters.${id}.factBig`)}
      factText={t(`chapters.${id}.factText`)}
    >
      {children}
    </Chapter>
  );
  const more = (id: string, count: number, open: boolean | 'desktop', children: React.ReactNode) => (
    <MoreCijfers title={t('ui.more', { n: count })} list={t(`chapters.${id}.more`)} open={open}>
      {children}
    </MoreCijfers>
  );

  const navLabels = { nav: t('nav.nav'), contents: t('nav.contents'), chapterOf: t('nav.chapterOf', { n: '{n}', total: '{total}' }) };
  const sourcesNav = { id: 'bronnen', name: t('nav.sources') };

  return (
    <>
      <ChapterNav variant="bar" chapters={chapters} sources={sourcesNav} labels={navLabels} />
      <main className="mx-auto w-full max-w-[1336px] px-6 pb-16 xl:pb-24">
        <Hero ctx={ctx} />
        <div className="xl:grid xl:grid-cols-[216px_minmax(0,1fr)] xl:items-start xl:gap-x-12">
          <ChapterNav variant="rail" chapters={chapters} sources={sourcesNav} labels={navLabels} />
          <div className="flex min-w-0 flex-col gap-16 xl:gap-28">
            {chapter(
              1,
              'mensen',
              <>
                {C.herkomst}
                <Pair>
                  {C.leeftijd}
                  {C.huishoudens}
                </Pair>
                {C.inwoners}
                {more(
                  'mensen',
                  4,
                  'desktop',
                  <>
                    <Pair>
                      {C.geslacht}
                      {C.burgerlijk}
                    </Pair>
                    {C.geboorte}
                    {C.sankey}
                  </>,
                )}
              </>,
            )}
            {chapter(
              2,
              'wonen',
              <>
                {C.woz}
                <Pair>
                  {C.eigendom}
                  {C.bouw}
                </Pair>
                <Pair>
                  {C.energie}
                  {C.verbruik}
                </Pair>
                {more(
                  'wonen',
                  3,
                  false,
                  <>
                    <Pair>
                      {C.woningtype}
                      {C.bewoning}
                    </Pair>
                    {C.gebruiksdoelen}
                  </>,
                )}
              </>,
            )}
            {chapter(
              3,
              'werk',
              <>
                {C.inkomen}
                <Pair>
                  {C.ikvergelijk}
                  {C.bedrijven}
                </Pair>
                {more(
                  'werk',
                  2,
                  false,
                  <Pair>
                    {C.arbeid}
                    {C.uitkeringen}
                  </Pair>,
                )}
              </>,
            )}
            {chapter(
              4,
              'mobiliteit',
              <>
                <Pair>
                  <Stack>
                    {C.voertuigen}
                    {C.autohh}
                  </Stack>
                  {C.elektrisch}
                </Pair>
                <Pair>
                  {C.ongevallen}
                  {C.dichtheid}
                </Pair>
              </>,
            )}
            {chapter(
              5,
              'veiligheid',
              <>
                <Pair>
                  {C.misdaadjaren}
                  {C.misdaadsoorten}
                </Pair>
                {more('veiligheid', 1, false, C.misdaad1000)}
              </>,
            )}
            {chapter(
              6,
              'gezondheid',
              <>
                <Pair>
                  {C.tevreden}
                  {C.leefstijl}
                </Pair>
                <Pair>
                  {C.gezondheid}
                  {C.welzijn}
                </Pair>
                {more(
                  'gezondheid',
                  2,
                  false,
                  <Pair>
                    {C.alcohol}
                    {C.geluid}
                  </Pair>,
                )}
              </>,
            )}
            {chapter(
              7,
              'voorzieningen',
              <>
                {C.voorzieningen}
                <Pair>
                  {C.school}
                  {C.bereik}
                </Pair>
                {more(
                  'voorzieningen',
                  2,
                  false,
                  <Pair>
                    {C.leerlingen}
                    {C.opleiding}
                  </Pair>,
                )}
              </>,
            )}
            {chapter(
              8,
              'vergelijking',
              <>
                {C.onderscheid}
                <Pair>
                  {C.verkiezingen}
                  {more('vergelijking', 1, true, C.scatter)}
                </Pair>
              </>,
            )}
            <Sources ctx={ctx} />
          </div>
        </div>
      </main>
    </>
  );
}
