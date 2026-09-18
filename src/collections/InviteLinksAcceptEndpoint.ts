import type { PayloadHandler } from 'payload';
import type { PayloadWithAuth } from '@delmaredigital/payload-better-auth';
import { betterAuthOptions } from '../lib/auth/config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const inviteLinksAcceptEndpoint: PayloadHandler = async (req) => {
  const body = (await req.json?.()) as { token?: string; email?: string } | undefined;
  const token = body?.token;
  const email = body?.email?.trim().toLowerCase();

  if (!token) {
    return Response.json({ message: 'Geen token opgegeven.' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ message: 'Vul een geldig e-mailadres in.' }, { status: 400 });
  }

  const { docs } = await req.payload.find({
    collection: 'invite-links',
    where: { token: { equals: token } },
    overrideAccess: true,
    limit: 1,
  });
  const invite = docs[0];

  if (!invite) {
    return Response.json({ message: 'Deze uitnodigingslink bestaat niet.' }, { status: 404 });
  }
  if (invite.status !== 'pending') {
    return Response.json({ message: 'Deze uitnodigingslink is al gebruikt.' }, { status: 410 });
  }
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return Response.json({ message: 'Deze uitnodigingslink is verlopen.' }, { status: 410 });
  }

  let user;
  try {
    user = await req.payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email, role: invite.role },
    });
  } catch {
    // Bestaat er al een gebruiker met dit e-mailadres, hergebruik die rij
    // i.p.v. te falen op de unique-constraint.
    const existing = await req.payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      overrideAccess: true,
      limit: 1,
    });
    user = existing.docs[0];
    if (!user) {
      return Response.json({ message: 'Aanmaken van je account is mislukt.' }, { status: 500 });
    }
  }

  await req.payload.update({
    collection: 'invite-links',
    id: invite.id,
    overrideAccess: true,
    data: {
      status: 'accepted',
      acceptedBy: user.id,
      acceptedAt: new Date().toISOString(),
    },
  });

  try {
    const payload = req.payload as PayloadWithAuth<typeof betterAuthOptions>;
    await payload.betterAuth.api.signInMagicLink({
      body: {
        email,
        callbackURL: '/admin',
        metadata: { invite: true },
      },
      headers: req.headers,
    });
  } catch (err) {
    req.payload.logger.error(`[invite-links] inloglink versturen mislukt voor ${email}: ${err}`);
  }

  return Response.json({ ok: true }, { status: 200 });
};
