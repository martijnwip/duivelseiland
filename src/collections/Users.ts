import type { CollectionConfig } from 'payload';
import { APIError } from 'payload';
import { isAdminField } from '../access/isAdmin';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  hooks: {
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
      name: 'role',
      type: 'select',
      options: ['admin', 'redacteur', 'auteur'],
      defaultValue: 'auteur',
      required: true,
      access: {
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
