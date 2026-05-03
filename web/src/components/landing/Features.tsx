const features = [
  {
    title: 'Respuestas en tiempo real',
    description: 'Streaming token a token para que la conversación fluya sin esperas.',
  },
  {
    title: 'Memoria persistente',
    description: 'Elber recuerda tus preferencias, proyectos y contexto entre conversaciones.',
  },
  {
    title: 'Búsqueda web integrada',
    description: 'Accede a información actualizada sin salir de la conversación.',
  },
  {
    title: 'Clima y ubicación',
    description: 'Consulta el clima actual y pronósticos para cualquier ciudad del mundo.',
  },
]

export default function Features() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl bg-[var(--color-secondary)] p-6"
          >
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-[var(--color-subtitle)] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
