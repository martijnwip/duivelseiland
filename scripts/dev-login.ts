import { readFileSync, rmSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import type { PayloadWithAuth } from '@delmaredigital/payload-better-auth';
import type { Role } from '../src/access/roles';
import type { betterAuthOptions } from '../src/lib/auth/config';
import { getClient } from './lib/payload-client';

// Lokale snelkoppeling: zorgt dat een test-admin bestaat, maakt een magic link
// aan en opent die in de standaardbrowser, zodat je meteen ingelogd bent op de
// lokale dev-server. Er wordt nooit gemaild.
//
//   bun dev:login [e-mail] [naam] [--rol admin|redacteur|auteur|organisator]
//
// Zonder --rol wordt een nieuwe gebruiker admin en houdt een bestaande zijn rol;
// met --rol krijgt ook een bestaande gebruiker die rol.
//
// De link wordt in dit proces aangemaakt (sendMagicLink in src/lib/auth/config.ts).
// Zonder RESEND_API_KEY schrijft die 'm naar .dev-magic-link in plaats van te mailen;
// bun laadt .env.local automatisch, dus de key hier altijd weghalen. De draaiende
// dev-server merkt daar niets van.
delete process.env.RESEND_API_KEY;

const ROLLEN: Role[] = ['admin', 'redacteur', 'auteur', 'organisator'];

// --rol x of --rol=x; de overige argumenten zijn e-mail en naam.
const args = process.argv.slice(2);
let rol: Role | undefined;
const positioneel: string[] = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  const waarde = arg === '--rol' ? args[++i] : arg.startsWith('--rol=') ? arg.slice('--rol='.length) : null;
  if (waarde === null) {
    positioneel.push(arg);
  } else if (ROLLEN.includes(waarde as Role)) {
    rol = waarde as Role;
  } else {
    console.error(`[dev-login] onbekende rol "${waarde ?? ''}" — kies uit: ${ROLLEN.join(', ')}`);
    process.exit(1);
  }
}

const email = positioneel[0] ?? 'test@test.nl';
const name = positioneel[1] ?? `Test ${rol ?? 'admin'}`;
const linkFile = path.join(process.cwd(), '.dev-magic-link');
// Altijd de lokale dev-server: NEXT_PUBLIC_SERVER_URL in .env.local kan het productiedomein zijn.
const serverURL = process.env.DEV_SERVER_URL || 'http://localhost:3000';

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
      data: { email, name, role: rol ?? 'admin' },
    });
    console.log(`[dev-login] nieuwe ${user.role} aangemaakt: ${user.email} (id ${user.id})`);
  } else {
    const bestaand = existing.docs[0];
    if (rol && bestaand.role !== rol) {
      await payload.update({ collection: 'users', id: bestaand.id, data: { role: rol }, overrideAccess: true });
      console.log(`[dev-login] rol van ${email}: ${bestaand.role} → ${rol}`);
    }
    console.log(`[dev-login] bestaande gebruiker: ${email} (${rol ?? bestaand.role}) — nieuwe inloglink aanvragen...`);
    await payload.betterAuth.api.signInMagicLink({
      body: { email, callbackURL: '/admin' },
      headers: new Headers(),
    });
  }

  let url: string;
  try {
    url = readFileSync(linkFile, 'utf-8').trim();
  } catch {
    console.error('[dev-login] geen .dev-magic-link gevonden — is de inloglink wel aangemaakt?');
    process.exit(1);
  }
  rmSync(linkFile, { force: true });
  // De link krijgt de serverURL uit payload.config (NEXT_PUBLIC_SERVER_URL); het token staat in de
  // lokale database, dus de link moet naar de lokale dev-server wijzen.
  const local = new URL(serverURL);
  const link = new URL(url);
  link.protocol = local.protocol;
  link.host = local.host;
  url = link.toString();

  console.log(`[dev-login] inloglink: ${url}`);

  // Standaardbrowser: opent als tab in een browser die al draait.
  const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
  spawn(opener, [url], { stdio: 'ignore', detached: true })
    .on('error', () => console.log('[dev-login] kon geen browser openen — plak de link hierboven zelf.'))
    .unref();
  console.log('[dev-login] browser wordt geopend...');

  process.exit(0);
}

run().catch((err) => {
  console.error('[dev-login] MISLUKT:', err);
  process.exit(1);
});
