import { useRef, useState } from "react"
import { checkVoicePermissions } from "../../services/entitlements.service"
import { Platform } from "react-native"
import Voice from '@react-native-voice/voice'
import { openSettings } from 'react-native-permissions'
import { ElberChatResponse } from "../../models/elber.model"
import handleChatResponse from "../../services/elber.service"
import { showAlert } from "../../store/actions/elber.actions"

const SILENCE_TIMEOUT_MS = 2000

const useVoice = (dispatch: (value: any) => void, chatId: number, onEnd: React.Dispatch<React.SetStateAction<string>>) => {
    const [isListening, setIsListening] = useState(false)
    const message = useRef('')
    const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const ERROR_VOICE: ElberChatResponse = {
        chatId,
        text: "Perdón, me distraje viendo unos memes... ¿puedes repetir lo que dijiste?"
    } 

    const startListening = async () => {
        const hasVoicePermissions = await checkVoicePermissions(Platform.OS === 'ios' ? 'ios' : 'android')
        .catch(() => false)

        if(hasVoicePermissions) {
            try {
                await Voice.start('es-MX')
            } catch (error) { 
                handleChatResponse(dispatch, 'elber:error', ERROR_VOICE)
            }
        } else {
            dispatch(showAlert({
                isVisible: true,
                title: 'Micrófono',
                text: 'Elber necesita acceso al micrófono y al reconocimiento de voz para interactuar contigo. Ve a Configuración y habilítalos.',
                btnText: 'Habilitar',
                onPress: () => {
                    openSettings('application')
                }
            }))
        }
    }

    const clearSilenceTimer = () => {
        if (silenceTimer.current) {
            clearTimeout(silenceTimer.current)
            silenceTimer.current = null
        }
    }

    const resetSilenceTimer = (onSilence: () => void) => {
        clearSilenceTimer()
        silenceTimer.current = setTimeout(onSilence, SILENCE_TIMEOUT_MS)
    }

    const stopListening = async() => {
        clearSilenceTimer()
        try {
            setIsListening(false)
            await Voice.stop()            
        } catch (error) {
            handleChatResponse(dispatch, 'elber:error', ERROR_VOICE)
        }
    }

    const prepareSpeech = () => {
        Voice.onSpeechStart = () => {
            setIsListening(true)
        }

        Voice.onSpeechEnd = () => {
            clearSilenceTimer()
            setIsListening(false)
            onEnd(message.current)
        }

        Voice.onSpeechResults = (event) => {
            if(event.value) {
                message.current = event.value[0]
                onEnd(event.value[0])
                resetSilenceTimer(async () => {
                    await stopListening()
                    onEnd(message.current)
                })
            }
        }

        Voice.onSpeechError = (error) => {            
            clearSilenceTimer()
            setIsListening(false)
            handleChatResponse(dispatch, 'elber:error', ERROR_VOICE)
        };
    }

    const removeSpeechListener = () => {
        Voice.destroy().then(Voice.removeAllListeners)        
    }
    
    return { isListening, startListening, prepareSpeech, removeSpeechListener, stopListening }
}

export default useVoice