import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
})

export const email = {
    cred: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    from: 'martin@namart.tech'
}

export const gateway = {
    secret: process.env.GATEWAY_SECRET
}

export const server = {
    port: process.env.NOTIFICATION_PORT,
}