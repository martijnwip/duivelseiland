import Link from 'next/link';
import { localizedHref } from '@/i18n/localizedHref';

/** Verwijzing naar het aanmeldformulier op /whatsapp, als omlijnde knop of als gewone tekstlink. */
export function WhatsappAanmeldLink({ locale, label, variant = 'knop', className = '' }: { locale: string; label: string; variant?: 'knop' | 'link'; className?: string }) {
  const cls =
    variant === 'knop'
      ? 'inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary px-5 py-2 font-medium text-primary no-underline transition-colors hover:bg-primary hover:text-on-primary'
      : 'inline-flex min-h-11 items-center font-medium text-primary underline';
  return (
    <Link
      href={localizedHref(locale, '/whatsapp')}
      className={`${cls} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      {label}
    </Link>
  );
}
