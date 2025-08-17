export enum EmailMessageType {
    UserRequestAccess,
    AdminRequestAccess
}

export type MailOptions = {
    from: string,
    subject: string
    html: string
    bcc?: string[],
    to? : string
}

export type RequestAccessPayload = {
    userEmail: string
    approveURL: string
    rejectURL: string
}

export type SendEmailInput = {
    to: string,
    subject: string,
    messageType: EmailMessageType
    payload?: RequestAccessPayload
}
