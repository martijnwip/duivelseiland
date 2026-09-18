import type { CollectionAfterChangeHook, CollectionConfig } from 'payload';
import { APIError } from 'payload';
import type { PayloadWithAuth } from '@delmaredigital/payload-better-auth';
import { betterAuthStrategy } from '@delmaredigital/payload-better-auth';
import { isAdmin, isAdminField } from '../access/isAdmin';
import { betterAuthOptions } from '../lib/auth/config';

const sendInviteEmail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return;

  const payload = req.payload as PayloadWithAuth<typeof betterAuthOptions>;

  try {
    await payload.betterAuth.api.signInMagicLink({
      body: {
        email: doc.email,
        callbackURL: '/admin',
        metadata: { invite: true },
      },
      headers: req.headers,
    });
  } catch (err) {
    req.payload.logger.error(`[users] uitnodigingsmail versturen mislukt voor ${doc.email}: ${err}`);
  }
};

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [betterAuthStrategy()],
  },
  access: {
    // Alleen een admin maakt nieuwe gebruikers aan (zie PROJECT.md, rol Admin).
    // Nodig omdat firstUserAdmin uitstaat: de plugin forceert de rol dan niet
    // zelf meer op de create-request, dus dit moet hier expliciet dicht.
    create: isAdmin,
  },
  hooks: {
    afterChange: [sendInviteEmail],
    beforeDelete: [
      async ({ req, id }) => {
        const doc = await req.payload.findByID({ collection: 'users', id, req });
        if (doc.role !== 'admin') return;

        const { totalDocs } = await req.payload.count({
          collection: 'users',
          where: { role: { equals: 'admin' } },
          req,
        });

        if (totalDocs <= 1) {
          throw new APIError('Kan de laatste admin niet verwijderen.', 400, null, true);
        }
      },
    ],
  },
  fields: [
    {
      // Vereist door better-auth's kern-gebruikersschema. Bewust niet required:
      // bestaande gebruikersrijen hebben er nog geen waarde voor.
      name: 'name',
      type: 'text',
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'redacteur', 'auteur'],
      defaultValue: 'auteur',
      required: true,
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      validate: (value: unknown, { req, id, previousValue }: any) => {
        const isOwnAccount = id !== undefined && req.user && String(id) === String(req.user.id);
        if (isOwnAccount && previousValue === 'admin' && value !== 'admin') {
          return 'Je kunt je eigen rol niet verlagen vanaf admin.';
        }
        return true;
      },
    },
  ],
};
