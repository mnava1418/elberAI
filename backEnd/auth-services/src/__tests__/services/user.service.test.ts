import admin from 'firebase-admin'
import * as userService from '../../services/user.service'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    auth: jest.fn(),
    database: jest.fn(),
  },
}))

// Mock auth.service to control getRequestStatus
jest.mock('../../services/auth.service', () => ({
  getRequestStatus: jest.fn(),
}))

// Mock notification.service to prevent actual HTTP calls
jest.mock('../../services/notification.service', () => jest.fn().mockResolvedValue(undefined))

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
}))

import { getRequestStatus } from '../../services/auth.service'

const mockAuthInstance = {
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  generateEmailVerificationLink: jest.fn(),
  generatePasswordResetLink: jest.fn(),
}

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(admin.auth as jest.Mock).mockReturnValue(mockAuthInstance)
  })

  describe('signUp', () => {
    it('should return registered false when request is not approved', async () => {
      ;(getRequestStatus as jest.Mock).mockResolvedValue({ status: 'pending' })

      const result = await userService.signUp('user@test.com', 'Passw0rd!', 'User')

      expect(result.registered).toBe(false)
      expect(result.message).toContain('solicitud')
    })

    it('should return registered false when user already exists', async () => {
      ;(getRequestStatus as jest.Mock).mockResolvedValue({ status: 'approved' })
      mockAuthInstance.getUserByEmail.mockResolvedValue({ uid: 'existing-uid' })

      const result = await userService.signUp('user@test.com', 'Passw0rd!', 'User')

      expect(result.registered).toBe(false)
      expect(result.message).toContain('correo')
    })

    it('should create user and return registered true when everything is valid', async () => {
      ;(getRequestStatus as jest.Mock).mockResolvedValue({ status: 'approved' })
      mockAuthInstance.getUserByEmail.mockRejectedValue({
        errorInfo: { code: 'auth/user-not-found' },
      })
      mockAuthInstance.createUser.mockResolvedValue({ uid: 'new-uid' })
      mockAuthInstance.generateEmailVerificationLink.mockResolvedValue('http://verify.link')

      const result = await userService.signUp('user@test.com', 'Passw0rd!', 'User')

      expect(mockAuthInstance.createUser).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'Passw0rd!',
        displayName: 'User',
        emailVerified: false,
      })
      expect(result.registered).toBe(true)
    })

    it('should throw when getUserByEmail fails with non-not-found error', async () => {
      ;(getRequestStatus as jest.Mock).mockResolvedValue({ status: 'approved' })
      mockAuthInstance.getUserByEmail.mockRejectedValue({
        errorInfo: { code: 'auth/internal-error' },
      })

      await expect(userService.signUp('user@test.com', 'Passw0rd!', 'User')).rejects.toThrow(
        'Unable to create user account.'
      )
    })
  })

  describe('resetPassword', () => {
    it('should call generatePasswordResetLink and return message', async () => {
      mockAuthInstance.getUserByEmail.mockResolvedValue({ uid: 'uid-123' })
      mockAuthInstance.generatePasswordResetLink.mockResolvedValue('http://reset.link')

      const message = await userService.resetPassword('user@test.com')

      expect(mockAuthInstance.generatePasswordResetLink).toHaveBeenCalledWith('user@test.com')
      expect(message).toContain('correo')
    })

    it('should still return message even when getUserByEmail throws', async () => {
      mockAuthInstance.getUserByEmail.mockRejectedValue(new Error('Not found'))

      const message = await userService.resetPassword('nobody@test.com')

      expect(message).toContain('correo')
    })
  })
})
