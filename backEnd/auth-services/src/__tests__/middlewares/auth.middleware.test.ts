import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { validateToken } from '../../middlewares/auth.middleware'

jest.mock('jsonwebtoken')

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
}))

const createMockRes = () => {
  const res = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('validateToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when token query param is missing', () => {
    const req = { query: {} } as unknown as Request
    const res = createMockRes()
    const next = jest.fn() as NextFunction

    validateToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token no proporcionado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('should call next and attach payload when token is valid', () => {
    const mockDecoded = { email: 'user@test.com', isApproved: true }
    ;(jwt.verify as jest.Mock).mockReturnValue(mockDecoded)

    const req = { query: { token: 'valid-token' } } as unknown as Request
    const res = createMockRes()
    const next = jest.fn() as NextFunction

    validateToken(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-jwt-token')
    expect((req as any).payload).toEqual(mockDecoded)
    expect(next).toHaveBeenCalled()
  })

  it('should return 401 when token is invalid', () => {
    ;(jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token')
    })

    const req = { query: { token: 'bad-token' } } as unknown as Request
    const res = createMockRes()
    const next = jest.fn() as NextFunction

    validateToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado' })
    expect(next).not.toHaveBeenCalled()
  })
})
