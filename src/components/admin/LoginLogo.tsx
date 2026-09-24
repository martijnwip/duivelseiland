export default function LoginLogo() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        // Ankert het blok aan het verticale midden van de viewport — waar
        // AuthCard zijn kaart ook zelf omheen centreert — i.p.v. een vaste
        // afstand vanaf de bovenkant, zodat de marge boven de kaart klopt
        // op elke schermhoogte.
        transform: 'translate(-50%, calc(-50% - 258px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 1,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo/duivelseiland-embleem.svg" alt="" width={120} height={116} />
      <span
        style={{
          fontSize: 'var(--font-size-h4, 1.25rem)',
          fontWeight: 600,
          color: 'var(--theme-text)',
          textAlign: 'center',
        }}
      >
        Duivelseiland - CMS
      </span>
    </div>
  );
}
