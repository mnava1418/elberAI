import Image from 'next/image'

export default function ElberAvatar({
  size = 28,
  glow = true,
  className,
}: {
  size?: number
  glow?: boolean
  className?: string
}) {
  return (
    <span
      className={`relative inline-block flex-shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-elber.png"
        alt=""
        width={size}
        height={size}
        className="relative z-10 w-full h-auto"
      />
      {glow && (
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            inset: -size * 0.25,
            background:
              'radial-gradient(circle, var(--color-glow) 0%, transparent 70%)',
          }}
        />
      )}
    </span>
  )
}
