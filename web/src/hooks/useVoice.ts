'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseVoiceOptions {
  onResult: (text: string) => void
}

interface UseVoiceReturn {
  isListening: boolean
  readyToSend: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  clearReadyToSend: () => void
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor
    webkitSpeechRecognition: ISpeechRecognitionConstructor
  }
}

export function useVoice({ onResult }: UseVoiceOptions): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false)
  const [readyToSend, setReadyToSend] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognitionAPI: ISpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      setReadyToSend(false)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const text = finalTranscript || interimTranscript
      if (text) {
        onResultRef.current(text)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setReadyToSend(true)
      recognitionRef.current = null
    }

    recognition.onerror = () => {
      setIsListening(false)
      setReadyToSend(false)
      recognitionRef.current = null
    }

    recognition.start()
  }, [isSupported])

  const clearReadyToSend = useCallback(() => {
    setReadyToSend(false)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  return { isListening, readyToSend, isSupported, startListening, stopListening, clearReadyToSend }
}
