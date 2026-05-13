'use client'

import useChatStore from '@/store/useChatStore'
import useUserStore from '@/store/useUserStore'
import { deleteAllChats as deleteAllChatsApi } from '@/services/chat.service'
import { logOut } from '@/services/auth.service'
import ElberAvatar from './ElberAvatar'
import SidebarItem from './SidebarItem'

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const chats = useChatStore((state) => state.chats)
  const sortedChats = [...chats.values()].sort((a, b) => b.id - a.id)
  const hasChats = sortedChats.length > 0
  const profile = useUserStore((state) => state.profile)

  const initial = (profile?.email ?? 'E').trim().charAt(0).toUpperCase()

  const handleNewChat = () => {
    useChatStore.getState().selectChat(-1)
    onClose?.()
  }

  const handleDeleteAll = async () => {
    if (!confirm('¿Eliminar todos los chats?')) return
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
    <aside
      className="flex flex-col h-full w-[280px] shrink-0 border-r border-[var(--color-border)] relative"
      style={{ background: 'var(--color-bg-2)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-[18px] py-3.5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <ElberAvatar size={28} />
          <span
            className="italic text-lg font-medium tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Elber
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-[var(--color-dim)] hover:text-[var(--color-text)] p-1"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        )}
      </div>

      {/* New chat */}
      <div className="px-3 pt-3.5">
        <button
          onClick={handleNewChat}
          className="w-full text-left text-[13.5px] font-medium text-[var(--color-text)] flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-panel)] hover:bg-[var(--color-panel-strong)] transition"
        >
          <span
            className="w-[18px] h-[18px] rounded-[5px] gradient-accent flex items-center justify-center text-sm font-bold"
            style={{ color: 'var(--color-bg)' }}
          >
            +
          </span>
          Chat Nuevo
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-3.5 flex flex-col gap-0.5">
        <div
          className="px-2.5 pt-1.5 pb-2 text-[10.5px] tracking-[0.12em] uppercase text-[var(--color-dimmer)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          conversaciones
        </div>
        {!hasChats && (
          <div className="px-3 py-2 text-[12.5px] text-[var(--color-dim)]">
            Todavía no hay chats. Crea uno arriba.
          </div>
        )}
        {sortedChats.map((chat) => (
          <SidebarItem key={chat.id} chat={chat} onSelect={onClose} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-border)] flex flex-col gap-0.5">
        {hasChats && (
          <button
            onClick={handleDeleteAll}
            className="text-left text-[12.5px] text-[var(--color-dim)] hover:text-[#ff7a8e] px-3 py-2 rounded-lg transition"
          >
            Eliminar todo
          </button>
        )}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <span
            className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ color: 'var(--color-bg)' }}
          >
            {initial}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium text-[var(--color-text)] truncate">
              {profile?.email ?? 'invitado'}
            </div>
            <div className="text-[10.5px] text-[var(--color-dim)]">conectado</div>
          </div>
          <button
            onClick={handleLogOut}
            className="text-[var(--color-dim)] hover:text-[var(--color-text)] p-1.5 rounded-md transition"
            aria-label="Salir"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
