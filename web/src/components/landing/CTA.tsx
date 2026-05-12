import Link from "next/link";
import Image from "next/image";

export default function CTA() {
  return (
    <section className="relative overflow-hidden text-center px-5 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-32">
      <span
        aria-hidden
        className="orb"
        style={{
          width: 800,
          height: 800,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.2,
          background:
            "radial-gradient(circle, var(--color-cyan) 0%, var(--color-violet) 35%, transparent 65%)",
        }}
      />

      <div className="relative z-10">
        <div className="relative inline-block mb-7">
          <Image
            src="/logo-elber.png"
            alt=""
            width={120}
            height={80}
            className="relative z-10 anim-float w-[90px] sm:w-[120px] h-auto"
            style={{ filter: "drop-shadow(0 0 24px var(--color-glow))" }}
          />
          <span
            aria-hidden
            className="absolute -inset-8 rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--color-glow) 0%, transparent 70%)",
            }}
          />
        </div>

        <h2
          className="text-5xl sm:text-6xl lg:text-[80px] font-medium leading-[0.98] tracking-[-0.03em] text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ¿nos <span className="italic gradient-text">conocemos?</span>
        </h2>

        <p className="mt-5 text-base text-[var(--color-dim)]">
          Un minuto para entrar. Una vida para quedarse.
        </p>

        <Link
          href="/login"
          className="gradient-accent mt-8 inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-[var(--color-bg)] text-base font-semibold hover:opacity-95 transition"
          style={{ boxShadow: "0 14px 44px var(--color-glow)" }}
        >
          Iniciar sesión <span>→</span>
        </Link>
      </div>
    </section>
  );
}
