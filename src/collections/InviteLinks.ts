import type { CollectionConfig } from 'payload';
import crypto from 'crypto';
import { isAdmin } from '../access/isAdmin';
import { setAuthor } from './shared/setAuthor';
import { inviteLinksAcceptEndpoint } from './InviteLinksAcceptEndpoint';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const InviteLinks: CollectionConfig = {
  slug: 'invite-links',
  admin: {
    useAsTitle: 'token',
    defaultColumns: ['role', 'status', 'expiresAt', 'acceptedBy', 'createdBy'],
    description:
      'Deelbare uitnodigingslinks (bijv. via WhatsApp) — de ontvanger vult zelf zijn e-mailadres in.',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  endpoints: [
    {
      method: 'post',
      path: '/accept',
      handler: inviteLinksAcceptEndpoint,
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.token) {
          data.token = crypto.randomBytes(24).toString('base64url');
        }
        return data;
      },
    ],
    beforeChange: [setAuthor('createdBy')],
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      // Alleen ter gemak in de admin-UI; wordt niet opgeslagen.
      name: 'inviteUrl',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
        description: 'Deel deze link (bijv. via WhatsApp).',
      },
      hooks: {
        afterRead: [
          ({ siblingData }) => {
            const token = (siblingData as { token?: string })?.token;
            if (!token) return undefined;
            const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
            return `${base}/uitnodigen/${token}`;
          },
        ],
      },
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'redacteur', 'auteur'],
      defaultValue: 'auteur',
      required: true,
    },
    {
      // Alleen door de accept-endpoint gezet, nooit handmatig.
      name: 'status',
      type: 'select',
      options: ['pending', 'accepted'],
      defaultValue: 'pending',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      defaultValue: () => new Date(Date.now() + SEVEN_DAYS_MS).toISOString(),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'acceptedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
};
