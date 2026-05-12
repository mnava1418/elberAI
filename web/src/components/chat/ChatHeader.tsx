'use client'

import useChatStore from '@/store/useChatStore'
import { deleteChat as deleteChatApi } from '@/services/chat.service'

export default function ChatHeader({
  title,
  onOpenSidebar,
  compact,
}: {
  title: string
  onOpenSidebar: () => void
  compact?: boolean
}) {
  const selectedChatId = useChatStore((s) => s.selectedChatId)

  const handleDelete = async () => {
    if (selectedChatId === -1) return
    if (!confirm('¿Eliminar este chat?')) return
    useChatStore.getState().deleteChat(selectedChatId)
    try {
      await deleteChatApi(selectedChatId)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg)] relative z-10">
      {/* Mobile burger */}
      <button
        onClick={onOpenSidebar}
        className="md:hidden text-[var(--color-text)] hover:text-[var(--color-cyan)] transition"
        aria-label="Abrir menú"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="5" x2="17" y2="5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="15" x2="17" y2="15" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-sm sm:text-[15px] font-medium text-[var(--color-text)] truncate">
          {title}
        </div>
        {!compact && (
          <div
            className="flex items-center gap-1.5 text-[11px] text-[var(--color-dim)] mt-0.5"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{
                background: 'var(--color-cyan)',
                boxShadow: '0 0 6px var(--color-cyan)',
              }}
            />
            elber online · memoria activa
          </div>
        )}
      </div>

      {!compact && selectedChatId !== -1 && (
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg text-[var(--color-dim)] hover:text-[#ff7a8e] hover:bg-[var(--color-panel)] transition"
          aria-label="Eliminar chat"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5h10M6 5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M5 5l1 9h4l1-9" />
          </svg>
        </button>
      )}
    </header>
  )
}
