import { readFileSync, rmSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import type { PayloadWithAuth } from '@delmaredigital/payload-better-auth';
import type { betterAuthOptions } from '../src/lib/auth/config';
import { getClient } from './lib/payload-client';

// Lokale snelkoppeling: zorgt dat een test-admin bestaat, stuurt zichzelf een
// magic link (die lokaal — zonder RESEND_API_KEY — naar .dev-magic-link wordt
// weggeschreven i.p.v. gemaild, zie src/lib/auth/config.ts) en opent 'm meteen.
// Werkt alleen lokaal: in productie is RESEND_API_KEY altijd gezet, dus dat
// bestand wordt daar nooit geschreven.

const email = process.argv[2] ?? 'test@test.nl';
const name = process.argv[3] ?? 'Test Admin';
const linkFile = path.join(process.cwd(), '.dev-magic-link');
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

async function run() {
  try {
    // Next dev compileert routes just-in-time bij de eerste request — dat kan
    // een paar seconden duren, dus ruim de tijd nemen om geen valse melding
    // te geven terwijl de server wel degelijk draait.
    await fetch(serverURL, { signal: AbortSignal.timeout(10000) });
  } catch {
    console.error(
      `[dev-login] Kan ${serverURL} niet bereiken — start eerst \`bun dev\` in een apart terminalvenster en laat die draaien.`,
    );
    process.exit(1);
  }

  const payload = (await getClient()) as PayloadWithAuth<typeof betterAuthOptions>;

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs.length === 0) {
    // payload.create triggert de bestaande "uitnodiging"-hook (afterChange op
    // Users), die zelf al signInMagicLink aanroept — dat schrijft meteen
    // .dev-magic-link weg, dus daarna is er niets extra's nodig.
    const user = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email, name, role: 'admin' },
    });
    console.log(`[dev-login] nieuwe admin aangemaakt: ${user.email} (id ${user.id})`);
  } else {
    console.log(`[dev-login] bestaande gebruiker: ${email} — nieuwe inloglink aanvragen...`);
    await payload.betterAuth.api.signInMagicLink({
      body: { email, callbackURL: '/admin' },
      headers: new Headers(),
    });
  }

  let url: string;
  try {
    url = readFileSync(linkFile, 'utf-8').trim();
  } catch {
    console.error('[dev-login] geen .dev-magic-link gevonden — draait de dev-server, en is RESEND_API_KEY leeg?');
    process.exit(1);
  }
  rmSync(linkFile, { force: true });

  console.log(`[dev-login] inloglink: ${url}`);

  spawn('open', ['-a', 'Brave Browser', url], { stdio: 'ignore', detached: true }).unref();
  console.log('[dev-login] Brave wordt geopend...');

  process.exit(0);
}

run().catch((err) => {
  console.error('[dev-login] MISLUKT:', err);
  process.exit(1);
});
