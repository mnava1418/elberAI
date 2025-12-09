import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../models/http:model';

export const requestAccess = async (req: Request, res: Response) => {
    try {
        const {email} = req.body
        const {message} = await authService.requestAccess(email);
        res.status(200).json({ message });
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

export const validateAccessCode = async (req: Request, res: Response) => {
    try {
        const { email, accessCode } = req.body;
        const result = await authService.validateAccessCode(email, parseInt(accessCode));
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}