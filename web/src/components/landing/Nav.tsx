import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="relative z-50 flex items-center justify-between px-5 sm:px-10 lg:px-16 py-4 sm:py-5 border-b border-[var(--color-border)]">
      <Link href="/" className="flex items-center gap-3 group">
        <span className="relative inline-block w-9 h-9">
          <Image
            src="/logo-elber.png"
            alt="Elber"
            width={36}
            height={36}
            priority
            className="relative z-10"
          />
          <span
            aria-hidden
            className="absolute -inset-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--color-glow) 0%, transparent 70%)",
            }}
          />
        </span>
        <span
          className="text-lg font-medium italic tracking-tight text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Elber
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-[var(--color-dim)]">
        <a href="#demo" className="hover:text-[var(--color-text)] transition">
          Cómo conversa
        </a>
        <a href="#pasos" className="hover:text-[var(--color-text)] transition">
          Tres pasos
        </a>
        <a
          href="#capacidades"
          className="hover:text-[var(--color-text)] transition"
        >
          Capacidades
        </a>
      </div>

      <Link
        href="/login"
        className="gradient-accent text-[var(--color-bg)] text-xs sm:text-[13px] font-semibold px-4 sm:px-5 py-2 rounded-full hover:opacity-90 transition"
      >
        Iniciar sesión
      </Link>
    </nav>
  );
}
