import { Router, Request, Response } from 'express';
import accessRoutes from "./access.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ endPoint: '/auth' });
});

router.use('/access', accessRoutes);
router.use('/user', userRoutes);

export default router;
