import { renderHook, act } from '@testing-library/react-native'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ bottom: 34, top: 0, left: 0, right: 0 }),
}))

jest.mock('react-native-reanimated', () => ({
  useAnimatedKeyboard: jest.fn().mockReturnValue({ height: { value: 0 } }),
  useAnimatedStyle: jest.fn((fn) => fn()),
  withTiming: jest.fn((val) => val),
  Easing: { linear: jest.fn() },
}))

import useChat from '../../hooks/chat/useChat'

describe('useChat', () => {
  it('should initialize inputText as empty string', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.inputText).toBe('')
  })

  it('should initialize showActions as false', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.showActions).toBe(false)
  })

  it('should update inputText via setInputText', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.setInputText('Hello Elber')
    })

    expect(result.current.inputText).toBe('Hello Elber')
  })

  it('should toggle showActions via setShowActions', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.setShowActions(true)
    })
    expect(result.current.showActions).toBe(true)

    act(() => {
      result.current.setShowActions(false)
    })
    expect(result.current.showActions).toBe(false)
  })

  it('should return animatedStyle', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.animatedStyle).toBeDefined()
  })

  it('should use bottom inset as paddingBottom when keyboard is closed', () => {
    const { result } = renderHook(() => useChat())
    // keyboard.height.value === 0, so targetPadding === bottom (34)
    expect(result.current.animatedStyle).toEqual({ paddingBottom: 34 })
  })

  it('should use keyboard height as paddingBottom when keyboard is open', () => {
    const { useAnimatedKeyboard } = require('react-native-reanimated')
    ;(useAnimatedKeyboard as jest.Mock).mockReturnValue({ height: { value: 300 } })

    const { result } = renderHook(() => useChat())
    expect(result.current.animatedStyle).toEqual({ paddingBottom: 300 })
  })
})
