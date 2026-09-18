import AdminIcon from './AdminIcon';

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
        transform: 'translate(-50%, calc(-50% - 230px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 1,
      }}
    >
      <div style={{ width: 48, height: 60 }}>
        <AdminIcon />
      </div>
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
