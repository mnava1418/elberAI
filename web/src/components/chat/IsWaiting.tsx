export default function IsWaiting() {
  return (
    <div className="flex gap-1 px-1 py-3">
      <span className="w-2 h-2 rounded-full bg-[var(--color-subtitle)] animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-[var(--color-subtitle)] animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-[var(--color-subtitle)] animate-bounce [animation-delay:300ms]" />
    </div>
  )
}
