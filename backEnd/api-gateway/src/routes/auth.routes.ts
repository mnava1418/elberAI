import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { paths } from '../config/index.config'
import { proxy_request, proxy_error } from 'auth-services'

const router = Router()

const llegamosrouter = (req: any, res: any, next: any) => {
    console.log('auth gateway')
    next()
}

const authRoutes = () => {
    router.use('/', llegamosrouter, createProxyMiddleware({
        target: paths.auth_services,
        changeOrigin: true,
        proxyTimeout: 20000,
        timeout: 20000,
        pathRewrite: { '/auth':'/' },
        on: {
            proxyReq: proxy_request,
            error: proxy_error
        }
    }) as any)

    return router
}

export default authRoutes