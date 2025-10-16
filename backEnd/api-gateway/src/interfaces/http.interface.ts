import admin from 'firebase-admin'
import { Request } from 'express'

export interface AuthenticationRequest extends Request {
    user?: admin.auth.DecodedIdToken
}