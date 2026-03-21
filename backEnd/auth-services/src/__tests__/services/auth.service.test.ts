import admin from 'firebase-admin'
import jwt from 'jsonwebtoken'
import * as authService from '../../services/auth.service'

// Mock firebase-admin before import
jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    database: jest.fn(),
  },
}))

jest.mock('jsonwebtoken')

// Mock notification.service to prevent actual HTTP calls
jest.mock('../../services/notification.service', () => jest.fn().mockResolvedValue(undefined))

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
}))

const mockRef = {
  once: jest.fn(),
  update: jest.fn(),
}

const mockDb = {
  ref: jest.fn().mockReturnValue(mockRef),
}

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(admin.database as unknown as jest.Mock).mockReturnValue(mockDb)
    ;(jwt.sign as jest.Mock).mockReturnValue('mock-token')
  })

  describe('generateToken', () => {
    it('should sign a JWT with the given payload', () => {
      const token = authService.generateToken({ email: 'a@b.com' })
      expect(jwt.sign).toHaveBeenCalledWith({ email: 'a@b.com' }, 'test-jwt-token', { expiresIn: '24h' })
      expect(token).toBe('mock-token')
    })
  })

  describe('getRequestStatus', () => {
    it('should return status and code when data exists', async () => {
      mockRef.once.mockResolvedValue({ val: () => ({ status: 'approved', code: 123456 }) })

      const result = await authService.getRequestStatus('user@test.com')

      expect(mockDb.ref).toHaveBeenCalledWith('/auth/request/usertestcom')
      expect(result).toEqual({ status: 'approved', code: 123456 })
    })

    it('should return empty object when no data exists', async () => {
      mockRef.once.mockResolvedValue({ val: () => null })

      const result = await authService.getRequestStatus('user@test.com')

      expect(result).toEqual({})
    })

    it('should throw when database call fails', async () => {
      mockRef.once.mockRejectedValue(new Error('DB error'))

      await expect(authService.getRequestStatus('user@test.com')).rejects.toThrow(
        'Unable to check user approval status'
      )
    })
  })

  describe('requestAccess', () => {
    it('should return APPROVED status and call reviewAccess when already approved', async () => {
      mockRef.once.mockResolvedValue({ val: () => ({ status: 'approved', code: 123456 }) })
      mockRef.update.mockResolvedValue(undefined)

      const result = await authService.requestAccess('user@test.com')

      expect(result.status).toBe('approved')
    })

    it('should return PENDING status when already pending', async () => {
      mockRef.once.mockResolvedValue({ val: () => ({ status: 'pending' }) })

      const result = await authService.requestAccess('user@test.com')

      expect(result.status).toBe('pending')
      expect(result.message).toContain('fila')
    })

    it('should return REJECTED status when already rejected', async () => {
      mockRef.once.mockResolvedValue({ val: () => ({ status: 'rejected' }) })

      const result = await authService.requestAccess('user@test.com')

      expect(result.status).toBe('rejected')
    })

    it('should create new pending request when no previous request exists', async () => {
      mockRef.once.mockResolvedValue({ val: () => null })
      mockRef.update.mockResolvedValue(undefined)

      const result = await authService.requestAccess('new@user.com')

      expect(mockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' })
      )
      expect(result.status).toBe('pending')
    })

    it('should throw when database update fails', async () => {
      mockRef.once.mockResolvedValue({ val: () => null })
      mockRef.update.mockRejectedValue(new Error('Write failed'))

      await expect(authService.requestAccess('new@user.com')).rejects.toThrow('Unable to request access')
    })
  })

  describe('reviewAccess', () => {
    it('should update status to approved with code when isApproved is true', async () => {
      mockRef.update.mockResolvedValue(undefined)

      await authService.reviewAccess('user@test.com', true)

      expect(mockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved', code: expect.any(Number) })
      )
    })

    it('should update status to rejected when isApproved is false', async () => {
      mockRef.update.mockResolvedValue(undefined)

      await authService.reviewAccess('user@test.com', false)

      expect(mockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'rejected' })
      )
    })

    it('should throw when database update fails', async () => {
      mockRef.update.mockRejectedValue(new Error('Write failed'))

      await expect(authService.reviewAccess('user@test.com', true)).rejects.toThrow('Unable to review access')
    })
  })

  describe('validateAccessCode', () => {
    it('should return isValid true when code matches', async () => {
      mockRef.once.mockResolvedValue({ val: () => ({ status: 'approved', code: 123456 }) })

      const result = await authService.validateAccessCode('user@test.com', 123456)

      expect(result).toEqual({ isValid: true, message: '' })
    })

    it('should return isValid false when code does not match', async () => {
      mockRef.once.mockResolvedValue({ val: () => ({ status: 'approved', code: 999999 }) })

      const result = await authService.validateAccessCode('user@test.com', 111111)

      expect(result.isValid).toBe(false)
      expect(result.message).toContain('código')
    })

    it('should return isValid false when no status exists', async () => {
      mockRef.once.mockResolvedValue({ val: () => null })

      const result = await authService.validateAccessCode('user@test.com', 123456)

      expect(result.isValid).toBe(false)
    })
  })
})
