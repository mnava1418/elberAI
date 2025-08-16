import admin from 'firebase-admin'
import { RequestAccessModel } from '../models/auth.model';
import { emailServices } from 'notification-services/src'

export const requestAccess = async (email: string) => {
    try {
        const emailKey = email.replace('@', '').replace('.', '')
        const db = admin.database()        
        const ref = db.ref(`/auth/request/${emailKey}`)
        
        const requestMessage: RequestAccessModel = {
            requestTime: Date.now(),
            approvedTime: null,
            code: null,
            isApproved: false
        }

        await ref.update(requestMessage)
        .then(() => {
            emailServices.sendEmail(email, '¡Recibimos tu solicitud de acceso!', emailServices.EmailMessage.UserRequestAccess)
        })
    } catch (error) {
        console.error(error)
        throw new Error('Unable to request access')
    }
};