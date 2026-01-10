import { ClientRequest } from "http";
import { Response, NextFunction, Request } from 'express';
import admin from 'firebase-admin';
import { AuthenticationRequest } from '../interfaces/http.interface';
import { gateway } from "../config/index.config";

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

export const proxy_request = (proxyReq: ClientRequest, req: Request, res: Response) => {
    if(gateway.secret) {
        proxyReq.setHeader('x-api-gateway-secret', gateway.secret)
    }

    // Verificar si req tiene la propiedad user (si pasó por validateFBToken)
    if((req as any).user && (req as any).user.uid) {
        proxyReq.setHeader('x-user-uid', (req as any).user.uid)
    }

    if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
}

export const proxy_error = (err: any, req: Request, res: any) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Upstream unavailable' }));
}