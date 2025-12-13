import { ElberState } from "../../store/reducers/elber.reducer"
import { selectElberIsStreaming, selectIsWaitingForElber } from "../../store/selectors/elber.selector"

const useElberStatus = (state: ElberState) => {
    const isWaiting = selectIsWaitingForElber(state)
    const isStreaming = selectElberIsStreaming(state)
    
    return { isStreaming, isWaiting }
}

export default useElberStatus