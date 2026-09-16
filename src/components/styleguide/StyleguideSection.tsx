export function StyleguideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-10 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold text-primary">{title}</h2>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}
