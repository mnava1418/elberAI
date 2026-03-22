import { renderHook, act } from '@testing-library/react-native'
import useForm from '../../hooks/auth/useForm'

describe('useForm', () => {
  it('should initialize with empty strings and isProcessing false', () => {
    const { result } = renderHook(() => useForm())

    expect(result.current.error).toBe('')
    expect(result.current.message).toBe('')
    expect(result.current.isProcessing).toBe(false)
  })

  it('should update error via setError', () => {
    const { result } = renderHook(() => useForm())

    act(() => {
      result.current.setError('Email inválido')
    })

    expect(result.current.error).toBe('Email inválido')
  })

  it('should update message via setMessage', () => {
    const { result } = renderHook(() => useForm())

    act(() => {
      result.current.setMessage('Tu solicitud fue enviada.')
    })

    expect(result.current.message).toBe('Tu solicitud fue enviada.')
  })

  it('should update isProcessing via setIsProcessing', () => {
    const { result } = renderHook(() => useForm())

    act(() => {
      result.current.setIsProcessing(true)
    })

    expect(result.current.isProcessing).toBe(true)
  })

  it('should clear error and message via cleanTexts', () => {
    const { result } = renderHook(() => useForm())

    act(() => {
      result.current.setError('Some error')
      result.current.setMessage('Some message')
    })

    act(() => {
      result.current.cleanTexts()
    })

    expect(result.current.error).toBe('')
    expect(result.current.message).toBe('')
  })

  it('should not affect isProcessing when cleanTexts is called', () => {
    const { result } = renderHook(() => useForm())

    act(() => {
      result.current.setIsProcessing(true)
      result.current.cleanTexts()
    })

    expect(result.current.isProcessing).toBe(true)
  })
})
