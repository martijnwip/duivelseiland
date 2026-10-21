/** De WhatsApp-groepen van de buurt; `value` staat in de database, de teksten op de site staan in messages/. */
export const WHATSAPP_GROEPEN = [
  { value: 'buurt', label: 'Buren-app Duivelseiland' },
  { value: 'schoonmaak', label: 'Duivelse Schoonmaak' },
] as const;
export type WhatsappGroep = (typeof WHATSAPP_GROEPEN)[number]['value'];

export const WHATSAPP_STATUS = [
  { value: 'aangemeld', label: 'Aangemeld' },
  { value: 'toegevoegd', label: 'Toegevoegd' },
] as const;
