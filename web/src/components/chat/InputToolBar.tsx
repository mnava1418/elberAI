'use client'

import { useRef, useState } from 'react'
import useChatStore from '@/store/useChatStore'
import useElberStore from '@/store/useElberStore'
import { ElberMessage } from '@/types/chat.types'
import SocketManager from '@/services/socket.service'

export default function InputToolBar() {
  const [inputText, setInputText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedChatId = useChatStore((state) => state.selectedChatId)
  const chats = useChatStore((state) => state.chats)
  const isWaiting = useElberStore((state) => state.isWaiting)
  const isStreaming = useElberStore((state) => state.isStreaming)

  const canSend = inputText.trim() !== '' && !isWaiting && !isStreaming

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return

    const chatId = selectedChatId === -1 ? Date.now() : selectedChatId
    const title = selectedChatId === -1
      ? 'Chat Nuevo'
      : (chats.get(selectedChatId)?.name ?? text.slice(0, 60))

    const userMessage: ElberMessage = {
      id: `user:${Date.now()}`,
      createdAt: Date.now(),
      role: 'user',
      content: text,
    }

    useChatStore.getState().addChatMessage(chatId, userMessage)
    useElberStore.getState().setWaiting(true)
    SocketManager.getInstance().sendMessage(chatId, title, text)

    setInputText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleCancel = () => {
    SocketManager.getInstance().cancelMessage(selectedChatId)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) handleSend()
    }
  }

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 rounded-2xl bg-[var(--color-secondary)] px-4 py-3">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Escríbele a Elber..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-subtitle)] outline-none max-h-40 leading-relaxed"
        />

        {isStreaming ? (
          <button
            onClick={handleCancel}
            className="shrink-0 rounded-full bg-red-500 p-2 transition-colors hover:bg-red-600"
            aria-label="Cancelar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <rect x="4" y="4" width="8" height="8" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="shrink-0 rounded-full bg-[var(--color-contrast)] p-2 transition-colors hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Enviar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="black">
              <path d="M8 2L14 8L8 14M14 8H2" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
