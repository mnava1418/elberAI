'use client'

import { useRef, useState } from 'react'
import useChatStore from '@/store/useChatStore'
import useElberStore from '@/store/useElberStore'
import { ElberMessage } from '@/types/chat.types'
import SocketManager from '@/services/socket.service'

export default function InputToolBar({
  standalone,
}: {
  standalone?: boolean
}) {
  const [inputText, setInputText] = useState('')
  const [focused, setFocused] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
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
    const title =
      selectedChatId === -1
        ? 'Chat Nuevo'
        : chats.get(selectedChatId)?.name ?? text.slice(0, 60)

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
    <div
      className={
        standalone
          ? 'w-full'
          : 'px-4 sm:px-6 pt-2 pb-4 bg-[var(--color-bg)]'
      }
    >
      <div className={standalone ? 'max-w-[620px] mx-auto' : 'max-w-[760px] mx-auto'}>
        <div
          className="flex items-end gap-2 rounded-[18px] px-2.5 py-2.5 pl-3.5 transition"
          style={{
            background: 'var(--color-bg-2)',
            border: `1px solid ${focused ? 'var(--color-cyan)' : 'var(--color-border-strong)'}`,
            boxShadow: focused ? '0 0 0 4px var(--color-glow-soft)' : 'none',
          }}
        >
          {/* Voice toggle (UI only — wire to isVoiceMode in your request when ready) */}
          <button
            type="button"
            onClick={() => setVoiceMode((v) => !v)}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition"
            style={{
              background: voiceMode
                ? 'linear-gradient(135deg, var(--color-cyan), var(--color-violet))'
                : 'transparent',
              border: voiceMode ? 'none' : '1px solid var(--color-border)',
              color: voiceMode ? 'var(--color-bg)' : 'var(--color-dim)',
              boxShadow: voiceMode ? '0 6px 20px var(--color-glow)' : 'none',
            }}
            aria-label={voiceMode ? 'Desactivar voz' : 'Activar voz'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="2" width="4" height="8" rx="2" />
              <path d="M3 7v1a5 5 0 0 0 10 0V7M8 13v2" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={voiceMode ? 'Habla con Elber...' : 'Escríbele a Elber...'}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[15px] leading-snug text-[var(--color-text)] placeholder-[var(--color-dimmer)] outline-none max-h-40 py-2"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-90"
              style={{
                background: 'rgba(255,122,142,0.15)',
                border: '1px solid rgba(255,122,142,0.4)',
                color: '#ff7a8e',
              }}
              aria-label="Cancelar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="3" y="3" width="8" height="8" rx="1.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition"
              style={{
                background: canSend
                  ? 'linear-gradient(135deg, var(--color-cyan), var(--color-violet))'
                  : 'var(--color-panel)',
                border: canSend ? 'none' : '1px solid var(--color-border)',
                color: canSend ? 'var(--color-bg)' : 'var(--color-dimmer)',
                cursor: canSend ? 'pointer' : 'not-allowed',
                boxShadow: canSend ? '0 6px 20px var(--color-glow)' : 'none',
              }}
              aria-label="Enviar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 13V3M3 8l5-5 5 5" />
              </svg>
            </button>
          )}
        </div>

        {!standalone && (
          <div
            className="mt-2 text-[11px] tracking-wider text-[var(--color-dimmer)] text-center"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ⏎ enviar · ⇧⏎ nueva línea
          </div>
        )}
      </div>
    </div>
  )
}
