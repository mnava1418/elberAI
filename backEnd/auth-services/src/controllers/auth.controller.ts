import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const requestAccess = async (req: Request, res: Response) => {
    try {
        const {email} = req.body
        await authService.requestAccess(email);
        res.status(201).json({ message: 'Se pidio acceso para' + email });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
