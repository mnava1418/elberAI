import { EmailMessageType, SendEmailInput } from "notification-services/src/types/email.type";
import { getRequestStatus } from "./auth.service";
import admin from 'firebase-admin'
import { sendEmail } from "notification-services/src/services/email.service";

export const signUp = async (email: string, password: string, displayName: string): Promise<{ registered: boolean, message: string }> => {
    try {
        const requestStatus = await getRequestStatus(email)

        if (requestStatus && requestStatus.status !== 'approved') {
            return { registered: false, message: '¡Aguántame tantito! Tu solicitud todavía no pasa el visto bueno del admin. Espera a que te den luz.' };
        }

        let userRecord
        try {
            userRecord = await admin.auth().getUserByEmail(email)    
        } catch (error: any) {
            if(error.errorInfo.code !=='auth/user-not-found') {
                console.error(error);
                throw new Error('Unable to create user account.');        
            }
        }
        
        if (userRecord) {
            return { registered: false, message: '¡Épale! Ese correo ya está dado de alta, busca otro.' };
        }

        const newUser = await admin.auth().createUser({email, password, displayName, emailVerified: false})
        sendVerifyEmail(email, displayName)

        return { registered: true, message: ''}
    } catch (error) {
        console.error(error);
        throw new Error('Unable to create user account.');
    }
};

const sendVerifyEmail = async (email: string, name: string) => {
    const link = await admin.auth().generateEmailVerificationLink(email)
    const verifyEmailInput: SendEmailInput = {
        to: email,
        subject: '¡Ya casi! Verifica tu correo para terminar',
        messageType: EmailMessageType.VerifyEmail,
        payload: {name, link}
    }

    sendEmail(verifyEmailInput)
}

export const resetPassword = async (email: string): Promise<string> => {
    try {
        const userRecord = await admin.auth().getUserByEmail(email)    
        if(!userRecord) {
            return '¡Échale un ojito a tu correo! Si está registrado, ya te mandamos el link para que recuperes tu password.';
        }

        const recoverLink = await admin.auth().generatePasswordResetLink(email)
        const recoverPasswordInput: SendEmailInput = {
            to: email,
            subject: 'Recupera tu password',
            messageType: EmailMessageType.RecoverPassword,
            payload: {recoverLink}
        }
    
        sendEmail(recoverPasswordInput)
    } catch (error) {
        console.error(error);
    } finally {
        return '¡Échale un ojito a tu correo! Si está registrado, ya te mandamos el link para que recuperes tu password.';
    }
}