import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import socketRoutes from './socket.routes';
import { validateFBToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'ELBER API Gateway is running!' });
});

router.use('/auth', authRoutes())
router.use('/socket.io', validateFBToken, socketRoutes())

export default router;