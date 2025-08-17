import admin from 'firebase-admin'
import { RequestAccessModel } from '../models/auth.model';
import { sendEmail } from 'notification-services/src/services/email.service';
import { SendEmailInput, EmailMessageType } from 'notification-services/src/types/email.type';
import { server, notification, auth } from '../config/index.config';
import jwt from 'jsonwebtoken';

export const generateToken = (payload: object) => {
    if (auth.token && typeof auth.token === 'string') {
          return jwt.sign(payload, auth.token);
    }

    throw new Error('Token is not defined or not a string.');
};

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
        sendRequestEmails(email)
    } catch (error) {
        console.error(error)
        throw new Error('Unable to request access')
    }
};

const sendRequestEmails = (email: string) => {
    const approveToken = generateToken({ email, isApproved: true })
    const rejectToken = generateToken({ email, isApproved: false })
    
    const userRequestInput: SendEmailInput = {
        to: email,
        subject: '¡Recibimos tu solicitud de acceso!',
        messageType: EmailMessageType.UserRequestAccess
    }

    const adminRequestInput: SendEmailInput = {
        to: notification.email.from,
        subject: '¡Alerta de nuevo solicitante!',
        messageType: EmailMessageType.AdminRequestAccess,
        payload: {
            userEmail: email,
            approveURL: `${server.host}/auth/reviewAccess?token=${approveToken}`,
            rejectURL: `${server.host}/auth/reviewAccess?token=${rejectToken}`
        }
    }

    sendEmail(userRequestInput)
    sendEmail(adminRequestInput)
}