import { renderHook, act } from '@testing-library/react-native'
import useAnimateText from '../../hooks/animation/useAnimateText'

describe('useAnimateText', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with empty displayedText and first phrase', () => {
    const phrases = ['Hola', 'Mundo']
    const { result } = renderHook(() => useAnimateText(phrases))

    expect(result.current.animatedElements.displayedText).toBe('')
    expect(result.current.animatedElements.phrase).toBe('Hola')
  })

  it('should build text letter by letter when setAnimatedText is called', () => {
    const phrases = ['Hi']
    const { result } = renderHook(() => useAnimateText(phrases, 30))

    act(() => {
      result.current.setAnimatedText()
    })

    act(() => {
      jest.advanceTimersByTime(30)
    })
    expect(result.current.animatedElements.displayedText).toBe('H')

    act(() => {
      jest.advanceTimersByTime(30)
    })
    expect(result.current.animatedElements.displayedText).toBe('Hi')
  })

  it('should cycle to next phrase after pause when phrase completes', () => {
    const phrases = ['Hi', 'Bye']
    const speed = 10
    // setInterval needs (phrase.length + 1) ticks: one per letter + one for the else branch
    // The setTimeout inside is hardcoded to 2500ms (not the pause param)
    const totalMs = (phrases[0].length + 1) * speed + 2500

    const { result } = renderHook(() => useAnimateText(phrases, speed))

    act(() => {
      result.current.setAnimatedText()
      jest.advanceTimersByTime(totalMs)
    })

    expect(result.current.animatedElements.phrase).toBe('Bye')
  })

  it('should cycle back to first phrase after last phrase', () => {
    const phrases = ['A', 'B']
    const speed = 10
    // 'A' has 1 char → (1+1)*10 + 2500 = 2520ms per cycle
    const cycleMs = (1 + 1) * speed + 2500

    const { result } = renderHook(() => useAnimateText(phrases, speed))

    act(() => {
      result.current.setAnimatedText()
      jest.advanceTimersByTime(cycleMs)
    })
    expect(result.current.animatedElements.phrase).toBe('B')

    act(() => {
      result.current.setAnimatedText()
      jest.advanceTimersByTime(cycleMs)
    })
    expect(result.current.animatedElements.phrase).toBe('A')
  })

  it('should reset displayedText to empty when setAnimatedText is called again', () => {
    const phrases = ['Hello']
    const { result } = renderHook(() => useAnimateText(phrases, 10))

    act(() => { result.current.setAnimatedText() })
    act(() => { jest.advanceTimersByTime(30) })

    // call again — should reset
    act(() => { result.current.setAnimatedText() })

    expect(result.current.animatedElements.displayedText).toBe('')
  })
})
