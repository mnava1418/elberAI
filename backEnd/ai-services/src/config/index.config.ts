import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
})

export const server = {
    port: process.env.AI_PORT,
}

export const firebase = {
    cred: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    db: process.env.FIREBASE_DB
}

export const openaiCfg = {
    cred: process.env.OPENAI_API_KEY
}

export const gateway = {
    secret: process.env.GATEWAY_SECRET
}