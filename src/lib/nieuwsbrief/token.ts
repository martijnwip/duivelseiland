/** Geheim token voor de bevestigings- en afmeldlink: 32 random bytes als hex (64 tekens). */
export function nieuwToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const TOKEN_RE = /^[0-9a-f]{64}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
