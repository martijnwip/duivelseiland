const imgStyle = { width: '100%', height: '100%', objectFit: 'contain' as const };

export default function AdminIcon() {
  return (
    <>
      {/* Payload zet data-theme="dark"/"light" op <html> (los van de site's
          eigen next-themes); het zwarte duivelskopje is onzichtbaar op de
          donkere achtergrond, dus wisselen naar het witte in dat thema. */}
      <style style={{ display: 'none' }}>{`
        .admin-icon--light { display: block; }
        .admin-icon--dark { display: none; }
        :root[data-theme='dark'] .admin-icon--light { display: none; }
        :root[data-theme='dark'] .admin-icon--dark { display: block; }
      `}</style>
      <img className="admin-icon--light" src="/logo/duivel-zwart.svg" alt="" style={imgStyle} />
      <img className="admin-icon--dark" src="/logo/duivel-wit.svg" alt="" style={imgStyle} />
    </>
  );
}
