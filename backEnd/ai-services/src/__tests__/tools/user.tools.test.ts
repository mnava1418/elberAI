import {
  getUserData as getUserDataTool,
  deleteAllUserData as deleteAllUserDataTool,
  deleteUserData as deleteUserDataTool,
} from '../../tools/user.tools'

// Cast to any since FunctionTool types don't expose execute publicly (it's mocked).
const getUserData = getUserDataTool as any
const deleteAllUserData = deleteAllUserDataTool as any
const deleteUserData = deleteUserDataTool as any
import LongTermMemory from '../../models/longTermMemory.model'

jest.mock('../../models/longTermMemory.model')

jest.mock('@openai/agents', () => ({
  __esModule: true,
  tool: jest.fn((config: any) => config),
  run: jest.fn(),
}))

jest.mock('../../config/index.config', () => ({
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
}))

jest.mock('../../services/ltm/ltmDB.service', () => ({ pgPool: { query: jest.fn() } }))
jest.mock('../../services/ltm/vectoreStore.service')
jest.mock('../../services/ltm/ltmReader.service')
jest.mock('../../services/ltm/ltmWriter.service')

describe('user.tools', () => {
  const mockGetUserData = jest.fn()
  const mockResetMemory = jest.fn()
  const mockGetMemory = jest.fn()
  const mockDeleteMemories = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(LongTermMemory as jest.Mock).mockImplementation(() => ({
      getUserData: mockGetUserData,
      resetMemory: mockResetMemory,
      getMemory: mockGetMemory,
      deleteMemories: mockDeleteMemories,
    }))
  })

  describe('getUserData tool', () => {
    it('should return error message when userId is missing from context', async () => {
      const result = await getUserData.execute({}, { context: {} } as any)
      expect(result).toContain('No pude identificar al usuario')
    })

    it('should return error message when no context is provided', async () => {
      const result = await getUserData.execute({})
      expect(result).toContain('No pude identificar al usuario')
    })

    it('should return user data sliced to 10 items', async () => {
      const data = Array.from({ length: 15 }, (_, i) => ({
        type: 'profile',
        importance: 3,
        info: `fact ${i}`,
        updatedAt: '',
      }))
      mockGetUserData.mockResolvedValue(data)

      const result = await getUserData.execute(
        {},
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(result).toHaveLength(10)
    })

    it('should return error message on exception', async () => {
      mockGetUserData.mockRejectedValue(new Error('DB error'))
      const result = await getUserData.execute(
        {},
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )
      expect(result).toContain('error')
    })
  })

  describe('deleteAllUserData tool', () => {
    it('should return error message when userId is missing', async () => {
      const result = await deleteAllUserData.execute({}, { context: {} } as any)
      expect(result).toContain('No pude identificar al usuario')
    })

    it('should reset memory and return success message', async () => {
      mockResetMemory.mockResolvedValue(undefined)
      const result = await deleteAllUserData.execute(
        {},
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )
      expect(mockResetMemory).toHaveBeenCalledWith('user1')
      expect(result).toBe('He borrado toda la memoria')
    })

    it('should return error message on exception', async () => {
      mockResetMemory.mockRejectedValue(new Error('DB error'))
      const result = await deleteAllUserData.execute(
        {},
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )
      expect(result).toContain('error')
    })
  })

  describe('deleteUserData tool', () => {
    it('should return error message when userId is missing', async () => {
      const result = await deleteUserData.execute(
        { dataToDelete: ['job'] },
        { context: {} } as any
      )
      expect(result).toContain('No pude identificar al usuario')
    })

    it('should return error message when dataToDelete is empty', async () => {
      const result = await deleteUserData.execute(
        { dataToDelete: [] },
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )
      expect(result).toContain('No se especificaron datos')
    })

    it('should delete found memories and return success message', async () => {
      mockGetMemory.mockResolvedValue([{ id: 'id-1' }, { id: 'id-2' }])
      mockDeleteMemories.mockResolvedValue(undefined)

      const result = await deleteUserData.execute(
        { dataToDelete: ['where I work'] },
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(mockDeleteMemories).toHaveBeenCalledWith('user1', ['id-1', 'id-2'])
      expect(result).toBe('He borrado los datos')
    })

    it('should return not found message when no memories match', async () => {
      mockGetMemory.mockResolvedValue([])

      const result = await deleteUserData.execute(
        { dataToDelete: ['nonexistent'] },
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(result).toContain('No encontre')
    })

    it('should return error message on exception', async () => {
      mockGetMemory.mockRejectedValue(new Error('DB error'))

      const result = await deleteUserData.execute(
        { dataToDelete: ['job'] },
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(result).toContain('error')
    })
  })
})
