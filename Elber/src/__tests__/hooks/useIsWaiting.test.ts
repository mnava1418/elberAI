import { renderHook, act } from '@testing-library/react-native'
import { Animated } from 'react-native'
import useIsWaiting from '../../hooks/animation/useIsWaiting'

describe('useIsWaiting', () => {
  it('should return three dot opacities and animateWaiting function', () => {
    const { result } = renderHook(() => useIsWaiting())

    expect(result.current.dot1Opacity).toBeDefined()
    expect(result.current.dot2Opacity).toBeDefined()
    expect(result.current.dot3Opacity).toBeDefined()
    expect(typeof result.current.animateWaiting).toBe('function')
  })

  it('should initialize dot opacities at 0.3', () => {
    const { result } = renderHook(() => useIsWaiting())

    expect((result.current.dot1Opacity as any).__getValue()).toBe(0.3)
    expect((result.current.dot2Opacity as any).__getValue()).toBe(0.3)
    expect((result.current.dot3Opacity as any).__getValue()).toBe(0.3)
  })

  it('should call Animated.loop when animateWaiting is called', () => {
    const loopSpy = jest.spyOn(Animated, 'loop')
    const { result } = renderHook(() => useIsWaiting())

    act(() => {
      result.current.animateWaiting()
    })

    expect(loopSpy).toHaveBeenCalled()
    loopSpy.mockRestore()
  })

  it('should call Animated.parallel with 3 sequences when animateWaiting is called', () => {
    const parallelSpy = jest.spyOn(Animated, 'parallel')
    const { result } = renderHook(() => useIsWaiting())

    act(() => {
      result.current.animateWaiting()
    })

    expect(parallelSpy).toHaveBeenCalled()
    const args = parallelSpy.mock.calls[0][0]
    expect(args).toHaveLength(3)

    parallelSpy.mockRestore()
  })
})
