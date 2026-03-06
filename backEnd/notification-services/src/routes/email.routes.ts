import { Router } from "express";
import * as emailController from "../controllers/email.controller";

const router = Router()

router.post('/requestAccess', emailController.requestAccess)
router.post('/accessResponse', emailController.accessRespose)
router.post('/verifyAccount', emailController.verifyAccount)
router.post('/resetPassword', emailController.resetPassword)
router.post('/send', emailController.send)

export default router