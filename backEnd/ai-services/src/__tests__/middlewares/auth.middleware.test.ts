import { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'
import { validateFBToken, proxy_validate } from '../../middlewares/auth.middleware'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    auth: jest.fn(),
    database: jest.fn(),
  },
}))

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test-gateway-secret' },
}))

const createMockRes = () => {
  const res = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('auth.middleware', () => {
  const mockVerifyIdToken = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(admin.auth as jest.Mock).mockReturnValue({ verifyIdToken: mockVerifyIdToken })
  })

  describe('validateFBToken', () => {
    it('should return user when token is valid', async () => {
      const mockUser = { uid: 'user-123', email: 'test@test.com' }
      mockVerifyIdToken.mockResolvedValue(mockUser)

      const result = await validateFBToken('valid-token')

      expect(result).toEqual(mockUser)
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token')
    })

    it('should throw Authentication error when token is invalid', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Firebase error'))

      await expect(validateFBToken('bad-token')).rejects.toThrow('Authentication error')
    })
  })

  describe('proxy_validate', () => {
    let mockNext: NextFunction

    beforeEach(() => {
      mockNext = jest.fn()
    })

    it('should call next() when gateway secret is valid', () => {
      const req = {
        headers: { 'x-api-gateway-secret': 'test-gateway-secret' },
      } as unknown as Request
      const res = createMockRes()

      proxy_validate(req, res, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should return 403 when gateway secret is invalid', () => {
      const req = {
        headers: { 'x-api-gateway-secret': 'wrong-secret' },
      } as unknown as Request
      const res = createMockRes()

      proxy_validate(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Call.' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 403 when gateway secret is missing', () => {
      const req = { headers: {} } as unknown as Request
      const res = createMockRes()

      proxy_validate(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
