import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { paths } from '../config/index.config'
import { proxy_error, proxy_request } from "../middlewares/auth.middleware";

const router = Router()

const notificationRoutes = () => {
    router.use('/', createProxyMiddleware({
        target: paths.notification_services,
        changeOrigin: true,
        proxyTimeout: 20000,
        timeout: 20000,
        pathRewrite: { '/notification':'/' },
        on: {
            proxyReq: proxy_request,
            error: proxy_error
        }
    }) as any)

    return router
}

export default notificationRoutes