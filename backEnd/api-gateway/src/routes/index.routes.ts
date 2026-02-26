import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import aiRoutes from './ai.routes';
import notificationRoutes from './notification.routes';
import { validateFBToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'ELBER API Gateway is running!' });
});

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ endPoint: '/apiGateway' });
});

router.use('/auth', authRoutes())
router.use('/ai', validateFBToken, aiRoutes())
router.use('/notification', notificationRoutes())

export default router;