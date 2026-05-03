import { BACK_URL } from '@/lib/constants'
import { auth } from '@/lib/firebase'
import { ElberChat } from '@/types/chat.types'

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await auth.currentUser?.getIdToken(true)
  return { Authorization: `Bearer ${token}` }
}

export const getChats = async (): Promise<Map<number, ElberChat>> => {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BACK_URL}/ai/chat`, { headers })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data: { chats: ElberChat[] } = await res.json()
    const elberChats = new Map<number, ElberChat>()

    data.chats.forEach((chat) => {
      chat.messages.sort((a, b) => b.createdAt - a.createdAt)
      elberChats.set(chat.id, chat)
    })

    return elberChats
  } catch (error) {
    console.error(error)
    throw new Error('Unable to get chats')
  }
}

export const deleteChat = async (chatId: number): Promise<void> => {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BACK_URL}/ai/chat`, {
      method: 'DELETE',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (error) {
    console.error(error)
    throw new Error('Unable to delete chat')
  }
}

export const deleteAllChats = async (): Promise<void> => {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BACK_URL}/ai/chat/all`, {
      method: 'DELETE',
      headers,
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (error) {
    console.error(error)
    throw new Error('Unable to delete all chats')
  }
}
