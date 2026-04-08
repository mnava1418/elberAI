import { renderHook, act } from '@testing-library/react-native'

jest.mock('../../services/entitlements.service', () => ({
  checkVoicePermissions: jest.fn(),
}))

jest.mock('@react-native-voice/voice', () => ({
  __esModule: true,
  default: {
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn().mockReturnValue(Promise.resolve()),
    removeAllListeners: jest.fn(),
    onSpeechStart: null,
    onSpeechEnd: null,
    onSpeechResults: null,
    onSpeechError: null,
  },
}))

jest.mock('react-native-permissions', () => ({
  openSettings: jest.fn(),
}))

jest.mock('../../services/elber.service', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import Voice from '@react-native-voice/voice'
import { checkVoicePermissions } from '../../services/entitlements.service'
import handleChatResponse from '../../services/elber.service'
import useVoice from '../../hooks/chat/useVoice'

describe('useVoice', () => {
  let dispatch: jest.Mock
  let onEnd: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    onEnd = jest.fn()
  })

  it('should initialize isListening as false', () => {
    const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))
    expect(result.current.isListening).toBe(false)
  })

  describe('startListening', () => {
    it('should call Voice.start when permissions are granted', async () => {
      ;(checkVoicePermissions as jest.Mock).mockResolvedValue(true)
      ;(Voice.start as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      await act(async () => {
        await result.current.startListening()
      })

      expect(Voice.start).toHaveBeenCalledWith('es-MX')
    })

    it('should dispatch showAlert when permissions are denied', async () => {
      ;(checkVoicePermissions as jest.Mock).mockResolvedValue(false)

      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      await act(async () => {
        await result.current.startListening()
      })

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SHOW_ALERT' })
      )
      expect(Voice.start).not.toHaveBeenCalled()
    })

    it('should handle Voice.start error gracefully', async () => {
      ;(checkVoicePermissions as jest.Mock).mockResolvedValue(true)
      ;(Voice.start as jest.Mock).mockRejectedValue(new Error('Voice error'))

      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      await act(async () => {
        await result.current.startListening()
      })

      expect(result.current.isListening).toBe(false)
    })

    it('should treat permission check failure as no permissions', async () => {
      ;(checkVoicePermissions as jest.Mock).mockRejectedValue(new Error('Permission error'))

      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      await act(async () => {
        await result.current.startListening()
      })

      expect(Voice.start).not.toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SHOW_ALERT' }))
    })
  })

  describe('stopListening', () => {
    it('should call Voice.stop and set isListening to false', async () => {
      ;(Voice.stop as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      await act(async () => {
        await result.current.stopListening()
      })

      expect(Voice.stop).toHaveBeenCalled()
      expect(result.current.isListening).toBe(false)
    })

    it('should handle Voice.stop error gracefully', async () => {
      ;(Voice.stop as jest.Mock).mockRejectedValue(new Error('Stop error'))

      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      await act(async () => {
        await result.current.stopListening()
      })

      expect(result.current.isListening).toBe(false)
    })
  })

  describe('prepareSpeech', () => {
    it('should set isListening true on onSpeechStart', () => {
      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      act(() => { result.current.prepareSpeech() })
      act(() => { (Voice.onSpeechStart as any)?.() })

      expect(result.current.isListening).toBe(true)
    })

    it('should set isListening false and call onEnd on onSpeechEnd', () => {
      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      act(() => { result.current.prepareSpeech() })
      act(() => { (Voice.onSpeechEnd as any)?.() })

      expect(result.current.isListening).toBe(false)
    })

    it('should call onEnd with first result on onSpeechResults', () => {
      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      act(() => { result.current.prepareSpeech() })
      act(() => {
        ;(Voice.onSpeechResults as any)?.({ value: ['Hola Elber'] })
      })

      expect(onEnd).toHaveBeenCalledWith('Hola Elber')
    })

    it('should not call onEnd when event has no value', () => {
      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      act(() => { result.current.prepareSpeech() })
      act(() => {
        ;(Voice.onSpeechResults as any)?.({ value: undefined })
      })

      expect(onEnd).not.toHaveBeenCalled()
    })

    it('should set isListening false on onSpeechError', () => {
      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      act(() => { result.current.prepareSpeech() })
      act(() => { (Voice.onSpeechError as any)?.({ code: '7' }) })

      expect(result.current.isListening).toBe(false)
    })
  })

  describe('removeSpeechListener', () => {
    it('should call Voice.destroy and then removeAllListeners', async () => {
      const { result } = renderHook(() => useVoice(dispatch, 1, onEnd))

      await act(async () => {
        result.current.removeSpeechListener()
        await Promise.resolve()
      })

      expect(Voice.destroy).toHaveBeenCalled()
    })
  })
})
