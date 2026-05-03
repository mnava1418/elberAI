import ReactMarkdown from 'react-markdown'
import { ElberMessage } from '@/types/chat.types'

export default function MessageBubble({ message }: { message: ElberMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--color-secondary)] text-[var(--color-text)]'
            : 'text-[var(--color-text)]'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
              code: ({ children }) => (
                <code className="bg-[var(--color-secondary)] rounded px-1 py-0.5 text-xs font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-[var(--color-secondary)] rounded-lg p-3 mb-2 overflow-x-auto text-xs font-mono">
                  {children}
                </pre>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}
