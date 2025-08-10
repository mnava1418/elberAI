import { Router } from 'express';
import { requestAccess } from '../controllers/auth.controller';

const router = Router();

router.post('/requestAccess', requestAccess);

export default router;
