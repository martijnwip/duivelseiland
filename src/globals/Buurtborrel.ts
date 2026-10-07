import type { GlobalConfig } from 'payload';
import { alleenIngelogdField, isRedacteurOrAdmin } from '../access/isAdmin';
import { revalidateSite } from './revalidateSite';

/**
 * Contactgegevens voor de Buurtborrel-pagina. De teksten zelf staan in
 * messages/*.json; hier alleen wat de redactie moet kunnen bijwerken.
 */
export const Buurtborrel: GlobalConfig = {
  slug: 'buurtborrel',
  access: {
    read: () => true,
    update: isRedacteurOrAdmin,
  },
  hooks: {
    afterChange: [revalidateSite],
  },
  fields: [
    {
      name: 'aanmeldEmail',
      type: 'email',
      required: true,
      defaultValue: 'duivelseiland@outlook.com',
      admin: { description: 'Hier komen aan- en afmeldingen voor de mailinglijst binnen.' },
    },
    {
      name: 'burenAppNummer',
      type: 'text',
      access: { read: alleenIngelogdField },
      admin: { description: 'Telefoonnummer van de beheerder van de Buren-app Duivelseiland (WhatsApp). Leeg = geen knop.' },
    },
    {
      name: 'barryNummer',
      type: 'text',
      access: { read: alleenIngelogdField },
      admin: { description: 'Telefoonnummer van Barry (catering, WhatsApp). Leeg = geen knop.' },
    },
  ],
};
