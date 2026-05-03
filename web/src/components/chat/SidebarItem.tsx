'use client'

import useChatStore from '@/store/useChatStore'
import { deleteChat as deleteChatApi } from '@/services/chat.service'
import { ElberChat } from '@/types/chat.types'

export default function SidebarItem({ chat, onSelect }: { chat: ElberChat; onSelect?: () => void }) {
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
    <button
      onClick={handleSelect}
      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        isActive
          ? 'bg-[var(--color-primary)] text-[var(--color-text)]'
          : 'text-[var(--color-subtitle)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text)]'
      }`}
    >
      <span className="truncate flex-1">
        {chat.name ?? 'Chat Nuevo'}
      </span>
      <span
        role="button"
        onClick={handleDelete}
        className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-subtitle)] hover:text-red-400"
        aria-label="Eliminar chat"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 2h4a1 1 0 0 1 1 1v1H5V3a1 1 0 0 1 1-1ZM3 5h10l-1 9H4L3 5Zm3 2v5m4-5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </span>
    </button>
  )
}
