import { Server } from "socket.io"
import http from 'http'
import socketSetListeners from "../listeners/socket.listener"
import { validateFBToken } from "../middlewares/auth.middleware"
import { gateway } from 'auth-services/src/config/index.config'

const ongoingConvo = new Map<string, { abort?: () => void }>();

const socketLoader = (httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    })

    io.use(async (socket, next) => {
        try {
            if(socket.handshake.headers['x-api-gateway-secret'] !== gateway.secret) {
                throw(new Error('Authentication error.'))
            }

            const user = await validateFBToken(socket.handshake.headers.authorization as string)
            socket.data.user = user            
            next()
        } catch (error) {
            socket.disconnect()
            next(new Error('Authentication error.'))
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
            console.info('User disconnected:', uid, reason)
            ongoingConvo.delete(uid);
        })

        socketSetListeners(io, socket, ongoingConvo)
    })

    console.info('Socket Ready!')
}

export default socketLoader
