import { ElberAction, ElberMessage, SelectedMessage } from "../reducers/elber.reducer";

  export const logOutElber = (): ElberAction => ({
    type: 'LOG_OUT'
  })

  export const isWaitingForElber = (isWaiting: boolean): ElberAction => ({
    type: 'WAITING_FOR_ELBER',
    isWaiting
  })

  export const addChatMessage = (newMessage: ElberMessage): ElberAction => ({
    type: 'ADD_CHAT_MESSAGE',
    newMessage
  })

  export const selectChatMessage = (selectedMessage: SelectedMessage): ElberAction => ({
    type: 'SELECT_CHAT_MESSAGE',
    selectedMessage
  })

  export const processChatStream = (chunk: string): ElberAction => ({
    type: 'PROCESS_STREAM',
    chunk
 })

  export const elberIsStreaming = (isStreaming: boolean): ElberAction => ({
    type: 'ELBER_IS_STREAMING',
    isStreaming
  })