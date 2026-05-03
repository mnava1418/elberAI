import Link from 'next/link'

export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">
      <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-[var(--color-text)] max-w-2xl leading-tight">
        Elber, tu asistente personal de IA
      </h1>
      <p className="mt-6 text-lg text-[var(--color-subtitle)] max-w-xl leading-relaxed">
        Elber recuerda quién eres, aprende de cada conversación y te ayuda con lo que necesites — en tiempo real.
      </p>
      <Link
        href="/login"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-[var(--color-contrast)] px-8 py-3 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-zinc-200"
      >
        Iniciar Sesión
      </Link>
    </section>
  )
}
