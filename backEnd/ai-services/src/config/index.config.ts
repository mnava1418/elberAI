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

export const postgres = {
    db: process.env.PG_DB
}

export const serper = {
    searchURL: 'https://google.serper.dev/search',
    secret: process.env.SERPER_API_KEY
}

export const aws = {
    id: process.env.AWS_ACCESS_KEY_ID || '',
    secret: process.env.AWS_SECRET_ACCESS_KEY || ''
}

export const models = {
    gpt: 'gpt-4o-mini'
}

export const weather = {
    api_key: process.env.OPENWEATHER_API_KEY
}