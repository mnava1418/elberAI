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
    auth_services: process.env.AUTH_SERVICE
}