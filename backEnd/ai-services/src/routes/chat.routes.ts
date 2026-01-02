import { Router } from "express";
import { deleteUserChat, getUserChats } from '../controllers/chat.controller'

const router = Router()

router.get('/', getUserChats)
router.delete('/', deleteUserChat)

export default router