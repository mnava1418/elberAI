import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { paths } from '../config/index.config'
import { proxy_error, proxy_request } from "../middlewares/auth.middleware";

const router = Router()

const aiRoutes = () => {
    router.use('/', createProxyMiddleware({
        target: paths.ai_services,
        changeOrigin: true,
        proxyTimeout: 20000,
        timeout: 20000,
        pathRewrite: { '/ai':'/' },
        on: {
            proxyReq: proxy_request,
            error: proxy_error
        }
    }) as any)

    return router
}

export default aiRoutes