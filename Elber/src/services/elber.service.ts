import { ElberMessage } from "../models/chat.model";
import { ElberChatResponse, ElberEvent } from "../models/elber.model";
import { addChatMessage, processStream, updateChatTitle } from "../store/actions/chat.actions";
import { elberIsStreaming, isWaitingForElber } from "../store/actions/elber.actions";

const handleChatResponse = (dispatch: (value: any) => void, event: ElberEvent, chatResponse: ElberChatResponse) => {
    switch (event) {
        case 'elber:response':
            handleResponseEvent(dispatch)
            break;
        case 'elber:stream':
            handleStreamEvent(dispatch, chatResponse)
            break;
        case 'elber:error':
            handleErrorEvent(dispatch, chatResponse)
            break;
        case 'elber:title':
            handleTitleEvent(dispatch, chatResponse)
        default:
            break;
    }
}

const handleResponseEvent = (dispatch: (value: any) => void) => {
    dispatch(elberIsStreaming(false))
}

const handleStreamEvent = (dispatch: (value: any) => void, chatResponse: ElberChatResponse) => {
    dispatch(elberIsStreaming(true))
    dispatch(isWaitingForElber(false))
    dispatch(processStream(chatResponse.text))  
}

const handleErrorEvent = (dispatch: (value: any) => void, chatResponse: ElberChatResponse) => {
    dispatch(elberIsStreaming(false))
    dispatch(isWaitingForElber(false))
    
    const timeStamp = Date.now()
    const chatMessage: ElberMessage = {
        id: `assistant:${timeStamp}`,
        createdAt: timeStamp,
        role: 'assistant',
        content: chatResponse.text
    }

    dispatch(addChatMessage(chatResponse.chatId, chatMessage))
}

const handleTitleEvent = (dispatch: (value: any) => void, chatResponse: ElberChatResponse) => {
    dispatch(updateChatTitle(chatResponse.text))
}

export default handleChatResponse