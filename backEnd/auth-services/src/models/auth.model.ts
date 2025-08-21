export enum RequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    REGISTERED = 'registered'
}

export type RequestAccessModel = {
    status: RequestStatus,
    requestTime?: number
    approvedTime?: number,
    registeredTime?: number,
    code?: number,
}

export type RequestStatusModel = {
    status?: RequestStatus,
    code?: number
}

export type RequestResponseModel = {
    status: RequestStatus,
    message: string
}