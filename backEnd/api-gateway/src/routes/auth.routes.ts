import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { paths } from '../config/index.config'
import { proxy } from 'auth-services/src/common'

const router = Router()

const authRoutes = () => {
    router.use('/', createProxyMiddleware({
        target: paths.auth_services,
        changeOrigin: true,
        proxyTimeout: 20000,
        timeout: 20000,
        pathRewrite: { '/auth':'/' },
        on: {
            proxyReq: proxy.proxy_request,
           error: proxy.proxy_error
        }
    }))

    return router
}

export default authRoutes