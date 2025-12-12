import { ElberEvent, ElberResponse } from "../models/elber.model";
import { addChatMessage, elberIsStreaming, isWaitingForElber, processChatStream } from "../store/actions/elber.actions";
import { ElberMessage } from "../store/reducers/elber.reducer";

const handleElberResponse = (event: ElberEvent, dispatch: (value: any) => void, response: ElberResponse | string | undefined = undefined) => {
    switch (event) {
        case 'elber:response':
            handleResponseEvent(dispatch)
            break;
        case 'elber:stream':
            handleStreamEvent(dispatch, response as string)
            break;
        case 'elber:error':
            handleErrorEvent(dispatch, response as ElberResponse)
            break;
        default:
            break;
    }
}

const handleResponseEvent = (dispatch: (value: any) => void) => {
    dispatch(elberIsStreaming(false))
}

const handleStreamEvent = (dispatch: (value: any) => void, response: string) => {
    dispatch(elberIsStreaming(true))
    dispatch(isWaitingForElber(false))
    dispatch(processChatStream(response))  
}

const handleErrorEvent = (dispatch: (value: any) => void, response: ElberResponse) => {
    dispatch(elberIsStreaming(false))
    dispatch(isWaitingForElber(false))
    
    const timeStamp = new Date().getTime()
    const chatMessage: ElberMessage = {
        id: `assistant:${timeStamp}`,
        createdAt: timeStamp,
        role: 'assistant',
        content: response.payload.message
    }

    dispatch(addChatMessage(chatMessage))
}

export default handleElberResponse