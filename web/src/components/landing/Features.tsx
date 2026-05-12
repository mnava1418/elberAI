const features = [
  {
    i: "⟢",
    t: "Streaming",
    d: "Las palabras aparecen en cuanto Elber las piensa. Como en un buen intercambio.",
  },
  {
    i: "◈",
    t: "Memoria",
    d: "Lo que cuentas hoy, lo recuerda mañana. Tú decides qué archivar y qué olvidar.",
  },
  {
    i: "⌖",
    t: "Búsqueda web",
    d: "Cuando no sabe, busca. Cuando no recuerda, te lo dice y averigua.",
  },
  {
    i: "☂",
    t: "Clima",
    d: "Cualquier ciudad, cualquier día. Te avisa si vale la pena llevar paraguas.",
  },
];

export default function Features() {
  return (
    <section
      id="capacidades"
      className="border-t border-[var(--color-border)] px-5 sm:px-10 lg:px-16 py-14 sm:py-20 lg:py-24"
      style={{ background: "var(--color-bg-2)" }}
    >
      <div className="max-w-6xl mx-auto grid gap-10 lg:gap-12 lg:grid-cols-[1fr_1.2fr] items-start">
        <div>
          <span
            className="glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.12em]"
            style={{
              color: "var(--color-cyan)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{
                background: "var(--color-cyan)",
                boxShadow: "0 0 10px var(--color-cyan)",
              }}
            />
            capacidades · v1
          </span>
          <h2
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-[-0.03em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pequeñas cosas que{" "}
            <span className="italic text-[var(--color-cyan)]">
              hacen el día.
            </span>
          </h2>
          <p className="mt-5 max-w-[380px] text-[15.5px] leading-relaxed text-[var(--color-dim)]">
            Elber hace pocas cosas y las hace bien. Cada capacidad responde a
            algo que pediste de verdad.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {features.map((f) => (
            <div
              key={f.t}
              className="glass rounded-2xl p-5 sm:p-6"
            >
              <div
                className="text-[28px] mb-3"
                style={{
                  color: "var(--color-cyan)",
                  textShadow: "0 0 16px var(--color-glow)",
                }}
              >
                {f.i}
              </div>
              <h3
                className="text-lg font-semibold text-[var(--color-text)] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {f.t}
              </h3>
              <p className="mt-2 text-[13.5px] leading-snug text-[var(--color-dim)]">
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
