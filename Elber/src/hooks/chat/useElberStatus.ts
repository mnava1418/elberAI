import { ElberState } from "../../store/reducers/elber.reducer"
import { selectElberIsStreaming, selectIsWaitingForElber, selectVoiceMode } from "../../store/selectors/elber.selector"

const useElberStatus = (state: ElberState) => {
    const isWaiting = selectIsWaitingForElber(state)
    const isStreaming = selectElberIsStreaming(state)
    const voiceMode = selectVoiceMode(state)
    
    return { isStreaming, isWaiting, voiceMode }
}

export default useElberStatus