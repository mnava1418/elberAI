import { Router } from "express";
import * as emailController from "../controllers/email.controller";

const router = Router()

router.post('/requestAccess', emailController.requestAccess)
router.post('/accessResponse', emailController.accessRespose)

export default router