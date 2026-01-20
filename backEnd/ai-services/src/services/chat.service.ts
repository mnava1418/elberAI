import admin from 'firebase-admin'
import { ElberChat, ElberMessage, ElberRole } from '../models/elber.model'
import ShortTermMemory from '../models/shortTermMemory.model'

export const saveChatMessage = async (uid: string, chatId: number, role: ElberRole, content: string ) => {
    try {        
        const createdAt = Date.now()
        const message: ElberMessage = {
            id: `${role}:${createdAt}`,
            createdAt,
            content,
            role
        }      

        const db = admin.database()
        const ref = db.ref(`/${uid}/chats/${chatId}/messages/${message.createdAt}`)
        await ref.update(message)        
    } catch (error) {
        console.error(error)
        throw new Error('Unable to save chat message')
    }
}

export const getUserChats = async (uid: string): Promise<ElberChat[]> => {
    try {
        const db = admin.database()
        const ref = db.ref(`/${uid}/chats`)

        const snapshot = await ref.once('value')
        const data = snapshot.val()

        if(data) {
            let elberChats: ElberChat[] = []

            Object.keys(data).forEach(chatId => {
                const chat = data[chatId]
                const chatName = chat.name || undefined
                const chatMessages: ElberMessage[] = Object.values(chat.messages)

                elberChats.push({
                    id: parseInt(chatId),
                    messages: chatMessages,
                    name: chatName
                })
            })

            return elberChats
        }

        return []
    } catch (error) {
        console.error(error)
        throw new Error('Unable to get user chats')
    }
}

export const updateTitle = async (uid: string, chatId: number, name: string) => {
    try {
        const db = admin.database()
        const ref = db.ref(`/${uid}/chats/${chatId}`)
        await ref.update({name})
    } catch (error) {
        console.error(error)
        throw new Error('Unable to update chat name')
    }
}

export const deleteChat = async (uid: string, chatId: number) => {
    try {
        const conversationId = `${uid}_${chatId.toString()}`
        ShortTermMemory.getInstance().deleteSession(conversationId)
        
        const db = admin.database()
        const ref = db.ref(`/${uid}/chats/${chatId}`)
        await ref.remove()        
    } catch (error) {
        console.error(error)
        throw new Error('Unable to delete chat')
    }
}

export const getChatSummary = async (uid: string, chatId: number) => {
    try {
        const db = admin.database()
        const ref = db.ref(`/${uid}/chats/${chatId}`)
        const snapshot = await ref.once('value')
        const data = snapshot.val()

        if(data && data.summary) {
            return data.summary
        }
        
        return ''
        
    } catch (error) {
        console.error(error)
        throw new Error('Unable to get chat summary')
    }
}

export const updateChatSummary = async (uid: string, chatId: number, summary: string) => {
    try {
        const db = admin.database()
        const ref = db.ref(`/${uid}/chats/${chatId}`)
        await ref.update({summary})
    } catch (error) {
        console.error(error)
        throw new Error('Unable to update chat summary')
    }
}