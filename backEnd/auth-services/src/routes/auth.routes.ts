import { Router } from 'express';
import { requestAccess, reviewAccess, validateAccessCode } from '../controllers/auth.controller';
import { validateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/requestAccess', requestAccess);
router.get('/reviewAccess', validateToken, reviewAccess);
router.post('/validateAccessCode', validateAccessCode);

export default router;
