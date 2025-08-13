import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
})

export const server = {
    port: process.env.PORT
}

export const firebase = {
    cred: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    db: process.env.FIREBASE_DB
}