import { ElberState } from "../../store/reducers/elber.reducer"
import { selectElberIsStreaming, selectElberIsTalking, selectIsWaitingForElber, selectVoiceMode } from "../../store/selectors/elber.selector"

const useElberStatus = (state: ElberState) => {
    const isWaiting = selectIsWaitingForElber(state)
    const isStreaming = selectElberIsStreaming(state)
    const voiceMode = selectVoiceMode(state)
    const isTalking = selectElberIsTalking(state)
    
    return { isStreaming, isWaiting, voiceMode, isTalking }
}

export default useElberStatus