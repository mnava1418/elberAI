import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import indexRoutes from './routes/index.routes';

const app = express();

const setMiddlewares = () => {
    // Seguridad
    app.use(helmet());
    app.use(cors({
        origin: process.env.WEB_ORIGIN,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json()); // Para parsear JSON bodies
    app.use(express.urlencoded({ extended: true }));
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // Limite por IP
    }));

    app.use((req, res, next) => {
        console.info('Call to api gateway...')
        next()
    })
}

const setRoutes = () => {
    app.use('/', indexRoutes);
}

setMiddlewares()
setRoutes()

export default app
