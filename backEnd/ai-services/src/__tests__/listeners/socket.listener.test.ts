import socketSetListeners from '../../listeners/socket.listener'
import elberListener from '../../listeners/elber.listener'

jest.mock('../../listeners/elber.listener')

describe('socketSetListeners', () => {
  it('should delegate to elberListener with socket', () => {
    const mockSocket = {} as any

    socketSetListeners(mockSocket)

    expect(elberListener).toHaveBeenCalledWith(mockSocket)
  })
})
