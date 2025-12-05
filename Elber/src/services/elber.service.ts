import { ElberEvent, ElberResponse } from "../models/elber.model";
import { elberIsStreaming, isWaitingForElber, processChatStream } from "../store/actions/elber.actions";

const handleElberResponse = (event: ElberEvent, dispatch: (value: any) => void, response: ElberResponse | undefined = undefined) => {
    switch (event) {
        case 'elber:canceled':
            handleCancelEvent(dispatch)
            break;
        case 'elber:response':
            handleResponseEvent(dispatch)
            break;
        case 'elber:stream':
            handleStreamEvent(dispatch, response as ElberResponse)
            break;
        default:
            break;
    }
}

const handleCancelEvent = (dispatch: (value: any) => void) => {
    dispatch(elberIsStreaming(false))
}

const handleResponseEvent = (dispatch: (value: any) => void) => {
    dispatch(elberIsStreaming(false))
}

const handleStreamEvent = (dispatch: (value: any) => void, response: ElberResponse) => {
    dispatch(elberIsStreaming(true))
    dispatch(isWaitingForElber(false))
    dispatch(processChatStream(response.payload.delta))  
}

export default handleElberResponse