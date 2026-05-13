import Image from 'next/image'
import InputToolBar from './InputToolBar'

export default function EmptyState() {
  return (
    <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center px-5 sm:px-10 py-8 bg-[var(--color-bg)]">
      <span
        aria-hidden
        className="orb"
        style={{
          width: 700,
          height: 700,
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.16,
          background:
            'radial-gradient(circle, var(--color-violet) 0%, var(--color-cyan) 35%, transparent 65%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[620px] text-center flex flex-col items-center">
        <div className="relative mb-7">
          <Image
            src="/logo-elber.png"
            alt=""
            width={120}
            height={80}
            priority
            className="relative z-10 anim-float w-[90px] sm:w-[120px] h-auto"
            style={{ filter: 'drop-shadow(0 0 24px var(--color-glow))' }}
          />
          <span
            aria-hidden
            className="absolute -inset-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle, var(--color-glow) 0%, transparent 70%)',
            }}
          />
        </div>

        <h2
          className="text-3xl sm:text-[44px] font-medium tracking-[-0.03em] leading-[1.05] text-[var(--color-text)] m-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ¿en qué te <span className="italic gradient-text">echo la mano?</span>
        </h2>
        <p className="mt-3 mb-8 max-w-[380px] text-sm sm:text-[14.5px] leading-relaxed text-[var(--color-dim)]">
          Pregúntame, cuéntame algo, o pídeme que recuerde lo que importa.
        </p>

        <div className="w-full max-w-[620px]">
          <InputToolBar standalone />
        </div>

        <div
          className="mt-3.5 text-[11px] tracking-wider text-[var(--color-dimmer)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          ⏎ enviar · ⇧⏎ nueva línea
        </div>
      </div>
    </div>
  )
}
