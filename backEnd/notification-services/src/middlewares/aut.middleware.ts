import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { auth } from "../config/index.config";

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authToken = req.headers.authorization

        if(!authToken) {
            res.status(403).json({error: 'Invalid Call.'})
            return
        }

        const token = authToken.split(' ')[1]
        jwt.verify(token, auth.token as string);
        next();
    } catch (err) {
        res.status(403).json({error: 'Invalid Call.'})
   }
}

