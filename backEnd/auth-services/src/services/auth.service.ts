import admin from 'firebase-admin'
import { RequestAccessModel, RequestResponseModel, RequestStatus, RequestStatusModel } from '../models/auth.model';
import { server, notification, auth } from '../config/index.config';
import jwt from 'jsonwebtoken';
import { SendEmailInput, EmailMessageType, sendEmail } from 'notification-services'

export const generateToken = (payload: object) => {
    return jwt.sign(payload, auth.token as string);
};

export const requestAccess = async (email: string): Promise<RequestResponseModel> => {
    try {
        const requestStatus = await getRequestStatus(email);

        if (requestStatus && requestStatus.status === RequestStatus.APPROVED) {
            await reviewAccess(email, true);
            return { status: RequestStatus.APPROVED, message: '¡Tu solicitud ya está aprobada! Checa tu correo.' };
        }

        if (requestStatus && requestStatus.status === RequestStatus.PENDING) {
            return { status: RequestStatus.PENDING, message: 'Tu solicitud está en la fila. ¡Aguanta tantito, ahorita te avisamos!' };
        }

        if (requestStatus && requestStatus.status === RequestStatus.REJECTED) {
            return { status: RequestStatus.REJECTED, message: 'Tu solicitud fue rechazada, pero si de verdad quieres entrarle, mándanos un correo y la volvemos a checar.' };
        }

        const emailKey = email.replace('@', '').replace('.', '')
        const db = admin.database()        
        const ref = db.ref(`/auth/request/${emailKey}`)
        
        const requestMessage: RequestAccessModel = {status: RequestStatus.PENDING, requestTime: Date.now()}
        await ref.update(requestMessage)
        sendRequestEmails(email)
        return { status: RequestStatus.PENDING, message: '¡Listo! Recibimos tu solicitud. Revisa tu correo para más chisme e instrucciones.' };
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

        const accessCode = generateAccessCode();
        let requestMessage: RequestAccessModel = {status: isApproved ? RequestStatus.APPROVED : RequestStatus.REJECTED}

        if(isApproved) {
            requestMessage.approvedTime = Date.now();
            requestMessage.code = accessCode;
        }

        await ref.update(requestMessage);
        sendAccessResponseEmail(email, isApproved, isApproved ? accessCode : null);
    } catch (error) {
        console.error(error);
        throw new Error('Unable to review access');
    }
};

export const validateAccessCode = async (email: string, accessCode: number) => {
    const requestStatus = await getRequestStatus(email);
    if (requestStatus && requestStatus.code === accessCode) {
        return { isValid: true, message: '' };
    }
    
    return { isValid: false, message: 'Tu código no es válido, chécalo bien o pide uno nuevo.' };    
}

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
            approveURL: `${server.gateway}/auth/access/review?token=${approveToken}`,
            rejectURL: `${server.gateway}/auth/access/review?token=${rejectToken}`
        }
    }

    sendEmail(userRequestInput)
    sendEmail(adminRequestInput)
}

export const getRequestStatus = async (email: string): Promise<RequestStatusModel> => {
    try {
        const emailKey = email.replace('@', '').replace('.', '');
        const db = admin.database();
        const ref = db.ref(`/auth/request/${emailKey}`);

        const snapshot = await ref.once('value');
        const data = snapshot.val();

        if(data) {
            return {status: data.status, code: data.code};
        } else {
            return {}
        }
    } catch (error) {
        console.error(error);
        throw new Error('Unable to check user approval status');
    }
};

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
