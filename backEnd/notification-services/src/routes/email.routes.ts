import { Router } from "express";
import * as emailController from "../controllers/email.controller";

const router = Router()

router.post('/request', emailController.requestAccess )

export default router