import { getTranslations } from 'next-intl/server';
import { deelKaart, type DeelFoto } from './deelKaart';

type Locale = 'nl' | 'en';
type Params = { locale: string } | Promise<{ locale: string }>;

/**
 * Deelafbeelding van een vaste pagina (zie deelKaart.tsx), met de teksten uit messages/*.json:
 * standaard `heading` als titel en `metaDescription` als tekst, uit de namespace `ns`.
 */
export type PaginaKaart = {
  ns: string;
  /** Sleutel van de titel; standaard `heading`. */
  titel?: string;
  /** Sleutel van de tekst; standaard `metaDescription`. */
  tekst?: string;
  /** Sleutel van het label boven de titel. */
  label?: string;
  /** Sleutels van regels die groot onder de titel staan (de belangrijkste gegevens). */
  regels?: string[];
  /** Beeld links; zonder beeld de kaart van de buurt. Een functie voor een beeld per taal. */
  foto?: DeelFoto | ((locale: Locale) => DeelFoto);
};

// Next 15 geeft params als object, Next 16 als Promise; await werkt voor allebei.
export async function paginaAfbeelding(params: Params, kaart: PaginaKaart) {
  const { locale: ruw } = await params;
  const locale: Locale = ruw === 'en' ? 'en' : 'nl';
  const t = await getTranslations({ locale, namespace: kaart.ns });
  return deelKaart({
    label: kaart.label ? t(kaart.label) : undefined,
    title: t(kaart.titel ?? 'heading'),
    regels: kaart.regels?.map((sleutel) => t(sleutel)),
    tekst: t(kaart.tekst ?? 'metaDescription'),
    foto: typeof kaart.foto === 'function' ? kaart.foto(locale) : kaart.foto,
  });
}
