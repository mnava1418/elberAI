import {
  selectIsWaitingForElber,
  selectElberIsStreaming,
  selectAlert,
} from '../../../store/selectors/elber.selector'
import { initialElberState, ElberState, AlertProps } from '../../../store/reducers/elber.reducer'

const mockAlert: AlertProps = {
  isVisible: true,
  title: 'Error',
  text: 'Something went wrong',
  btnText: 'Close',
  onPress: jest.fn(),
}

describe('selectIsWaitingForElber', () => {
  it('should return false for initial state', () => {
    expect(selectIsWaitingForElber(initialElberState)).toBe(false)
  })

  it('should return true when isWaiting is true', () => {
    const state: ElberState = { ...initialElberState, isWaiting: true }
    expect(selectIsWaitingForElber(state)).toBe(true)
  })
})

describe('selectElberIsStreaming', () => {
  it('should return false for initial state', () => {
    expect(selectElberIsStreaming(initialElberState)).toBe(false)
  })

  it('should return true when isStreaming is true', () => {
    const state: ElberState = { ...initialElberState, isStreaming: true }
    expect(selectElberIsStreaming(state)).toBe(true)
  })
})

describe('selectAlert', () => {
  it('should return default alert for initial state', () => {
    const alert = selectAlert(initialElberState)
    expect(alert.isVisible).toBe(false)
    expect(alert.title).toBe('')
  })

  it('should return the current alert', () => {
    const state: ElberState = { ...initialElberState, alert: mockAlert }
    const result = selectAlert(state)
    expect(result.isVisible).toBe(true)
    expect(result.title).toBe('Error')
    expect(result.text).toBe('Something went wrong')
  })
})
