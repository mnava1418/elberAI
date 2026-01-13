import { Request, Response } from "express";
import { sendEmail } from "../services/email.service";
import { EmailMessageType, SendEmailInput } from "../types/email.type";
import { email } from '../config/index.config'

export const requestAccess = (req: Request, res: Response) => {
    try {
        const { userEmail, approveURL, rejectURL} = req.body

        const userRequestInput: SendEmailInput = {
            to: userEmail,
            subject: '¡Recibimos tu solicitud de acceso!',
            messageType: EmailMessageType.UserRequestAccess
        }

        const adminRequestInput: SendEmailInput = {
            to: email.from,
            subject: '¡Alerta de nuevo solicitante!',
            messageType: EmailMessageType.AdminRequestAccess,
            payload: { userEmail, approveURL, rejectURL}
        }

        sendEmail(userRequestInput)
        sendEmail(adminRequestInput)

    } catch (error) {
        console.error('Error sending access request emails', error)
    }
    
    res.json({result: true}).status(200)
}

export const accessRespose = (req: Request, res: Response) => {
    try {
        const {email, isApproved, accessCode} = req.body

        const adminResponseInput: SendEmailInput = {
            to: email,
            subject: isApproved ? '¡Felicidades, tu acceso fue aprobado!' : '¡Chale, tu acceso fue rechazado!',
            messageType: isApproved ? EmailMessageType.UserAccessGranted : EmailMessageType.UserAccessDenied,
            payload: isApproved && accessCode !== null ? { code: accessCode } : undefined
        };

        sendEmail(adminResponseInput);
        
    } catch (error) {
        console.error('Error sending access response email', error)
    }

    res.json({result: true}).status(200)
}

export const verifyAccount = (req: Request, res: Response) => {
    try {
        const { email, name, link } = req.body
        
        const verifyEmailInput: SendEmailInput = {
            to: email,
            subject: '¡Ya casi! Verifica tu correo para terminar',
            messageType: EmailMessageType.VerifyEmail,
            payload: {name, link}
        }

        sendEmail(verifyEmailInput)

    } catch (error) {
        console.error('Error sending access response email', error)
    }

    res.json({result: true}).status(200)
}