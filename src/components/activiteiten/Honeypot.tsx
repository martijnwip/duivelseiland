/** Honeypot: onzichtbaar voor mensen, bots vullen het in. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px]">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
