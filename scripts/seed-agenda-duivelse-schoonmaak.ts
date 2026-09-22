/**
 * Zet (of werkt bij) het terugkerende agenda-item "Duivelse Schoonmaak" —
 * eerste zondag van de maand, gebaseerd op de omschrijving van de
 * WhatsApp-groep. Idempotent: bestaat de slug al, dan wordt die update,
 * anders wordt hij aangemaakt. Zet hem als draft neer zodat hij eerst in
 * /admin te reviewen is (tekst, evt. WhatsApp-link) voor publicatie —
 * zelfde aanpak als scripts/seed-hero-slides.ts.
 *
 * Run: bun run scripts/seed-agenda-duivelse-schoonmaak.ts
 *
 * Vereist dat de nieuwe velden (intro/schedule/ctaLabel/ctaUrl) al in de
 * database staan — dus eerst `bun run payload migrate` (na
 * `generate:types` + `migrate:create`, zie src/collections/Agenda.ts).
 */
import { getClient } from './lib/payload-client';

const slug = 'duivelse-schoonmaak';

// De WhatsApp-groepsomschrijving noemt geen link — vul die hieronder in
// zodra je hem hebt, of laat leeg om de knop voorlopig te verbergen.
const ctaUrl = '';

async function run() {
  const payload = await getClient();

  const data = {
    title: 'Duivelse Schoonmaak',
    slug,
    status: 'draft' as const,
    recurrence: 'monthly-first-sunday' as const,
    recurrenceTime: '12:30',
    intro:
      'Elke eerste zondag van de maand ruimen buurtgenoten samen het zwerfafval op Duivelseiland op — daarna is er nog tijd voor een kopje koffie.',
    schedule: [
      {
        time: '12:30',
        icon: 'meeting' as const,
        title: 'Verzamelen bij de kerk',
        description: 'We spreken af bij de kerk voordat we aan de slag gaan.',
      },
      {
        icon: 'cleanup' as const,
        title: 'Zwerfafval opruimen',
        description: 'Met z’n allen Duivelseiland zwerfafvalvrij maken.',
      },
      {
        time: '14:00',
        icon: 'coffee' as const,
        title: 'Koffie bij de Spar',
        description: 'Daarna is er nog tijd voor een gezellig kopje koffie bij de Spar.',
      },
    ],
    ctaLabel: ctaUrl ? 'Doe mee via de WhatsApp-groep' : undefined,
    ctaUrl: ctaUrl || undefined,
  };

  const existing = await payload.find({
    collection: 'agenda',
    where: { slug: { equals: slug } },
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs.length > 0) {
    const doc = existing.docs[0];
    await payload.update({
      collection: 'agenda',
      id: doc.id,
      overrideAccess: true,
      data,
    });
    console.log(`[seed-agenda-duivelse-schoonmaak] bijgewerkt: agenda #${doc.id} (${slug}).`);
  } else {
    const doc = await payload.create({
      collection: 'agenda',
      overrideAccess: true,
      data,
    });
    console.log(`[seed-agenda-duivelse-schoonmaak] aangemaakt: agenda #${doc.id} (${slug}).`);
  }

  if (!ctaUrl) {
    console.log('[seed-agenda-duivelse-schoonmaak] Let op: geen WhatsApp-link ingevuld — de knop blijft verborgen tot je die toevoegt (in dit script of in /admin).');
  }
  console.log('[seed-agenda-duivelse-schoonmaak] Staat als draft — controleer en publiceer in /admin.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-agenda-duivelse-schoonmaak] MISLUKT:', err);
  process.exit(1);
});
