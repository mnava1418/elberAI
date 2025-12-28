import { Router, Request, Response } from 'express';
import chatRoutes from './chat.routes'

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'ELBER AI Services is running!' });
});

router.use('/chat', chatRoutes)

export default router