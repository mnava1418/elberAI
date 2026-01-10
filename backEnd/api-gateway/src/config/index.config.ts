import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
})

export const server = {
    port: process.env.GATEWAY_PORT,
    host: process.env.HOST || `http://localhost:${process.env.GATEWAY_PORT}`
}

export const paths = {
    auth_services: process.env.AUTH_SERVICE,
    ai_services: process.env.AI_SERVICE
}

export const firebase = {
    cred: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    db: process.env.FIREBASE_DB
}

export const gateway = {
    secret: process.env.GATEWAY_SECRET
}