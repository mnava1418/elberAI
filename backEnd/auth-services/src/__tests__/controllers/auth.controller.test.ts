import { Request, Response } from 'express'
import * as authController from '../../controllers/auth.controller'

jest.mock('../../services/auth.service', () => ({
  requestAccess: jest.fn(),
  reviewAccess: jest.fn(),
  validateAccessCode: jest.fn(),
}))

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
}))

import * as authService from '../../services/auth.service'

const createMockRes = () => {
  const res = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('requestAccess', () => {
    it('should return 200 with message on success', async () => {
      ;(authService.requestAccess as jest.Mock).mockResolvedValue({
        status: 'pending',
        message: 'Tu solicitud está en la fila.',
      })

      const req = { body: { email: 'user@test.com' } } as Request
      const res = createMockRes()

      await authController.requestAccess(req, res)

      expect(authService.requestAccess).toHaveBeenCalledWith('user@test.com')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ message: 'Tu solicitud está en la fila.' })
    })

    it('should return 500 on service error', async () => {
      ;(authService.requestAccess as jest.Mock).mockRejectedValue(new Error('DB error'))

      const req = { body: { email: 'user@test.com' } } as Request
      const res = createMockRes()

      await authController.requestAccess(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
  })

  describe('reviewAccess', () => {
    it('should return 200 on success', async () => {
      ;(authService.reviewAccess as jest.Mock).mockResolvedValue(undefined)

      const req = {
        payload: { email: 'user@test.com', isApproved: true },
      } as any
      const res = createMockRes()

      await authController.reviewAccess(req, res)

      expect(authService.reviewAccess).toHaveBeenCalledWith('user@test.com', true)
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 500 on service error', async () => {
      ;(authService.reviewAccess as jest.Mock).mockRejectedValue(new Error('Failed'))

      const req = {
        payload: { email: 'user@test.com', isApproved: false },
      } as any
      const res = createMockRes()

      await authController.reviewAccess(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('validateAccessCode', () => {
    it('should return 200 with validation result', async () => {
      ;(authService.validateAccessCode as jest.Mock).mockResolvedValue({ isValid: true, message: '' })

      const req = { body: { email: 'user@test.com', accessCode: '123456' } } as Request
      const res = createMockRes()

      await authController.validateAccessCode(req, res)

      expect(authService.validateAccessCode).toHaveBeenCalledWith('user@test.com', 123456)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ isValid: true, message: '' })
    })

    it('should return 500 on service error', async () => {
      ;(authService.validateAccessCode as jest.Mock).mockRejectedValue(new Error('Validation error'))

      const req = { body: { email: 'user@test.com', accessCode: '111111' } } as Request
      const res = createMockRes()

      await authController.validateAccessCode(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
