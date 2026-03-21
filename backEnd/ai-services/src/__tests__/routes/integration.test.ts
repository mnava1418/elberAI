import request from 'supertest'
import * as chatService from '../../services/chat.service'
import * as userService from '../../services/user.service'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: { auth: jest.fn(), database: jest.fn() },
}))

jest.mock('../../services/chat.service')
jest.mock('../../services/user.service')

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test-gateway-secret' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
  server: { port: 4042 },
}))

jest.mock('@openai/agents', () => ({
  __esModule: true,
  OpenAIConversationsSession: jest.fn(() => ({})),
  run: jest.fn(),
  withTrace: jest.fn(),
  tool: jest.fn((c: any) => c),
}))

jest.mock('../../services/ltm/ltmDB.service', () => ({ pgPool: { query: jest.fn() } }))
jest.mock('../../services/ltm/vectoreStore.service')
jest.mock('../../services/ltm/ltmReader.service')
jest.mock('../../services/ltm/ltmWriter.service')

import app from '../../app'

const GATEWAY_HEADER = { 'x-api-gateway-secret': 'test-gateway-secret' }
const USER_UID = 'user1'

describe('Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(chatService.getUserChats as jest.Mock).mockResolvedValue([])
    ;(chatService.deleteChat as jest.Mock).mockResolvedValue(undefined)
    ;(chatService.deleteAllChats as jest.Mock).mockResolvedValue(undefined)
    ;(userService.deleteProfile as jest.Mock).mockResolvedValue(undefined)
  })

  describe('GET /', () => {
    it('should return running message', async () => {
      const res = await request(app).get('/').set(GATEWAY_HEADER)
      expect(res.status).toBe(200)
      expect(res.body.message).toBe('ELBER AI Services is running!')
    })
  })

  describe('GET /health', () => {
    it('should return health status with gateway header', async () => {
      const res = await request(app).get('/health').set(GATEWAY_HEADER)
      expect(res.status).toBe(200)
      expect(res.body.endPoint).toBe('/ai')
    })
  })

  describe('Auth middleware (proxy_validate)', () => {
    it('should return 403 when gateway secret is missing', async () => {
      const res = await request(app).get('/chat').set('x-user-uid', USER_UID)
      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Invalid Call.')
    })

    it('should return 403 when gateway secret is wrong', async () => {
      const res = await request(app)
        .get('/chat')
        .set('x-api-gateway-secret', 'wrong-secret')
        .set('x-user-uid', USER_UID)
      expect(res.status).toBe(403)
    })
  })

  describe('GET /chat', () => {
    it('should return 200 with chats', async () => {
      const mockChats = [{ id: 1, messages: [], name: 'Test' }]
      ;(chatService.getUserChats as jest.Mock).mockResolvedValue(mockChats)

      const res = await request(app)
        .get('/chat')
        .set({ ...GATEWAY_HEADER, 'x-user-uid': USER_UID })

      expect(res.status).toBe(200)
      expect(res.body.chats).toEqual(mockChats)
    })

    it('should return 400 when uid is missing', async () => {
      const res = await request(app).get('/chat').set(GATEWAY_HEADER)
      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /chat', () => {
    it('should delete a chat and return 200', async () => {
      const res = await request(app)
        .delete('/chat')
        .set({ ...GATEWAY_HEADER, 'x-user-uid': USER_UID })
        .send({ chatId: '1' })

      expect(res.status).toBe(200)
      expect(chatService.deleteChat).toHaveBeenCalledWith(USER_UID, '1')
    })

    it('should return 400 when chatId is missing', async () => {
      const res = await request(app)
        .delete('/chat')
        .set({ ...GATEWAY_HEADER, 'x-user-uid': USER_UID })
        .send({})

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /chat/all', () => {
    it('should delete all chats and return 200', async () => {
      const res = await request(app)
        .delete('/chat/all')
        .set({ ...GATEWAY_HEADER, 'x-user-uid': USER_UID })

      expect(res.status).toBe(200)
      expect(chatService.deleteAllChats).toHaveBeenCalledWith(USER_UID)
    })

    it('should return 400 when uid is missing', async () => {
      const res = await request(app).delete('/chat/all').set(GATEWAY_HEADER)
      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /user', () => {
    it('should delete profile and return 200', async () => {
      const res = await request(app)
        .delete('/user')
        .set({ ...GATEWAY_HEADER, 'x-user-uid': USER_UID })

      expect(res.status).toBe(200)
      expect(res.body.response).toBe('Profile deleted successfully')
      expect(userService.deleteProfile).toHaveBeenCalledWith(USER_UID)
    })

    it('should return 500 when deletion fails', async () => {
      ;(userService.deleteProfile as jest.Mock).mockRejectedValue(new Error('DB error'))

      const res = await request(app)
        .delete('/user')
        .set({ ...GATEWAY_HEADER, 'x-user-uid': USER_UID })

      expect(res.status).toBe(500)
    })
  })
})
