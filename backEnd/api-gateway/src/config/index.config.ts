import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
})

export const server = {
    port: process.env.PORT,
    host: process.env.HOST || `http://localhost:${process.env.PORT}`
}

export const paths = {
    auth_services: process.env.AUTH_SERVICE
}