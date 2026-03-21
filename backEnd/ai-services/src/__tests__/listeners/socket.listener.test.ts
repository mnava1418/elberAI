import socketSetListeners from '../../listeners/socket.listener'
import elberListener from '../../listeners/elber.listener'

jest.mock('../../listeners/elber.listener')

describe('socketSetListeners', () => {
  it('should delegate to elberListener with io and socket', () => {
    const mockIo = {} as any
    const mockSocket = {} as any

    socketSetListeners(mockIo, mockSocket)

    expect(elberListener).toHaveBeenCalledWith(mockIo, mockSocket)
  })
})
