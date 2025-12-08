import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { proxy_validate } from 'auth-services'

import indexRoutes from './routes/index.routes';

const app = express();

const setMiddlewares = () => {
    // Seguridad
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // Limite por IP
    }));
    app.use(proxy_validate)
}

const setRoutes = () => {
    app.use('/', indexRoutes);
}

setMiddlewares()
setRoutes()

export default app
