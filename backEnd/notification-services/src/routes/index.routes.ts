import { Router, Request, Response } from 'express';
import emailRoutes from './email.routes'

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'ELBER Notification Services is running!' });
});

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ endPoint: '/notification' });
});

router.use('/email', emailRoutes)

export default router