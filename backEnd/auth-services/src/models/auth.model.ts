export type RequestAccessModel = {
    requestTime: number,
    approvedTime: number | null,
    code: number | null,
    isApproved: boolean,
}