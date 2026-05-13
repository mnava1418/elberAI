import ReactMarkdown from 'react-markdown'
import { ElberMessage } from '@/types/chat.types'
import ElberAvatar from './ElberAvatar'

export default function MessageBubble({
  message,
  streaming,
}: {
  message: ElberMessage
  streaming?: boolean
}) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div
          className="max-w-[78%] rounded-2xl rounded-br-[4px] px-3.5 py-2.5 text-[14.5px] leading-relaxed text-[var(--color-text)] border border-[var(--color-border-strong)] whitespace-pre-wrap"
          style={{
            background:
              'linear-gradient(135deg, rgba(125,249,255,0.16), rgba(177,140,255,0.12))',
            backdropFilter: 'blur(10px)',
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-5">
      <ElberAvatar size={28} glow={false} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div
          className="italic text-[13.5px] text-[var(--color-cyan)] mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Elber
        </div>
        <div className="text-[14.5px] leading-relaxed text-[var(--color-text)] markdown-elber">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-2 marker:text-[var(--color-dim)]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-2 marker:text-[var(--color-dim)]">
                  {children}
                </ol>
              ),
              code: ({ children }) => (
                <code
                  className="rounded px-1.5 py-0.5 text-[12.5px] border border-[var(--color-border)]"
                  style={{
                    background: 'var(--color-panel)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre
                  className="rounded-lg p-3.5 mb-2 overflow-x-auto text-[12.5px] border border-[var(--color-border)]"
                  style={{
                    background: 'var(--color-bg-2)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {children}
                </pre>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-cyan)] hover:underline"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="text-[var(--color-text)] font-semibold">
                  {children}
                </strong>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
          {streaming && (
            <span
              aria-hidden
              className="inline-block align-text-bottom anim-blink"
              style={{
                width: 7,
                height: 14,
                marginLeft: 2,
                background: 'var(--color-cyan)',
                boxShadow: '0 0 8px var(--color-glow)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
