import { Request, Response } from 'express'
import * as userService from '../../services/user.service'
import { deleteProfile } from '../../controllers/user.controller'

jest.mock('../../services/user.service')

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
}))

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: { auth: jest.fn(), database: jest.fn() },
}))

jest.mock('@openai/agents', () => ({
  __esModule: true,
  OpenAIConversationsSession: jest.fn(() => ({})),
  run: jest.fn(),
  tool: jest.fn((c: any) => c),
}))

jest.mock('../../services/ltm/ltmDB.service', () => ({ pgPool: { query: jest.fn() } }))
jest.mock('../../services/ltm/vectoreStore.service')
jest.mock('../../services/ltm/ltmReader.service')
jest.mock('../../services/ltm/ltmWriter.service')

const createMockRes = () => {
  const res = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('user.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('deleteProfile', () => {
    it('should return 200 on successful profile deletion', async () => {
      ;(userService.deleteProfile as jest.Mock).mockResolvedValue(undefined)

      const req = { headers: { 'x-user-uid': 'user1' } } as unknown as Request
      const res = createMockRes()
      await deleteProfile(req, res)

      expect(userService.deleteProfile).toHaveBeenCalledWith('user1')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ response: 'Profile deleted successfully' })
    })

    it('should return 500 with error message on failure', async () => {
      ;(userService.deleteProfile as jest.Mock).mockRejectedValue(new Error('DB error'))

      const req = { headers: { 'x-user-uid': 'user1' } } as unknown as Request
      const res = createMockRes()
      await deleteProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })

    it('should return "Unknown error occurred" for non-Error throws', async () => {
      ;(userService.deleteProfile as jest.Mock).mockRejectedValue('plain string error')

      const req = { headers: { 'x-user-uid': 'user1' } } as unknown as Request
      const res = createMockRes()
      await deleteProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unknown error occurred' })
    })
  })
})
