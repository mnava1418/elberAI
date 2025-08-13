import admin from 'firebase-admin'
import { RequestAccessModel } from '../models/auth.model';

export const requestAccess = async (email: string) => {
    try {
        email = email.replace('@', '').replace('.', '')
        const db = admin.database()        
        const ref = db.ref(`/auth/request/${email}`)
        
        const requestMessage: RequestAccessModel = {
            requestTime: Date.now(),
            approvedTime: null,
            code: null,
            isApproved: false
        }

        await ref.update(requestMessage)        
    } catch (error) {
        console.error(error)
        throw new Error('Unable to request access')
    }
};