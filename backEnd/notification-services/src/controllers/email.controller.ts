import { Request, Response } from "express";
import { sendEmail } from "../services/email.service";
import { EmailMessageType, SendEmailInput } from "../types/email.type";
import { email } from '../config/index.config'

export const requestAccess = (req: Request, res: Response) => {
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
    
    try {
        sendEmail(userRequestInput)
        sendEmail(adminRequestInput)
    } catch (error) {
        console.error('Error sending access request emails', error)
    }
    
    res.json({result: true}).status(200)
}