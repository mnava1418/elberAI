import { Router, Request, Response } from 'express';
import chatRoutes from './chat.routes'
import userRoutes from './user.routes'

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'ELBER AI Services is running!' });
});

router.use('/chat', chatRoutes)
router.use('/user', userRoutes)

export default router