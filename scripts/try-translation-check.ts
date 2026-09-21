import { judgeTranslation } from '../src/lib/translate-live/verify';

// Handgelabeld: `good` = de vertaling is bruikbaar. `keep` = fragment hoort onvertaald te blijven.
const cases: { nl: string; en: string; good: boolean; keep: boolean }[] = [
  { nl: 'Dit weekend is er een ', en: 'There is a TV, radio and CD-player.', good: false, keep: false }, // bekende MyMemory-misser
  { nl: 'Dit weekend is er een buurtborrel op het plein.', en: 'This weekend there is a neighbourhood drink on the square.', good: true, keep: false },
  { nl: 'De vergadering is verplaatst naar donderdag.', en: 'The meeting has been moved to Thursday.', good: true, keep: false },
  { nl: 'De vergadering is verplaatst naar donderdag.', en: 'De vergadering is verplaatst naar donderdag.', good: false, keep: false },
  { nl: 'Nieuwe Prinsengracht 12', en: 'Nieuwe Prinsengracht 12', good: true, keep: true },
  { nl: 'Duivelseiland', en: 'Devil’s Island', good: true, keep: true },
  { nl: 'Bewoners kunnen tot 1 oktober bezwaar maken.', en: 'Residents can object until 1 December.', good: false, keep: false },
];

if (!process.env.TYPESAFE_API_KEY) {
  console.error('Zet TYPESAFE_API_KEY (bijv. `TYPESAFE_API_KEY=... bun run scripts/try-translation-check.ts`).');
  process.exit(1);
}

let wrong = 0;
for (const c of cases) {
  const j = await judgeTranslation(c.nl, c.en);
  if (!j) {
    console.log('FOUT  ', c.nl);
    continue;
  }
  const okFaithful = j.faithful >= 0.5 === c.good;
  const okKeep = j.keepAsIs >= 0.5 === c.keep;
  if (!okFaithful || !okKeep) wrong++;
  console.log(
    `${okFaithful && okKeep ? 'ok    ' : 'AFWIJKT'} faithful=${j.faithful.toFixed(2)} (want ${c.good}) keepAsIs=${j.keepAsIs.toFixed(2)} (want ${c.keep})  "${c.nl}" -> "${c.en}"`,
  );
}
console.log(`\n${cases.length - wrong}/${cases.length} volgens verwachting`);
