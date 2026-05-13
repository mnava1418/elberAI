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
  const isStreaming = useElberStore((state) => state.isStreaming)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages =
    selectedChatId !== -1 ? chats.get(selectedChatId)?.messages ?? [] : []

  // messages[0] is the newest — reverse for top-to-bottom display
  const sorted = [...messages].reverse()

  // Mark the latest assistant message as streaming so the cursor shows.
  const latest = messages[0]
  const showStreamingOn =
    isStreaming && latest && latest.role === 'assistant' ? latest.id : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages.length, isWaiting, isStreaming])

  return (
    <div className="relative flex-1 overflow-y-auto">
      <span
        aria-hidden
        className="orb"
        style={{
          width: 500,
          height: 500,
          top: '20%',
          left: '85%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.05,
          background:
            'radial-gradient(circle, var(--color-violet) 0%, var(--color-cyan) 35%, transparent 65%)',
        }}
      />

      <div className="relative z-10 flex flex-col px-4 sm:px-6 py-5 max-w-[760px] mx-auto w-full">
        {sorted.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            streaming={message.id === showStreamingOn}
          />
        ))}
        {isWaiting && <IsWaiting />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
