export type AlertProps = {
    isVisible: boolean,
    title: string,
    text: string,
    btnText: string
    onPress: () => void
}

export type ElberState = {
    isWaiting: boolean,
    isStreaming: boolean,
    isTalking: boolean
    voiceMode: boolean,    
    alert: AlertProps
}

export const initialElberState: ElberState = {
    isWaiting: false,    
    isStreaming: false,
    isTalking: false,
    voiceMode: false,
    alert: {
        isVisible: false,
        title: '',
        text: '',
        btnText: '',
        onPress: () => {}
    }
}

export type ElberAction =
| { type: 'WAITING_FOR_ELBER', isWaiting: boolean }
| { type: 'ELBER_IS_STREAMING', isStreaming: boolean }
| { type: 'ELBER_IS_TALKING', isTalking: boolean}
| { type: 'SHOW_ALERT', alert: AlertProps}
| { type: 'SET_VOICE_MODE', voiceMode: boolean}
| { type: 'HIDE_ALERT' }
| { type: 'LOG_OUT' }

export const elberReducer = (state: ElberState, action: ElberAction): ElberState => {
    switch (action.type) {
        case 'WAITING_FOR_ELBER':
            return {...state, isWaiting: action.isWaiting};
        case 'LOG_OUT':
            return { ...initialElberState };
        case 'ELBER_IS_STREAMING':
            return {...state, isStreaming: action.isStreaming}
        case 'ELBER_IS_TALKING':
            return {...state, isTalking: action.isTalking}
        case 'SHOW_ALERT':
            return {...state, alert: action.alert}
        case 'SET_VOICE_MODE':
            return {...state, voiceMode: action.voiceMode}
        case 'HIDE_ALERT':
            return {...state, alert: {...state.alert, isVisible: false}}
        default:
            return state;
    }
};