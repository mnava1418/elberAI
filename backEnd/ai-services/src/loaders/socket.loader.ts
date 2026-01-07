import { Server } from "socket.io"
import http from 'http'
import socketSetListeners from "../listeners/socket.listener"
import { validateFBToken } from "../middlewares/auth.middleware"

const socketLoader = (httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        // Configuración para mejor estabilidad
        pingTimeout: 60000,     // 60 segundos antes de considerar desconectado
        pingInterval: 25000,    // Ping cada 25 segundos
        connectTimeout: 45000,  // 45 segundos para conectar
        allowEIO3: true,        // Compatibilidad con versiones anteriores
        transports: ['websocket'] // Solo websocket para mejor rendimiento
    })

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                console.error('Socket connection attempt without token');
                return next(new Error('No authentication token provided'));
            }
            
            const user = await validateFBToken(token)
            socket.data.user = user            
            console.info('Socket authenticated for user:', user.uid);
            next()
        } catch (error) {
            console.error('Socket authentication failed:', error);
            socket.disconnect()
            next(new Error('Authentication error'))
        }
    })

    io.on('connection', (socket) => {
        const uid = socket.data.user.uid
        console.info('User connected:', uid)

        if (uid) {
            socket.join(uid);
            console.info('Private room created:', uid);
        }

        socket.on('disconnect', (reason) => {
            console.info(`User disconnected: ${uid} | Reason: ${reason}`)            
            // Log adicional para debugging
            if (reason === 'client namespace disconnect') {
                console.info('Client disconnected intentionally');
            } else if (reason === 'ping timeout') {
                console.warn('Client disconnected due to ping timeout - possible network issues');
            } else if (reason === 'transport close') {
                console.info('Transport connection closed');
            }
        })

        socketSetListeners(io, socket)
    })

    console.info('Socket Ready!')
}

export default socketLoader
