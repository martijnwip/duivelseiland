export const CONTACT_SOORTEN = ['idee', 'vraag', 'opmerking'] as const;

export type ContactSoort = (typeof CONTACT_SOORTEN)[number];

export const CONTACT_SOORT_LABELS: Record<ContactSoort, string> = { idee: 'Idee', vraag: 'Vraag', opmerking: 'Opmerking' };
