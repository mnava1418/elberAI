import { elberReducer, initialElberState, ElberState, AlertProps } from '../../../store/reducers/elber.reducer'

const mockAlert: AlertProps = {
  isVisible: true,
  title: 'Test',
  text: 'Something happened',
  btnText: 'OK',
  onPress: jest.fn(),
}

describe('elberReducer', () => {
  it('should return current state for unknown action', () => {
    const result = elberReducer(initialElberState, { type: 'LOG_OUT' })
    expect(result).toEqual(initialElberState)
  })

  describe('WAITING_FOR_ELBER', () => {
    it('should set isWaiting to true', () => {
      const result = elberReducer(initialElberState, { type: 'WAITING_FOR_ELBER', isWaiting: true })
      expect(result.isWaiting).toBe(true)
    })

    it('should set isWaiting to false', () => {
      const state: ElberState = { ...initialElberState, isWaiting: true }
      const result = elberReducer(state, { type: 'WAITING_FOR_ELBER', isWaiting: false })
      expect(result.isWaiting).toBe(false)
    })

    it('should not affect isStreaming', () => {
      const state: ElberState = { ...initialElberState, isStreaming: true }
      const result = elberReducer(state, { type: 'WAITING_FOR_ELBER', isWaiting: true })
      expect(result.isStreaming).toBe(true)
    })
  })

  describe('ELBER_IS_STREAMING', () => {
    it('should set isStreaming to true', () => {
      const result = elberReducer(initialElberState, { type: 'ELBER_IS_STREAMING', isStreaming: true })
      expect(result.isStreaming).toBe(true)
    })

    it('should set isStreaming to false', () => {
      const state: ElberState = { ...initialElberState, isStreaming: true }
      const result = elberReducer(state, { type: 'ELBER_IS_STREAMING', isStreaming: false })
      expect(result.isStreaming).toBe(false)
    })

    it('should not affect isWaiting', () => {
      const state: ElberState = { ...initialElberState, isWaiting: true }
      const result = elberReducer(state, { type: 'ELBER_IS_STREAMING', isStreaming: true })
      expect(result.isWaiting).toBe(true)
    })
  })

  describe('SHOW_ALERT', () => {
    it('should set the alert', () => {
      const result = elberReducer(initialElberState, { type: 'SHOW_ALERT', alert: mockAlert })
      expect(result.alert).toEqual(mockAlert)
      expect(result.alert.isVisible).toBe(true)
      expect(result.alert.title).toBe('Test')
    })

    it('should not affect isWaiting or isStreaming', () => {
      const state: ElberState = { ...initialElberState, isWaiting: true, isStreaming: true }
      const result = elberReducer(state, { type: 'SHOW_ALERT', alert: mockAlert })
      expect(result.isWaiting).toBe(true)
      expect(result.isStreaming).toBe(true)
    })
  })

  describe('HIDE_ALERT', () => {
    it('should set alert.isVisible to false', () => {
      const state: ElberState = { ...initialElberState, alert: mockAlert }
      const result = elberReducer(state, { type: 'HIDE_ALERT' })
      expect(result.alert.isVisible).toBe(false)
    })

    it('should preserve other alert fields', () => {
      const state: ElberState = { ...initialElberState, alert: mockAlert }
      const result = elberReducer(state, { type: 'HIDE_ALERT' })
      expect(result.alert.title).toBe('Test')
      expect(result.alert.text).toBe('Something happened')
    })
  })

  describe('LOG_OUT', () => {
    it('should reset to initial state', () => {
      const state: ElberState = {
        isWaiting: true,
        isStreaming: true,
        alert: mockAlert,
      }
      const result = elberReducer(state, { type: 'LOG_OUT' })
      expect(result.isWaiting).toBe(false)
      expect(result.isStreaming).toBe(false)
      expect(result.alert.isVisible).toBe(false)
    })
  })
})
