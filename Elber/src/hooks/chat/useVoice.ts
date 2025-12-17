import { useRef } from "react"
import { checkVoicePermissions } from "../../services/entitlements.service"
import { Platform } from "react-native"
import Voice from '@react-native-voice/voice'
import { ElberAction, ElberResponse } from "../../models/elber.model"
import handleElberResponse from "../../services/elber.service"

const ERROR_VOICE: ElberResponse = {
    action: ElberAction.CHAT_TEXT,
    payload: {
        message: "Perdón, me distraje viendo unos memes... ¿puedes repetir lo que dijiste?"
    }
} 

const useVoice = (dispatch: (value: any) => void, onEnd: React.Dispatch<React.SetStateAction<string>>) => {
    const isListening = useRef(false)
    const message = useRef('')

    const startListening = async () => {
        const hasVoicePermissions = await checkVoicePermissions(Platform.OS === 'ios' ? 'ios' : 'android')
        .catch(() => false)

        if(hasVoicePermissions) {
            try {
                await Voice.start('es-MX')
            } catch (error) { 
                handleElberResponse('elber:error', dispatch, ERROR_VOICE)
            }
        } else {
            console.log('no tenemos permisos')
            // dispatch(setEntitlementsAlert({
            //     isVisible: true,
            //     title: 'Micrófono',
            //     text: 'Elber necesita acceso al micrófono y al reconocimiento de voz para interactuar contigo. Ve a Configuración y habilítalos.'
            // }))
        }
    }

    const stopListening = async() => {
        try {
            isListening.current = false
            await Voice.stop()            
        } catch (error) {
            handleElberResponse('elber:error', dispatch, ERROR_VOICE)
        }
    }

    const prepareSpeech = () => {
        Voice.onSpeechStart = () => {
            isListening.current = true
        }

        Voice.onSpeechEnd = () => {
            isListening.current = false
            onEnd(message.current)
        }

        Voice.onSpeechResults = (event) => {
            if(event.value) {
                message.current = event.value[0]
            }
        }

        Voice.onSpeechError = (error) => {            
            isListening.current = false
            handleElberResponse('elber:error', dispatch, ERROR_VOICE)
        };
    }

    const removeSpeechListener = () => {
        Voice.destroy().then(Voice.removeAllListeners)        
    }
    
    return { isListening, startListening, prepareSpeech, removeSpeechListener, stopListening }
}

export default useVoice