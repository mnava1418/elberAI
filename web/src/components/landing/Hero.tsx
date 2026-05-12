import Image from "next/image";
import Link from "next/link";

function Stamp({
  children,
  color = "var(--color-cyan)",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.12em]"
      style={{ color, fontFamily: "var(--font-mono)" }}
    >
      <span
        className="w-[5px] h-[5px] rounded-full"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
      {children}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-5 sm:px-10 lg:px-16 pt-10 sm:pt-16 lg:pt-20 pb-10 sm:pb-14">
      {/* Glow orbs */}
      <span
        aria-hidden
        className="orb"
        style={{
          width: 900,
          height: 900,
          top: "30%",
          left: "20%",
          transform: "translate(-50%, -50%)",
          opacity: 0.18,
          background:
            "radial-gradient(circle, var(--color-violet) 0%, var(--color-cyan) 35%, transparent 65%)",
        }}
      />
      <span
        aria-hidden
        className="orb"
        style={{
          width: 700,
          height: 700,
          top: "70%",
          left: "85%",
          transform: "translate(-50%, -50%)",
          opacity: 0.14,
          background:
            "radial-gradient(circle, var(--color-cyan) 0%, var(--color-violet) 35%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto grid gap-10 lg:gap-14 items-center lg:grid-cols-[1.15fr_1fr]">
        {/* Copy */}
        <div>
          <Stamp>asistente personal · est. 2026</Stamp>

          <h1
            className="mt-5 text-[56px] sm:text-7xl lg:text-[108px] leading-[0.92] tracking-[-0.04em] font-medium text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Hola,
            <br />
            soy <span className="italic gradient-text">Elber.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-[19px] leading-relaxed text-[var(--color-dim)] max-w-[460px]">
            Tu asistente con bigote y gafas.
            <br />
            Recuerda lo que te importa.
            <br />
            Habla como un humano.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link
              href="/login"
              className="gradient-accent inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[var(--color-bg)] text-[15px] font-semibold hover:opacity-95 transition"
              style={{ boxShadow: "0 10px 36px var(--color-glow)" }}
            >
              empezar a charlar <span>→</span>
            </Link>
            <a
              href="#demo"
              className="text-sm text-[var(--color-text)] py-3.5 px-1 border-b border-[var(--color-border-strong)] hover:text-[var(--color-cyan)] transition"
            >
              o ver cómo conversa ↓
            </a>
          </div>
        </div>

        {/* Mascot + notes */}
        <div className="relative min-h-[320px] lg:min-h-[420px]">
          <span
            aria-hidden
            className="absolute inset-[10%] rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, var(--color-glow-soft) 0%, transparent 70%)",
            }}
          />
          <Image
            src="/logo-elber.png"
            alt="Elber"
            width={360}
            height={238}
            priority
            className="relative z-10 mx-auto anim-float w-[240px] sm:w-[300px] lg:w-[360px] h-auto"
            style={{ filter: "drop-shadow(0 0 32px var(--color-glow))" }}
          />

          {/* Memory note */}
          <div
            className="glass-strong absolute z-20 -rotate-3 w-[170px] sm:w-[200px] lg:w-[220px] rounded-2xl p-3.5 shadow-2xl"
            style={{
              top: "10%",
              right: "-2%",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="text-[10px] mb-2 tracking-[0.12em]"
              style={{
                color: "var(--color-cyan)",
                fontFamily: "var(--font-mono)",
              }}
            >
              ◈ MEMORIA · 14:32
            </div>
            <div className="text-[13px] leading-snug text-[var(--color-text)]">
              Odia el cilantro. Le encanta el cine de los 70.
            </div>
          </div>

          {/* Reminder note */}
          <div
            className="absolute z-20 rotate-3 w-[180px] sm:w-[210px] lg:w-[230px] rounded-2xl p-3.5 border"
            style={{
              bottom: "6%",
              left: "-2%",
              background:
                "linear-gradient(135deg, rgba(125,249,255,0.18), rgba(177,140,255,0.12))",
              borderColor: "var(--color-border-strong)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="text-[10px] mb-2 tracking-[0.12em]"
              style={{
                color: "var(--color-violet)",
                fontFamily: "var(--font-mono)",
              }}
            >
              ⏰ RECORDATORIO
            </div>
            <div className="text-[13px] leading-snug text-[var(--color-text)]">
              Llamar a mamá el domingo · 19:00
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
