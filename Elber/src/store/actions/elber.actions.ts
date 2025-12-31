import { AlertProps, ElberAction } from "../reducers/elber.reducer";

  export const logOutElber = (): ElberAction => ({
    type: 'LOG_OUT'
  })

  export const isWaitingForElber = (isWaiting: boolean): ElberAction => ({
    type: 'WAITING_FOR_ELBER',
    isWaiting
  })

  export const elberIsStreaming = (isStreaming: boolean): ElberAction => ({
    type: 'ELBER_IS_STREAMING',
    isStreaming
  })

  export const showAlert = (alert: AlertProps): ElberAction => ({
    type: 'SHOW_ALERT',
    alert
  })

  export const hideAlert = (): ElberAction => ({
    type: 'HIDE_ALERT'
  })