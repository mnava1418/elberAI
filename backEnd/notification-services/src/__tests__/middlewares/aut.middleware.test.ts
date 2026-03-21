import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { validateToken } from '../../middlewares/aut.middleware'

jest.mock('jsonwebtoken')

jest.mock('../../config/index.config', () => ({
  auth: { token: 'test-secret' },
  email: { from: 'admin@test.com', newsletter: 'newsletter@test.com', newsletterMembers: [] },
}))

const createMockRes = () => {
  const res = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('validateToken middleware', () => {
  let mockNext: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    mockNext = jest.fn()
  })

  it('should call next() without verifying token for /health endpoint', () => {
    const req = { originalUrl: '/health', headers: {} } as unknown as Request
    const res = createMockRes()

    validateToken(req, res, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(jwt.verify).not.toHaveBeenCalled()
  })

  it('should return 403 when authorization header is missing', () => {
    const req = { originalUrl: '/email/send', headers: {} } as unknown as Request
    const res = createMockRes()

    validateToken(req, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Call.' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should return 403 when jwt.verify throws', () => {
    ;(jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token')
    })
    const req = {
      originalUrl: '/email/send',
      headers: { authorization: 'Bearer invalid-token' },
    } as unknown as Request
    const res = createMockRes()

    validateToken(req, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Call.' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should call next() when token is valid', () => {
    ;(jwt.verify as jest.Mock).mockReturnValue({ uid: 'user-123' })
    const req = {
      originalUrl: '/email/send',
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as Request
    const res = createMockRes()

    validateToken(req, res, mockNext)

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
    expect(mockNext).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
