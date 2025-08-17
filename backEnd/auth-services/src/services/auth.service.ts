import admin from 'firebase-admin'
import { RequestAccessModel } from '../models/auth.model';
import { sendEmail } from 'notification-services/src/services/email.service';
import { SendEmailInput, EmailMessageType } from 'notification-services/src/types/email.type';
import { server, notification, auth } from '../config/index.config';
import jwt from 'jsonwebtoken';

export const generateToken = (payload: object) => {
    return jwt.sign(payload, auth.token as string);
};

export const requestAccess = async (email: string) => {
    try {
        const emailKey = email.replace('@', '').replace('.', '')
        const db = admin.database()        
        const ref = db.ref(`/auth/request/${emailKey}`)
        
        const requestMessage: RequestAccessModel = {
            requestTime: Date.now(),
            isApproved: false
        }

        await ref.update(requestMessage)
        sendRequestEmails(email)
    } catch (error) {
        console.error(error)
        throw new Error('Unable to request access')
    }
};

export const reviewAccess = async (email: string, isApproved: boolean) => {
    try {
        const emailKey = email.replace('@', '').replace('.', '');
        const db = admin.database();
        const ref = db.ref(`/auth/request/${emailKey}`);
        const accessCode = isApproved ? generateAccessCode() : null;

        const requestMessage: RequestAccessModel = {
            approvedTime: isApproved ? Date.now() : null,
            code: accessCode,
            isApproved
        }

        await ref.update(requestMessage);
        sendAccessResponseEmail(email, isApproved, accessCode);
    } catch (error) {
        console.error(error);
        throw new Error('Unable to review access');
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

const sendAccessResponseEmail = (email: string, isApproved: boolean, accessCode: number | null) => {
    const adminResponseInput: SendEmailInput = {
        to: email,
        subject: isApproved ? '¡Felicidades, tu acceso fue aprobado!' : '¡Chale, tu acceso fue rechazado!',
        messageType: isApproved ? EmailMessageType.UserAccessGranted : EmailMessageType.UserAccessDenied,
        payload: isApproved && accessCode !== null ? { code: accessCode } : undefined
    };

    sendEmail(adminResponseInput);
};

const generateAccessCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
