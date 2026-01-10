import admin from 'firebase-admin';
import { Request, Response, NextFunction } from "express";
import { gateway } from '../config/index.config';

export const validateFBToken = async (token: string) => {
    try {
        const user = await admin.auth().verifyIdToken(token)
        return user        
    } catch (error) {
        throw(new Error('Authentication error'))
    }
}

export const proxy_validate = (req: Request, res: Response, next: NextFunction) => {
    try {
        console.info('Validating rest call...')
        const headers = req.headers

        if(headers['x-api-gateway-secret'] === gateway.secret) {
            next()
        } else {
            res.status(403).json({error: 'Invalid Call.'})
        }        
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Error Server.'})
    }
}