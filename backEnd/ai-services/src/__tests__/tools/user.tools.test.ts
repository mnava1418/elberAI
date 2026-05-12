import {
  getUserData as getUserDataTool,
  deleteAllUserData as deleteAllUserDataTool,
  deleteUserData as deleteUserDataTool,
} from '../../agents/tools/user.tools'

// Cast to any since FunctionTool types don't expose execute publicly (it's mocked).
const getUserData = getUserDataTool as any
const deleteAllUserData = deleteAllUserDataTool as any
const deleteUserData = deleteUserDataTool as any

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

const mockFetchUserData = jest.fn()
const mockDeleteAllUserData = jest.fn()
const mockDeleteUserDataByItems = jest.fn()

jest.mock('../../services/user.service', () => ({
  fetchUserData: (...args: any[]) => mockFetchUserData(...args),
  deleteAllUserData: (...args: any[]) => mockDeleteAllUserData(...args),
  deleteUserDataByItems: (...args: any[]) => mockDeleteUserDataByItems(...args),
}))

describe('user.tools', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    it('should return user data from service', async () => {
      const data = Array.from({ length: 10 }, (_, i) => ({
        type: 'profile',
        importance: 3,
        info: `fact ${i}`,
        updatedAt: '',
      }))
      mockFetchUserData.mockResolvedValue(data)

      const result = await getUserData.execute(
        {},
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(mockFetchUserData).toHaveBeenCalledWith('user1')
      expect(result).toHaveLength(10)
    })

    it('should return error message on exception', async () => {
      mockFetchUserData.mockRejectedValue(new Error('DB error'))
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

    it('should call service and return success message', async () => {
      mockDeleteAllUserData.mockResolvedValue(undefined)
      const result = await deleteAllUserData.execute(
        {},
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )
      expect(mockDeleteAllUserData).toHaveBeenCalledWith('user1')
      expect(result).toBe('He borrado toda la memoria')
    })

    it('should return error message on exception', async () => {
      mockDeleteAllUserData.mockRejectedValue(new Error('DB error'))
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

    it('should return success message when service returns true', async () => {
      mockDeleteUserDataByItems.mockResolvedValue(true)

      const result = await deleteUserData.execute(
        { dataToDelete: ['where I work'] },
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(mockDeleteUserDataByItems).toHaveBeenCalledWith('user1', ['where I work'])
      expect(result).toBe('He borrado los datos')
    })

    it('should return not found message when service returns false', async () => {
      mockDeleteUserDataByItems.mockResolvedValue(false)

      const result = await deleteUserData.execute(
        { dataToDelete: ['nonexistent'] },
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(result).toContain('No encontre')
    })

    it('should return error message on exception', async () => {
      mockDeleteUserDataByItems.mockRejectedValue(new Error('DB error'))

      const result = await deleteUserData.execute(
        { dataToDelete: ['job'] },
        { context: { userId: 'user1', timeZone: 'UTC' } } as any
      )

      expect(result).toContain('error')
    })
  })
})
