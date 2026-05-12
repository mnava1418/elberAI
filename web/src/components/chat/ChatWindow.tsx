'use client'

import useChatStore from '@/store/useChatStore'
import ChatHeader from './ChatHeader'
import EmptyState from './EmptyState'
import MessageList from './MessageList'
import InputToolBar from './InputToolBar'

export default function ChatWindow({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void
}) {
  const selectedChatId = useChatStore((s) => s.selectedChatId)
  const chats = useChatStore((s) => s.chats)
  const currentChat =
    selectedChatId !== -1 ? chats.get(selectedChatId) : undefined
  const hasMessages = (currentChat?.messages?.length ?? 0) > 0

  const showEmpty = selectedChatId === -1 || !hasMessages

  return (
    <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden bg-[var(--color-bg)]">
      <ChatHeader
        onOpenSidebar={onOpenSidebar}
        title={currentChat?.name ?? 'Chat Nuevo'}
        compact={showEmpty}
      />
      {showEmpty ? (
        <EmptyState />
      ) : (
        <>
          <MessageList />
          <InputToolBar />
        </>
      )}
    </div>
  )
}
