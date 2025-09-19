import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
})

export const server = {
    port: process.env.PORT,
    host: process.env.HOST || `http://localhost:${process.env.PORT}`,
    gateway: process.env.API_GATEWAY
}

export const firebase = {
    cred: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    db: process.env.FIREBASE_DB
}

export const auth = {
    token: process.env.JWT_TOKEN,
}

export const notification = {
    email: {
        from: 'martin@namart.tech'
    }
}

export const gateway = {
    secret: process.env.GATEWAY_SECRET
}
