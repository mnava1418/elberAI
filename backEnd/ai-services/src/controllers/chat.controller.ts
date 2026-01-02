import { Request, Response } from "express";
import * as chatService from '../services/chat.service'

export const getUserChats = async (req: Request, res: Response) => {
    try {
        const uid = req.headers['x-user-uid'] as string

        if(!uid) {
            return res.status(400).json({error: 'Missing user uid'})
        }

        const chats = await chatService.getUserChats(uid)        
        res.status(200).json({chats})
    } catch (error) {
        res.status(200).json({chats: {}})
    }
}

export const deleteUserChat = async (req: Request, res: Response) => {
    try {
        const uid = req.headers['x-user-uid'] as string
        const { chatId } = req.body
        
        if (!uid || !chatId) {
            return res.status(400).json({error: 'Missing uid or chatId'})
        }
        
        await chatService.deleteChat(uid, chatId)        
        res.status(200).json({message: 'Chat eliminado exitosamente'})
    } catch (error) {
        console.error('Delete chat error:', error)
        res.status(500).json({error: 'Error al eliminar el chat'})
    }
}