import admin from 'firebase-admin'
import { ElberMessage, ElberRole } from '../models/elber.model'

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
        const ref = db.ref(`/chat/${uid}/${chatId}/messages/${message.createdAt}`)
        await ref.update(message)        
    } catch (error) {
        console.error(error)
        throw new Error('Unable to save chat message')
    }
}
