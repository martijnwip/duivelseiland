import type { Payload, PayloadRequest } from 'payload';
import { ACTIEVE_FASES } from './constants';

type Localized<T> = Partial<Record<'nl' | 'en', T>>;
const idVan = (value: unknown): number | null =>
  value == null ? null : typeof value === 'object' ? ((value as { id?: number }).id ?? null) : (value as number);

/**
 * Houdt het agenda-item van een activiteit gelijk (docs/brief-activiteiten.md, flow 7). Goedgekeurd of
 * gaat door: gepubliceerd op de agenda (bij goedgekeurd met "nog niet definitief" op de site), met titel,
 * omschrijving, afbeelding en datum van de activiteit. Andere fasen: terug naar concept. Afgelopen: niets,
 * de datum ligt dan in het verleden. Zonder datum staat het item wel klaar, maar niet in de agendalijst.
 */
export async function synchroniseerAgenda(payload: Payload, activiteitId: number, req?: PayloadRequest) {
  const doc = await payload.findByID({ collection: 'activiteiten', id: activiteitId, locale: 'all', depth: 0, overrideAccess: true, req });
  const agendaId = idVan(doc.agendaItem);

  if (!ACTIEVE_FASES.includes(doc.fase)) {
    if (agendaId && doc.fase !== 'afgelopen') {
      await payload.update({ collection: 'agenda', id: agendaId, data: { status: 'draft' }, overrideAccess: true, req });
    }
    return;
  }

  const title = doc.title as unknown as Localized<string>;
  const content = doc.content as unknown as Localized<unknown>;
  const gedeeld = {
    status: 'published' as const,
    date: doc.datum ?? null,
    image: idVan(doc.image),
    activiteit: doc.id,
  };
  const nl = { title: title.nl || title.en || 'Activiteit', content: (content.nl ?? null) as never };

  let id = agendaId;
  if (id) {
    const bestaat = await payload.findByID({ collection: 'agenda', id, depth: 0, disableErrors: true, overrideAccess: true, req });
    if (!bestaat) id = null;
  }

  if (!id) {
    let slug = doc.slug;
    const { totalDocs } = await payload.count({ collection: 'agenda', where: { slug: { equals: slug } }, req });
    if (totalDocs > 0) slug = `${slug}-${doc.id}`;
    const agenda = await payload.create({
      collection: 'agenda',
      locale: 'nl',
      overrideAccess: true,
      data: { ...gedeeld, ...nl, slug, generateSlug: false },
      req,
    });
    id = agenda.id;
    // `context` wordt op de gedeelde req gezet; daarna terugzetten, anders slaan latere wijzigingen in
    // hetzelfde request de workflow ook over.
    const vorige = req?.context.skipWorkflow;
    await payload.update({
      collection: 'activiteiten',
      id: doc.id,
      data: { agendaItem: id },
      overrideAccess: true,
      context: { skipWorkflow: true },
      req,
    });
    if (req) req.context.skipWorkflow = vorige;
  } else {
    await payload.update({ collection: 'agenda', id, locale: 'nl', data: { ...gedeeld, ...nl }, overrideAccess: true, req });
  }

  if (title.en || content.en) {
    await payload.update({
      collection: 'agenda',
      id,
      locale: 'en',
      overrideAccess: true,
      data: { ...(title.en ? { title: title.en } : {}), ...(content.en ? { content: content.en as never } : {}) },
      req,
    });
  }
}
