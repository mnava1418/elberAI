import { Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { AuthenticationRequest } from '../interfaces/http.interface';

export const validateFBToken = (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        const authToken = req.headers.authorization

        if(!authToken) {
            res.status(401).json({error: 'Unauthorized user.'})
            return
        }

        const token = authToken.split(' ')[1]
        admin.auth().verifyIdToken(token as string)
        .then(user => {
            req.user = user
            next()
        })
        .catch(() => {
            res.status(401).json({error: 'Unauthorized user.'})
        })
        
    } catch (error) {
        res.status(401).json({error: 'Unauthorized user.'})
    }
}