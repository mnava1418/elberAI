import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'ELBER API Gateway is running!' });
});

router.use('/auth', authRoutes())

export default router;