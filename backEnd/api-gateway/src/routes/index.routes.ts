import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import aiRoutes from './ai.routes';
import { validateFBToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'ELBER API Gateway is running!' });
});

router.use('/auth', authRoutes())
router.use('/ai', validateFBToken, aiRoutes())

export default router;