import { useRef, useState } from "react"
import { checkVoicePermissions } from "../../services/entitlements.service"
import { Platform } from "react-native"
import Voice from '@react-native-voice/voice'
import { openSettings } from 'react-native-permissions'
import { showAlert } from "../../store/actions/elber.actions"

const SILENCE_TIMEOUT_MS = 2000

const useVoice = (dispatch: (value: any) => void, chatId: number, onEnd: React.Dispatch<React.SetStateAction<string>>, inputText: string = '') => {
    const [isListening, setIsListening] = useState(false)
    const [readyToSend, setReadyToSend] = useState(false)
    const message = useRef('')
    const baseText = useRef('')
    const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const startListening = async () => {
        const hasVoicePermissions = await checkVoicePermissions(Platform.OS === 'ios' ? 'ios' : 'android')
        .catch(() => false)

        if(hasVoicePermissions) {
            try {
                baseText.current = inputText
                message.current = ''
                setIsListening(true)
                await Voice.start('es-MX')
            } catch (error) { 
                console.error(error)
                setIsListening(false)
                setReadyToSend(false)
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
        try {
            clearSilenceTimer()
            setIsListening(false)
            await Voice.stop()            
        } catch (error) {
            console.error(error)
        }
    }

    const prepareSpeech = () => {
        Voice.onSpeechStart = () => {
            setIsListening(true)
            setReadyToSend(false)
        }

        const combineText = (voiceText: string) => {
            const base = baseText.current.trim()
            return base ? `${base} ${voiceText[0].toLowerCase()}${voiceText.substring(1)}` : voiceText
        }

        Voice.onSpeechEnd = () => {
            clearSilenceTimer()
            setIsListening(false)
            onEnd(combineText(message.current))
            setReadyToSend(true)
        }

        Voice.onSpeechResults = (event) => {
            if(event.value) {
                message.current = event.value[0]
                onEnd(combineText(event.value[0]))
                resetSilenceTimer(async () => {
                    await stopListening()
                    onEnd(combineText(message.current))
                })
            }
        }

        Voice.onSpeechError = (error) => {            
            clearSilenceTimer()
            setIsListening(false)
            setReadyToSend(false)
        };
    }

    const removeSpeechListener = () => {
        Voice.destroy().then(Voice.removeAllListeners)        
    }
    
    return { isListening, readyToSend, startListening, prepareSpeech, removeSpeechListener, stopListening }
}

export default useVoice