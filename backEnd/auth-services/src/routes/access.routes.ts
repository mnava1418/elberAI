import { Router } from 'express';
import { requestAccess, reviewAccess, validateAccessCode } from '../controllers/auth.controller';
import { validateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/request', requestAccess);
router.post('/validateCode', validateAccessCode);
router.get('/review', validateToken, reviewAccess);

export default router;
