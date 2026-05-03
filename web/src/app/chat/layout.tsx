'use client'

import { useEffect } from 'react'
import useAuthGuard from '@/hooks/useAuthGuard'
import useSocket from '@/hooks/useSocket'
import { getChats } from '@/services/chat.service'
import useChatStore from '@/store/useChatStore'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard()
  useSocket()

  useEffect(() => {
    getChats()
      .then((chats) => useChatStore.getState().setChats(chats))
      .catch(console.error)
  }, [])

  return <>{children}</>
}
