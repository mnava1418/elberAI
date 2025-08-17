import fs from 'fs'
import { adminRequestAccessTemplate, userRequestAccessTemplate } from '../templates/email.template'
import { email } from '../config/index.config'
import nodemailer from 'nodemailer'
import { EmailMessageType, MailOptions, SendEmailInput } from '../types/email.type'

const getMessage = ({messageType, payload}: SendEmailInput) => {
    switch (messageType) {
        case EmailMessageType.UserRequestAccess:
            return userRequestAccessTemplate()           
        case EmailMessageType.AdminRequestAccess:
            if (payload) {
                const {userEmail, approveURL, rejectURL} = payload
                return adminRequestAccessTemplate(userEmail, approveURL, rejectURL)
            } else {
                return ''
            }
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

export const sendEmail = async (input: SendEmailInput) => {
    const { to, subject } = input
    const html = getMessage(input)    
    const from = `"Elber" <${email.from}>`
    const mailOptions: MailOptions = { from, subject, html }

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
