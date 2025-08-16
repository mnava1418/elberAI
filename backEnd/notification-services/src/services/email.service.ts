import fs from 'fs'
import { userRequestAccessTemplate } from '../templates/email.template'
import { email } from '../config/index.config'
import nodemailer from 'nodemailer'

export enum EmailMessage {
    UserRequestAccess
}

type MailOptions = {
    from: string,
    subject: string
    html: string
    bcc?: string[],
    to? : string
}

const getMessage = (messageType: EmailMessage) => {
    switch (messageType) {
        case EmailMessage.UserRequestAccess:
            return userRequestAccessTemplate()           
        default:
            return ''
    }
}

const createTransporter = () => {
    if (!email.cred || typeof email.cred !== 'string') {
        throw new Error('Email credentials file path is not defined or not a string.')
    }
    const credentials = JSON.parse(fs.readFileSync(email.cred, 'utf-8'))
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: email.from,
            serviceClient: credentials['client_id'],
            privateKey: credentials['private_key']
        }        
    })

    return transporter
}

export const sendEmail = async (to: string, subject: string, messageType: EmailMessage ) => {
    const html = getMessage(messageType)    
    const from = `"Elber" <${email.from}>`
    const mailOptions: MailOptions = { from, subject, html}

    const addresses = to.split(',')

    if(to.length > 1) {
        mailOptions.bcc = addresses
    } else {
        mailOptions.to = addresses[0]
    }
    
    const transporter = createTransporter()

    transporter.sendMail(mailOptions)
    .then(info => {
        console.info(`Email sent: ${info.messageId}`)        
        transporter.close()
    })
    .catch(error => {
        console.error(`Error: ${error}`)  
        transporter.close()      
    })
}
