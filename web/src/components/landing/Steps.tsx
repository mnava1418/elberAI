const steps = [
  {
    n: "I",
    t: "Te presentas",
    d: "Cuéntale lo que quieras. Da igual el formato — Elber se enrolla rápido.",
  },
  {
    n: "II",
    t: "Conversa contigo",
    d: "Cada charla queda en su diario. Lo que importa, se queda. Lo trivial, se olvida.",
  },
  {
    n: "III",
    t: "Vuelve siempre",
    d: "Mañana retomará el hilo como si nunca te hubieras ido.",
  },
];

export default function Steps() {
  return (
    <section
      id="pasos"
      className="relative overflow-hidden px-5 sm:px-10 lg:px-16 py-14 sm:py-20 lg:py-24"
    >
      <span
        aria-hidden
        className="orb"
        style={{
          width: 500,
          height: 500,
          top: "50%",
          left: "100%",
          transform: "translate(-50%, -50%)",
          opacity: 0.1,
          background:
            "radial-gradient(circle, var(--color-violet) 0%, var(--color-cyan) 35%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-10">
          <h2
            className="text-3xl sm:text-4xl lg:text-[52px] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Tres pasos,{" "}
            <span className="italic text-[var(--color-violet)]">
              de la mano.
            </span>
          </h2>
          <span
            className="text-xs text-[var(--color-dim)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            cap. 01 — primeros días
          </span>
        </div>

        <div className="grid gap-4 lg:gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8"
            >
              <div
                className="gradient-text italic font-medium text-[64px] leading-none mb-3.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.n}.
              </div>
              <h3
                className="text-xl sm:text-2xl font-medium text-[var(--color-text)] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.t}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-dim)]">
                {s.d}
              </p>
              <span
                aria-hidden
                className="absolute -inset-x-px bottom-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--color-cyan), transparent)",
                  opacity: 0.5,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
