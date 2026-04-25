import SocketModel from '../../models/Socket.model'

jest.mock('@env', () => ({ SOCKET_URL: 'http://localhost:4042' }))

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  getIdToken: jest.fn(),
}))

jest.mock('../../services/elber.service', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}))

import { io } from 'socket.io-client'
import { getAuth, getIdToken } from '@react-native-firebase/auth'
import handleChatResponse from '../../services/elber.service'

// Build a mock socket factory
const buildMockSocket = (connected = false) => {
  const handlers: Record<string, Function> = {}
  return {
    connected,
    on: jest.fn((event: string, cb: Function) => { handlers[event] = cb }),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
    _trigger: (event: string, ...args: any[]) => handlers[event]?.(...args),
    _handlers: handlers,
  }
}

const mockCurrentUser = {
  uid: 'user-123',
  displayName: 'Martin',
}

describe('SocketModel', () => {
  let mockSocket: ReturnType<typeof buildMockSocket>

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset singleton between tests
    ;(SocketModel as any).instance = undefined
    mockSocket = buildMockSocket(false)
    ;(io as jest.Mock).mockReturnValue(mockSocket)
    ;(getAuth as jest.Mock).mockReturnValue({ currentUser: mockCurrentUser })
    ;(getIdToken as jest.Mock).mockResolvedValue('mock-token')
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const a = SocketModel.getInstance()
      const b = SocketModel.getInstance()
      expect(a).toBe(b)
    })
  })

  describe('disconnect', () => {
    it('should do nothing when socket is null', () => {
      const instance = SocketModel.getInstance()
      expect(() => instance.disconnect()).not.toThrow()
    })

    it('should remove listeners, disconnect, and null the socket when connected', async () => {
      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()

      await instance.connect(dispatch)

      instance.disconnect()

      expect(mockSocket.removeAllListeners).toHaveBeenCalled()
      expect(mockSocket.disconnect).toHaveBeenCalled()
    })
  })

  describe('connect', () => {
    it('should throw when user is not authenticated', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({ currentUser: null })

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()

      await expect(instance.connect(dispatch)).rejects.toThrow('User not authenticated.')
    })

    it('should call io with SOCKET_URL when user is authenticated', async () => {
      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()

      await instance.connect(dispatch)

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ transports: ['websocket'] })
      )
    })

    it('should register connect, disconnect, and connect_error listeners', async () => {
      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()

      await instance.connect(dispatch)

      const registeredEvents = mockSocket.on.mock.calls.map(([event]: [string]) => event)
      expect(registeredEvents).toContain('connect')
      expect(registeredEvents).toContain('disconnect')
      expect(registeredEvents).toContain('connect_error')
    })

    it('should skip creating new socket when already connected', async () => {
      const connectedSocket = buildMockSocket(true)
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()

      await instance.connect(dispatch)
      await instance.connect(dispatch) // second call

      expect(io).toHaveBeenCalledTimes(1)
    })

    it('should set Elber listeners on connect event', async () => {
      const connectedSocket = buildMockSocket(true)
      connectedSocket.on = jest.fn((event: string, cb: Function) => {
        ;(connectedSocket as any)._handlers = (connectedSocket as any)._handlers || {}
        ;(connectedSocket as any)._handlers[event] = cb
      })
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()

      await instance.connect(dispatch)

      // trigger connect event to fire setListeners
      ;(connectedSocket as any)._handlers?.['connect']?.()

      const eventNames = connectedSocket.on.mock.calls.map(([e]: [string]) => e)
      expect(eventNames).toContain('elber:stream')
      expect(eventNames).toContain('elber:response')
      expect(eventNames).toContain('elber:title')
      expect(eventNames).toContain('elber:error')
      expect(eventNames).toContain('elber:cancelled')
    })
  })

  describe('setElberListeners', () => {
    it('should dispatch stream event when elber:stream fires', async () => {
      const connectedSocket = buildMockSocket(true)
      const handlers: Record<string, Function> = {}
      connectedSocket.on = jest.fn((event: string, cb: Function) => { handlers[event] = cb })
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)

      // trigger connect to register elber listeners
      handlers['connect']?.()
      handlers['elber:stream']?.(1, 'Hello chunk')

      expect(handleChatResponse).toHaveBeenCalledWith(dispatch, 'elber:stream', { chatId: 1, text: 'Hello chunk' })
    })

    it('should dispatch response event when elber:response fires', async () => {
      const connectedSocket = buildMockSocket(true)
      const handlers: Record<string, Function> = {}
      connectedSocket.on = jest.fn((event: string, cb: Function) => { handlers[event] = cb })
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)
      handlers['connect']?.()
      handlers['elber:response']?.(1, '')

      expect(handleChatResponse).toHaveBeenCalledWith(dispatch, 'elber:response', { chatId: 1, text: '' })
    })

    it('should dispatch error event when elber:error fires', async () => {
      const connectedSocket = buildMockSocket(true)
      const handlers: Record<string, Function> = {}
      connectedSocket.on = jest.fn((event: string, cb: Function) => { handlers[event] = cb })
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)
      handlers['connect']?.()
      handlers['elber:error']?.(1, 'Error text')

      expect(handleChatResponse).toHaveBeenCalledWith(dispatch, 'elber:error', expect.objectContaining({ chatId: 1 }))
    })

    it('should dispatch cancelled event when elber:cancelled fires', async () => {
      const connectedSocket = buildMockSocket(true)
      const handlers: Record<string, Function> = {}
      connectedSocket.on = jest.fn((event: string, cb: Function) => { handlers[event] = cb })
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)
      handlers['connect']?.()
      handlers['elber:cancelled']?.(1, '')

      expect(handleChatResponse).toHaveBeenCalledWith(dispatch, 'elber:cancelled', { chatId: 1, text: '' })
    })
  })

  describe('sendMessage', () => {
    it('should emit user:ask when socket is connected and user exists', async () => {
      const connectedSocket = buildMockSocket(true)
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)

      const message = { id: 'm1', createdAt: 1000, role: 'user' as const, content: 'Hello' }
      await instance.sendMessage(1, 'My Chat', message, false, dispatch)

      expect(connectedSocket.emit).toHaveBeenCalledWith(
        'user:ask',
        expect.objectContaining({
          chatId: 1,
          text: 'Hello',
          user: expect.objectContaining({ uid: 'user-123' }),
        })
      )
    })

    it('should dispatch elber:error when socket is not connected', async () => {
      const disconnectedSocket = buildMockSocket(false)
      ;(io as jest.Mock).mockReturnValue(disconnectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)

      const message = { id: 'm1', createdAt: 1000, role: 'user' as const, content: 'Hello' }
      instance.sendMessage(1, 'My Chat', message, false, dispatch)

      expect(handleChatResponse).toHaveBeenCalledWith(
        dispatch,
        'elber:error',
        expect.objectContaining({ chatId: 1 })
      )
    })
  })

  describe('cancelMessage', () => {
    it('should emit user:cancel when socket is connected', async () => {
      const connectedSocket = buildMockSocket(true)
      ;(io as jest.Mock).mockReturnValue(connectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)

      instance.cancelMessage(1, dispatch)

      expect(connectedSocket.emit).toHaveBeenCalledWith('user:cancel', 1)
    })

    it('should dispatch elber:error when socket is not connected', async () => {
      const disconnectedSocket = buildMockSocket(false)
      ;(io as jest.Mock).mockReturnValue(disconnectedSocket)

      const instance = SocketModel.getInstance()
      const dispatch = jest.fn()
      await instance.connect(dispatch)

      instance.cancelMessage(1, dispatch)

      expect(handleChatResponse).toHaveBeenCalledWith(
        dispatch,
        'elber:error',
        expect.objectContaining({ chatId: 1 })
      )
    })
  })
})
