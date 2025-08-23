import { Router } from "express";
import accessRoutes from "./access.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use('/access', accessRoutes);
router.use('/user', userRoutes);

export default router;
