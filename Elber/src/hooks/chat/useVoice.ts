import { useRef, useState } from "react"
import { checkVoicePermissions } from "../../services/entitlements.service"
import { Platform } from "react-native"
import Voice from '@react-native-voice/voice'
import { openSettings } from 'react-native-permissions'
import { ElberAction, ElberResponse } from "../../models/elber.model"
import handleElberResponse from "../../services/elber.service"
import { hideAlert, showAlert } from "../../store/actions/elber.actions"

const ERROR_VOICE: ElberResponse = {
    action: ElberAction.CHAT_TEXT,
    payload: {
        message: "Perdón, me distraje viendo unos memes... ¿puedes repetir lo que dijiste?"
    }
} 

const useVoice = (dispatch: (value: any) => void, onEnd: React.Dispatch<React.SetStateAction<string>>) => {
    const [isListening, setIsListening] = useState(false)
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
            dispatch(showAlert({
                isVisible: true,
                title: 'Micrófono',
                text: 'Elber necesita acceso al micrófono y al reconocimiento de voz para interactuar contigo. Ve a Configuración y habilítalos.',
                btnText: 'Habilitar',
                onPress: () => {
                    openSettings('application')
                    dispatch(hideAlert())
                }
            }))
        }
    }

    const stopListening = async() => {
        try {
            setIsListening(false)
            await Voice.stop()            
        } catch (error) {
            handleElberResponse('elber:error', dispatch, ERROR_VOICE)
        }
    }

    const prepareSpeech = () => {
        Voice.onSpeechStart = () => {
            setIsListening(true)
        }

        Voice.onSpeechEnd = () => {
            setIsListening(false)
            onEnd(message.current)
        }

        Voice.onSpeechResults = (event) => {
            if(event.value) {
                onEnd(event.value[0])
                message.current = event.value[0]
            }
        }

        Voice.onSpeechError = (error) => {            
            setIsListening(false)
            handleElberResponse('elber:error', dispatch, ERROR_VOICE)
        };
    }

    const removeSpeechListener = () => {
        Voice.destroy().then(Voice.removeAllListeners)        
    }
    
    return { isListening, startListening, prepareSpeech, removeSpeechListener, stopListening }
}

export default useVoice