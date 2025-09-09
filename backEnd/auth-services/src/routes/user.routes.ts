import { Router } from "express";
import * as userController from "../controllers/user.controller";

const router = Router();

router.post('/signUp', userController.signUp);
router.post('/resetPassword', userController.resetPassword);

export default router;