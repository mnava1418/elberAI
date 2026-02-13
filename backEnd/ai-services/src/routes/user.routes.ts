import { Router } from "express";
import { deleteProfile } from '../controllers/user.controller'

const router = Router()

router.delete('/', deleteProfile)

export default router