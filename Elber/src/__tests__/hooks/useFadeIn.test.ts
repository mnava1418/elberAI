import { renderHook, act } from '@testing-library/react-native'
import { Animated } from 'react-native'
import useFadeIn from '../../hooks/animation/useFadeIn'

describe('useFadeIn', () => {
  it('should return a fadeIn Animated.Value and a setFadeIn function', () => {
    const { result } = renderHook(() => useFadeIn())

    expect(result.current.fadeIn).toBeDefined()
    expect(typeof result.current.setFadeIn).toBe('function')
  })

  it('should start with opacity value 0', () => {
    const { result } = renderHook(() => useFadeIn())
    // Animated.Value exposes __getValue() in test environment
    expect((result.current.fadeIn as any).__getValue()).toBe(0)
  })

  it('should animate to value 1 when setFadeIn is called', () => {
    jest.useFakeTimers()
    const timingSpy = jest.spyOn(Animated, 'timing')

    const { result } = renderHook(() => useFadeIn(500))

    act(() => {
      result.current.setFadeIn()
    })

    expect(timingSpy).toHaveBeenCalledWith(
      result.current.fadeIn,
      expect.objectContaining({ toValue: 1, duration: 500, useNativeDriver: true })
    )

    timingSpy.mockRestore()
    jest.useRealTimers()
  })
})
