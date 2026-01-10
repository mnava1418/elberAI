import { Request, Response, NextFunction } from "express";
import { gateway } from "../config/index.config";

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