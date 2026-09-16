import { getClient } from './lib/payload-client';

const email = process.argv[2] ?? 'test@test.nl';
const password = process.argv[3] ?? 'test';

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

  const user = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email,
      password,
      role: 'admin',
    },
  });

  console.log(`[seed-admin] admin aangemaakt: ${user.email} (id ${user.id})`);
  console.log('[seed-admin] LET OP: dit is een zwak testwachtwoord, alleen bedoeld voor lokale ontwikkeling.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-admin] MISLUKT:', err);
  process.exit(1);
});
