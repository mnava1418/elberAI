'use client'

import useChatStore from '@/store/useChatStore'
import useUserStore from '@/store/useUserStore'
import { deleteAllChats as deleteAllChatsApi } from '@/services/chat.service'
import { logOut } from '@/services/auth.service'
import SidebarItem from './SidebarItem'

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const chats = useChatStore((state) => state.chats)

  const sortedChats = [...chats.values()].sort((a, b) => b.id - a.id)
  const hasChats = sortedChats.length > 0

  const profile = useUserStore((state) => state.profile)

  const handleNewChat = () => {
    useChatStore.getState().selectChat(-1)
    onClose?.()
  }

  const handleDeleteAll = async () => {
    useChatStore.getState().deleteAllChats()
    try {
      await deleteAllChatsApi()
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogOut = async () => {
    try {
      await logOut()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-secondary)] w-64 shrink-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-primary)]">
        <span className="text-sm font-semibold text-[var(--color-text)]">Elber</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[var(--color-subtitle)] hover:text-[var(--color-text)] md:hidden"
            aria-label="Cerrar sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="15" y2="15" />
              <line x1="15" y1="3" x2="3" y2="15" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={handleNewChat}
          className="w-full rounded-lg border border-[var(--color-subtitle)]/30 px-3 py-2 text-sm text-[var(--color-subtitle)] hover:text-[var(--color-text)] hover:border-[var(--color-subtitle)] transition-colors text-left"
        >
          + Chat Nuevo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {sortedChats.map((chat) => (
          <SidebarItem key={chat.id} chat={chat} onSelect={onClose} />
        ))}
      </div>

      <div className="px-3 pb-4 border-t border-[var(--color-primary)] pt-3 space-y-1">
        {hasChats && (
          <button
            onClick={handleDeleteAll}
            className="w-full rounded-lg px-3 py-2 text-sm text-[var(--color-subtitle)] hover:text-red-400 transition-colors text-left"
          >
            Eliminar todo
          </button>
        )}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-[var(--color-subtitle)] truncate">{profile?.email}</span>
          <button
            onClick={handleLogOut}
            className="text-xs text-[var(--color-subtitle)] hover:text-[var(--color-text)] transition-colors ml-2 shrink-0"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  )
}
