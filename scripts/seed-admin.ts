import { getClient } from './lib/payload-client';

const email = process.argv[2] ?? 'test@test.nl';
const name = process.argv[3] ?? 'Test Admin';

async function run() {
  const payload = await getClient();

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`[seed-admin] gebruiker ${email} bestaat al (id ${existing.docs[0].id}) — niets gedaan.`);
    process.exit(0);
  }

  // Geen wachtwoord meer: inloggen gaat uitsluitend via magic link naar dit e-mailadres.
  const user = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email,
      name,
      role: 'admin',
    },
  });

  console.log(`[seed-admin] admin aangemaakt: ${user.email} (id ${user.id})`);
  console.log('[seed-admin] Inloggen kan alleen via magic link naar dit e-mailadres.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-admin] MISLUKT:', err);
  process.exit(1);
});
