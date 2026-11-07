import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import { revalidatePath } from 'next/cache';

/**
 * Contentitems (Nieuws, Agenda, ...) staan op hun lijst- en detailpagina, op de homepagina (Duivelse Schoonmaak),
 * in de nieuwsbrief-voorbeelden en in de sitemap. De pagina's zijn statisch (ISR), dus bij een wijziging aan iets
 * openbaars de hele site opnieuw valideren, net als revalidateSite. Dat is goedkoop: een pagina wordt pas bij het
 * volgende bezoek opnieuw gemaakt. Concepten die nooit gepubliceerd waren, raken de site niet.
 * Buiten een Next.js-request (seeds, scripts) is er niets te valideren.
 */
function revalidateAlles() {
  try {
    revalidatePath('/', 'layout');
  } catch {
    // Geen actieve Next.js-request context.
  }
}

export const revalidateContentAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (req.context?.disableRevalidate) return doc;
  if (doc?.status === 'published' || previousDoc?.status === 'published') revalidateAlles();
  return doc;
};

export const revalidateContentAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc;
  if (doc?.status === 'published') revalidateAlles();
  return doc;
};
