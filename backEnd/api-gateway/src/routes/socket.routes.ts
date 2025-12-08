import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { paths } from '../config/index.config'
import { gateway } from 'auth-services'

const router = Router()

const socketRoutes = () => {
    router.use('/', createProxyMiddleware({
        target: paths.ai_services,
        changeOrigin: true,
        proxyTimeout: 20000,
        timeout: 20000,
        ws: true,
        headers: {
            'x-api-gateway-secret': gateway.secret || ''
        }
    }))

    return router
}

export default socketRoutes
