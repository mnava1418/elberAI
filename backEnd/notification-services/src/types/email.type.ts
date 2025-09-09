export enum EmailMessageType {
    UserRequestAccess,
    AdminRequestAccess,
    UserAccessGranted,
    UserAccessDenied,
    VerifyEmail,
    RecoverPassword
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

export type VerifyEmailPayload = {
    name: string,
    link: string
}

export type RecoverPasswordPayload = {
    recoverLink: string
}

export type SendEmailInput = {
    to: string,
    subject: string,
    messageType: EmailMessageType
    payload?: RequestAccessPayload | RequestCodePayload | VerifyEmailPayload | RecoverPasswordPayload | undefined
}
