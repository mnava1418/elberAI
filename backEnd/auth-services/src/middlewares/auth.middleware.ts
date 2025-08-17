import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../config/index.config';
import { AuthRequest } from '../models/http:model';

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token as string;

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, auth.token as string);
        (req as AuthRequest).payload = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });

   }
}