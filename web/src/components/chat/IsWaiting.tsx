import ElberAvatar from './ElberAvatar'

export default function IsWaiting() {
  return (
    <div className="flex gap-3 mb-5">
      <ElberAvatar size={28} glow={false} className="mt-0.5" />
      <div className="flex items-center gap-1.5 py-2">
        <span
          className="w-[7px] h-[7px] rounded-full anim-pulse"
          style={{ background: 'var(--color-cyan)' }}
        />
        <span
          className="w-[7px] h-[7px] rounded-full anim-pulse"
          style={{ background: 'var(--color-cyan)', animationDelay: '0.2s' }}
        />
        <span
          className="w-[7px] h-[7px] rounded-full anim-pulse"
          style={{ background: 'var(--color-cyan)', animationDelay: '0.4s' }}
        />
      </div>
    </div>
  )
}
