export type RequestAccessModel = {
    isApproved: boolean,
    requestTime?: number
    approvedTime?: number | null,
    code?: number | null,
}