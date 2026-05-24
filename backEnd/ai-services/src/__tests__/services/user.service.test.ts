import admin from 'firebase-admin'
import { deleteProfile, fetchUserData, deleteAllUserData, deleteUserDataByItems } from '../../services/user.service'
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

const mockResetMemoryData = jest.fn()
jest.mock('../../services/userMemory.service', () => ({
  resetMemoryData: (...args: any[]) => mockResetMemoryData(...args),
}))

describe('user.service', () => {
  const mockDeleteUserSessions = jest.fn()
  const mockDeleteUserMemory = jest.fn()
  const mockRemove = jest.fn()
  const mockRef = jest.fn()
  const mockGetUserData = jest.fn()
  const mockResetMemory = jest.fn()
  const mockGetMemory = jest.fn()
  const mockDeleteMemories = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(ShortTermMemory.getInstance as jest.Mock).mockReturnValue({
      deleteUserSessions: mockDeleteUserSessions,
    })
    ;(MidTermMemory.getInstance as jest.Mock).mockReturnValue({
      deleteUserMemory: mockDeleteUserMemory,
    })
    ;(LongTermMemory as jest.Mock).mockImplementation(() => ({
      getUserData: mockGetUserData,
      resetMemory: mockResetMemory,
      getMemory: mockGetMemory,
      deleteMemories: mockDeleteMemories,
    }))
    mockResetMemoryData.mockResolvedValue('He borrado toda tu memoria.')
    mockRemove.mockResolvedValue(undefined)
    mockRef.mockReturnValue({ remove: mockRemove })
    ;(admin.database as unknown as jest.Mock).mockReturnValue({ ref: mockRef })
  })

  describe('deleteProfile', () => {
    it('should clear STM, MTM, memory, and Firebase data', async () => {
      await deleteProfile('user1')

      expect(mockDeleteUserSessions).toHaveBeenCalledWith('user1')
      expect(mockDeleteUserMemory).toHaveBeenCalledWith('user1')
      expect(mockResetMemoryData).toHaveBeenCalledWith('user1')
      expect(mockRef).toHaveBeenCalledWith('/user1')
      expect(mockRemove).toHaveBeenCalled()
    })

    it('should throw with the uid in the message when an error occurs', async () => {
      mockResetMemoryData.mockRejectedValue(new Error('DB error'))

      await expect(deleteProfile('user1')).rejects.toThrow('Unable to delete profile for:user1')
    })
  })

  describe('fetchUserData', () => {
    it('should return up to 10 items from LTM', async () => {
      const data = Array.from({ length: 15 }, (_, i) => ({
        type: 'profile',
        importance: 3,
        info: `fact ${i}`,
        updatedAt: '',
      }))
      mockGetUserData.mockResolvedValue(data)

      const result = await fetchUserData('user1')

      expect(mockGetUserData).toHaveBeenCalledWith('user1')
      expect(result).toHaveLength(10)
    })

    it('should return all items when fewer than 10 exist', async () => {
      const data = [{ type: 'profile', importance: 3, info: 'fact', updatedAt: '' }]
      mockGetUserData.mockResolvedValue(data)

      const result = await fetchUserData('user1')

      expect(result).toHaveLength(1)
    })
  })

  describe('deleteAllUserData', () => {
    it('should call resetMemory with the userId', async () => {
      mockResetMemory.mockResolvedValue(undefined)

      await deleteAllUserData('user1')

      expect(mockResetMemory).toHaveBeenCalledWith('user1')
    })
  })

  describe('deleteUserDataByItems', () => {
    it('should delete found memories and return true', async () => {
      mockGetMemory.mockResolvedValue([{ id: 'id-1' }, { id: 'id-2' }])
      mockDeleteMemories.mockResolvedValue(undefined)

      const result = await deleteUserDataByItems('user1', ['where I work'])

      expect(mockGetMemory).toHaveBeenCalledWith('user1', 'where I work')
      expect(mockDeleteMemories).toHaveBeenCalledWith('user1', ['id-1', 'id-2'])
      expect(result).toBe(true)
    })

    it('should accumulate ids across multiple items', async () => {
      mockGetMemory
        .mockResolvedValueOnce([{ id: 'id-1' }])
        .mockResolvedValueOnce([{ id: 'id-2' }, { id: 'id-3' }])
      mockDeleteMemories.mockResolvedValue(undefined)

      const result = await deleteUserDataByItems('user1', ['job', 'city'])

      expect(mockDeleteMemories).toHaveBeenCalledWith('user1', ['id-1', 'id-2', 'id-3'])
      expect(result).toBe(true)
    })

    it('should return false when no memories match', async () => {
      mockGetMemory.mockResolvedValue([])

      const result = await deleteUserDataByItems('user1', ['nonexistent'])

      expect(mockDeleteMemories).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })
})
