import { Router } from "express";
import accessRoutes from "./access.routes";

const router = Router();

router.use('/access', accessRoutes);

export default router;
