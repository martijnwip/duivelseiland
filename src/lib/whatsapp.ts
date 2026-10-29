/**
 * Zet een los ingevoerd telefoonnummer om naar een wa.me-link (opent een
 * WhatsApp-chat met dat nummer). Geschreven voor NL-nummers maar accepteert
 * ook een nummer dat al internationaal genoteerd is. Met `text` staat er
 * alvast een bericht klaar in de chat.
 */
export function buildWhatsAppLink(number: string | null | undefined, text?: string): string | null {
  const digits = whatsAppNummer(number);
  if (!digits) return null;
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

/** Een Nederlands mobiel nummer (06 / +316): die hebben bijna altijd WhatsApp, een vast nummer meestal niet. */
export function isNlMobielNummer(number: string | null | undefined): boolean {
  return /^316\d{8}$/.test(whatsAppNummer(number) ?? '');
}

/** Het nummer zoals wa.me het wil: internationaal, alleen cijfers. */
function whatsAppNummer(number: string | null | undefined): string | null {
  if (!number) return null;

  // Alles behalve cijfers en een eventuele voorloop-'+' weg (spaties, haakjes,
  // streepjes, etc.).
  const trimmed = number.trim();
  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  if (hasPlus) {
    // '+31612345678' -> digits is al '31612345678'.
  } else if (digits.startsWith('00')) {
    // '0031612345678' (internationaal zonder '+') -> '31612345678'.
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    // '0612345678' (NL-notatie) -> '31612345678'.
    digits = `31${digits.slice(1)}`;
  }
  // Anders: al internationaal zonder '+'/'00' (bijv. '31612345678') - ongewijzigd.
  return digits;
}
