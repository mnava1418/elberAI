import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="border-t border-[var(--color-border)] px-5 sm:px-10 lg:px-16 py-6 sm:py-7 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-[var(--color-dim)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="flex items-center gap-2.5">
        <Image src="/logo-elber.png" alt="" width={22} height={15} />
        <span>elber · v1.0 — ed. limitada</span>
      </div>
      <span>hecho con ☕ y bigote · {new Date().getFullYear()}</span>
    </footer>
  );
}
