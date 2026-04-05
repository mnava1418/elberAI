import handleChatResponse from '../../services/elber.service'
import { ElberChatResponse } from '../../models/elber.model'

// No external calls — only Redux dispatch is needed, which we mock as a jest.fn()

describe('elber.service - handleChatResponse', () => {
  let dispatch: jest.Mock

  const chatResponse: ElberChatResponse = {
    chatId: 1,
    text: 'Hola, soy Elber.',
  }

  beforeEach(() => {
    dispatch = jest.fn()
  })

  describe('elber:response event', () => {
    it('should dispatch elberIsStreaming(false)', () => {
      handleChatResponse(dispatch, 'elber:response', chatResponse)

      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith({ type: 'ELBER_IS_STREAMING', isStreaming: false })
      expect(dispatch).toHaveBeenCalledWith({ type: 'WAITING_FOR_ELBER', isWaiting: false })
      expect(dispatch).toHaveBeenCalledWith({ type: 'PROCESS_STREAM', chunk: 'Hola, soy Elber.' })
    })
  })

  describe('elber:stream event', () => {
    it('should dispatch elberIsStreaming(true), isWaitingForElber(false), and processStream', () => {
      handleChatResponse(dispatch, 'elber:stream', chatResponse)

      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith({ type: 'ELBER_IS_STREAMING', isStreaming: true })
      expect(dispatch).toHaveBeenCalledWith({ type: 'WAITING_FOR_ELBER', isWaiting: false })
      expect(dispatch).toHaveBeenCalledWith({ type: 'PROCESS_STREAM', chunk: 'Hola, soy Elber.' })
    })
  })

  describe('elber:error event', () => {
    it('should dispatch elberIsStreaming(false), isWaitingForElber(false), and addChatMessage', () => {
      handleChatResponse(dispatch, 'elber:error', chatResponse)

      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith({ type: 'ELBER_IS_STREAMING', isStreaming: false })
      expect(dispatch).toHaveBeenCalledWith({ type: 'WAITING_FOR_ELBER', isWaiting: false })

      const addMsgCall = dispatch.mock.calls.find(
        ([action]) => action.type === 'ADD_CHAT_MESSAGE'
      )
      expect(addMsgCall).toBeDefined()
      const action = addMsgCall[0]
      expect(action.chatId).toBe(1)
      expect(action.newMessage.role).toBe('assistant')
      expect(action.newMessage.content).toBe('Hola, soy Elber.')
    })
  })

  describe('elber:title event', () => {
    it('should dispatch updateChatTitle with text', () => {
      handleChatResponse(dispatch, 'elber:title', { chatId: 1, text: 'Mi primer chat' })

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_CHAT_TITLE',
        title: 'Mi primer chat',
      })
    })
  })

  describe('elber:cancelled event', () => {
    it('should dispatch elberIsStreaming(false) and isWaitingForElber(false)', () => {
      handleChatResponse(dispatch, 'elber:cancelled', chatResponse)

      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith({ type: 'ELBER_IS_TALKING', isTalking: false })
      expect(dispatch).toHaveBeenCalledWith({ type: 'ELBER_IS_STREAMING', isStreaming: false })
      expect(dispatch).toHaveBeenCalledWith({ type: 'WAITING_FOR_ELBER', isWaiting: false })
    })
  })

  describe('unknown event', () => {
    it('should not dispatch anything for an unknown event', () => {
      handleChatResponse(dispatch, 'elber:unknown' as any, chatResponse)

      expect(dispatch).not.toHaveBeenCalled()
    })
  })
})
