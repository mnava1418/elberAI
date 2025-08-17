export enum EmailMessageType {
    UserRequestAccess,
    AdminRequestAccess,
    UserAccessGranted,
    UserAccessDenied
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

export type RequestCodePayload = {
    code: number
}

export type SendEmailInput = {
    to: string,
    subject: string,
    messageType: EmailMessageType
    payload?: RequestAccessPayload | RequestCodePayload | undefined
}
