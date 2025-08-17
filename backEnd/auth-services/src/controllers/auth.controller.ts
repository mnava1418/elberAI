import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../models/http:model';

export const requestAccess = async (req: Request, res: Response) => {
    try {
        const {email} = req.body
        await authService.requestAccess(email);
        res.status(200).json({ message: 'Hemos recibido tu solicitud. Revisa tu correo electrónico para más instrucciones.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const reviewAccess = async (req: Request, res: Response) => {
    try {
        const { email, isApproved } = (req as AuthRequest).payload as { email: string; isApproved: boolean };
        await authService.reviewAccess(email, isApproved);
        res.status(200).json({ message: 'Revisión de acceso completada.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}