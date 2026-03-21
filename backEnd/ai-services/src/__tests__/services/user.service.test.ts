import admin from 'firebase-admin'
import { deleteProfile } from '../../services/user.service'
import ShortTermMemory from '../../models/shortTermMemory.model'
import MidTermMemory from '../../models/midTermMemory.model'
import LongTermMemory from '../../models/longTermMemory.model'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: { database: jest.fn(), auth: jest.fn() },
}))

jest.mock('../../models/shortTermMemory.model', () => ({
  __esModule: true,
  default: { getInstance: jest.fn() },
}))

jest.mock('../../models/midTermMemory.model', () => ({
  __esModule: true,
  default: { getInstance: jest.fn() },
}))

jest.mock('../../models/longTermMemory.model')

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
}))

jest.mock('../../services/ltm/ltmDB.service', () => ({
  pgPool: { query: jest.fn() },
}))

jest.mock('../../services/ltm/vectoreStore.service')
jest.mock('../../services/ltm/ltmReader.service')
jest.mock('../../services/ltm/ltmWriter.service')

jest.mock('@openai/agents', () => ({
  __esModule: true,
  OpenAIConversationsSession: jest.fn(() => ({})),
  run: jest.fn(),
  tool: jest.fn((c: any) => c),
}))

describe('user.service', () => {
  const mockDeleteUserSessions = jest.fn()
  const mockDeleteUserMemory = jest.fn()
  const mockResetMemory = jest.fn()
  const mockRemove = jest.fn()
  const mockRef = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(ShortTermMemory.getInstance as jest.Mock).mockReturnValue({
      deleteUserSessions: mockDeleteUserSessions,
    })
    ;(MidTermMemory.getInstance as jest.Mock).mockReturnValue({
      deleteUserMemory: mockDeleteUserMemory,
    })
    mockResetMemory.mockResolvedValue(undefined)
    ;(LongTermMemory as jest.Mock).mockImplementation(() => ({
      resetMemory: mockResetMemory,
    }))
    mockRemove.mockResolvedValue(undefined)
    mockRef.mockReturnValue({ remove: mockRemove })
    ;(admin.database as unknown as jest.Mock).mockReturnValue({ ref: mockRef })
  })

  describe('deleteProfile', () => {
    it('should clear STM, MTM, LTM, and Firebase data', async () => {
      await deleteProfile('user1')

      expect(mockDeleteUserSessions).toHaveBeenCalledWith('user1')
      expect(mockDeleteUserMemory).toHaveBeenCalledWith('user1')
      expect(mockResetMemory).toHaveBeenCalledWith('user1')
      expect(mockRef).toHaveBeenCalledWith('/user1')
      expect(mockRemove).toHaveBeenCalled()
    })

    it('should throw with the uid in the message when an error occurs', async () => {
      mockResetMemory.mockRejectedValue(new Error('DB error'))

      await expect(deleteProfile('user1')).rejects.toThrow('Unable to delete profile for:user1')
    })
  })
})
