'use client'

import { useEffect, useRef } from 'react'
import useChatStore from '@/store/useChatStore'
import useElberStore from '@/store/useElberStore'
import MessageBubble from './MessageBubble'
import IsWaiting from './IsWaiting'

export default function MessageList() {
  const chats = useChatStore((state) => state.chats)
  const selectedChatId = useChatStore((state) => state.selectedChatId)
  const isWaiting = useElberStore((state) => state.isWaiting)
  const containerRef = useRef<HTMLDivElement>(null)

  const messages = selectedChatId !== -1 ? (chats.get(selectedChatId)?.messages ?? []) : []

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [messages.length, isWaiting])

  return (
    <div
      ref={containerRef}
      className="flex flex-col-reverse flex-1 overflow-y-auto px-4 py-4"
    >
      {isWaiting && <IsWaiting />}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}
