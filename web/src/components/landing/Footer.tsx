export default function Footer() {
  return (
    <footer className="px-6 py-8 border-t border-[var(--color-secondary)]">
      <p className="text-center text-sm text-[var(--color-subtitle)]">
        © {new Date().getFullYear()} Elber. Todos los derechos reservados.
      </p>
    </footer>
  )
}
