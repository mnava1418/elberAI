import { Request, Response } from "express";
import * as chatService from '../services/chat.service'

export const getUserChats = async (req: Request, res: Response) => {
    try {
        const { uid } = req.body
        const chats = await chatService.getUserChats(uid)        
        res.status(200).json({chats})
    } catch (error) {
        res.status(200).json({chats: {}})
    }
}