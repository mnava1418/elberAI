import useElberStatus from '../../hooks/chat/useElberStatus'
import { initialElberState, ElberState } from '../../store/reducers/elber.reducer'

// Pure function wrapping selectors — no React rendering needed
describe('useElberStatus', () => {
  it('should return isWaiting false and isStreaming false for initial state', () => {
    const result = useElberStatus(initialElberState)

    expect(result.isWaiting).toBe(false)
    expect(result.isStreaming).toBe(false)
  })

  it('should return isWaiting true when state has isWaiting true', () => {
    const state: ElberState = { ...initialElberState, isWaiting: true }
    const result = useElberStatus(state)

    expect(result.isWaiting).toBe(true)
    expect(result.isStreaming).toBe(false)
  })

  it('should return isStreaming true when state has isStreaming true', () => {
    const state: ElberState = { ...initialElberState, isStreaming: true }
    const result = useElberStatus(state)

    expect(result.isStreaming).toBe(true)
    expect(result.isWaiting).toBe(false)
  })

  it('should return both true when both are active', () => {
    const state: ElberState = { ...initialElberState, isWaiting: true, isStreaming: true }
    const result = useElberStatus(state)

    expect(result.isWaiting).toBe(true)
    expect(result.isStreaming).toBe(true)
  })
})
