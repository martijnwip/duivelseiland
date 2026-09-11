import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'redacteur', 'auteur'],
      defaultValue: 'auteur',
      required: true,
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
};
