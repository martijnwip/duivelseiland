import type { CollectionConfig } from 'payload';
import { slugField } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';

export const Slideshows: CollectionConfig = {
  slug: 'slideshows',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Slideshows zelf bevatten geen gevoelige content (alleen naam/slug) en
    // moeten publiek leesbaar zijn zodat de homepage de "homepage-hero"
    // slideshow ongeauthenticeerd kan opzoeken. editorOnlyContentAccess kan
    // hier niet: die filtert op een `status`-veld dat deze collection niet heeft.
    read: () => true,
    create: isRedacteurOrAdmin,
    update: isRedacteurOrAdmin,
    delete: isRedacteurOrAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'name' }),
  ],
};
