import { ClientRequest } from "http";
import { Request, Response, NextFunction } from "express";
import { gateway } from "../config/index.config"
import { AuthenticationRequest } from "../interfaces/http.interface"

export const proxy_request = (proxyReq: ClientRequest, req: AuthenticationRequest, res: Response) => {
    if(gateway.secret) {
        proxyReq.setHeader('x-api-gateway-secret', gateway.secret)
    }

    if(req.user && req.user.uid) {
        proxyReq.setHeader('x-user-uid', req.user.uid)
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
