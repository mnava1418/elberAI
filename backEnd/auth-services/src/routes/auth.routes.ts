import { Router } from 'express';
import { requestAccess, reviewAccess } from '../controllers/auth.controller';
import { validateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/requestAccess', requestAccess);
router.get('/reviewAccess', validateToken, reviewAccess);

export default router;
