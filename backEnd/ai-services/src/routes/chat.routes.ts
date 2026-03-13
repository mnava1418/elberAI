import { Router } from "express";
import { deleteUserChat, getUserChats, deleteAllUserChats } from '../controllers/chat.controller'

const router = Router()

router.get('/', getUserChats)
router.delete('/', deleteUserChat)
router.delete('/all', deleteAllUserChats)

export default router