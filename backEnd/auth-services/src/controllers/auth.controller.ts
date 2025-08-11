import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const requestAccess = async (req: Request, res: Response) => {
    try {
        const {email} = req.body
        await authService.requestAccess(email);
        res.status(200).json({ message: 'Hemos recibido tu solicitud. Revisa tu correo electrónico para más instrucciones.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
