'use client'

import useChatStore from '@/store/useChatStore'
import { deleteChat as deleteChatApi } from '@/services/chat.service'
import { ElberChat } from '@/types/chat.types'

export default function SidebarItem({
  chat,
  onSelect,
}: {
  chat: ElberChat
  onSelect?: () => void
}) {
  const selectedChatId = useChatStore((state) => state.selectedChatId)
  const isActive = selectedChatId === chat.id

  const handleSelect = () => {
    useChatStore.getState().selectChat(chat.id)
    onSelect?.()
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    useChatStore.getState().deleteChat(chat.id)
    try {
      await deleteChatApi(chat.id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      onClick={handleSelect}
      className={`group relative cursor-pointer rounded-lg px-3 py-2.5 flex items-center gap-2 transition ${
        isActive
          ? 'bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text)] font-medium'
          : 'border border-transparent text-[var(--color-dim)] hover:bg-[var(--color-panel)] hover:text-[var(--color-text)]'
      }`}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute left-0 top-[20%] bottom-[20%] w-[2px] rounded"
          style={{
            background:
              'linear-gradient(180deg, var(--color-cyan), var(--color-violet))',
            boxShadow: '0 0 8px var(--color-glow)',
          }}
        />
      )}
      <span className="flex-1 truncate text-[13.5px]">
        {chat.name ?? 'Chat Nuevo'}
      </span>
      <span
        role="button"
        tabIndex={0}
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition text-[var(--color-dim)] hover:text-[#ff7a8e] flex-shrink-0"
        aria-label="Eliminar chat"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5h10M6 5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M5 5l1 9h4l1-9" />
        </svg>
      </span>
    </div>
  )
}
