import { Request, Response, NextFunction } from 'express'
import { ClientRequest } from 'http'
import admin from 'firebase-admin'
import { validateFBToken, proxy_request, proxy_error } from '../../middlewares/auth.middleware'
import { AuthenticationRequest } from '../../interfaces/http.interface'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    auth: jest.fn(),
  },
}))

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test-gateway-secret' },
  paths: {
    auth_services: 'http://auth:4041',
    ai_services: 'http://ai:4042',
    notification_services: 'http://notification:4043',
  },
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4040, host: 'http://localhost:4040' },
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
    it('should return 401 when authorization header is missing', () => {
      const req = { headers: {} } as AuthenticationRequest
      const res = createMockRes()
      const next = jest.fn()

      validateFBToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized user.' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next() and attach user when token is valid', async () => {
      const mockUser = { uid: 'user-123', email: 'test@test.com' }
      mockVerifyIdToken.mockResolvedValue(mockUser)

      const req = {
        headers: { authorization: 'Bearer valid-token' },
      } as AuthenticationRequest
      const res = createMockRes()
      const next = jest.fn()

      validateFBToken(req, res, next)
      await new Promise((r) => setImmediate(r))

      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token')
      expect(req.user).toEqual(mockUser)
      expect(next).toHaveBeenCalled()
    })

    it('should return 401 when token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

      const req = {
        headers: { authorization: 'Bearer bad-token' },
      } as AuthenticationRequest
      const res = createMockRes()
      const next = jest.fn()

      validateFBToken(req, res, next)
      await new Promise((r) => setImmediate(r))

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized user.' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when an unexpected exception is thrown', () => {
      ;(admin.auth as jest.Mock).mockImplementation(() => {
        throw new Error('Firebase not initialized')
      })

      const req = {
        headers: { authorization: 'Bearer token' },
      } as AuthenticationRequest
      const res = createMockRes()
      const next = jest.fn()

      validateFBToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('proxy_request', () => {
    const createMockProxyReq = () =>
      ({
        setHeader: jest.fn(),
        write: jest.fn(),
      } as unknown as ClientRequest)

    it('should set x-api-gateway-secret header', () => {
      const proxyReq = createMockProxyReq()
      const req = { body: {}, headers: {} } as Request

      proxy_request(proxyReq, req, createMockRes())

      expect(proxyReq.setHeader).toHaveBeenCalledWith(
        'x-api-gateway-secret',
        'test-gateway-secret'
      )
    })

    it('should set x-user-uid header when req has a user', () => {
      const proxyReq = createMockProxyReq()
      const req = { body: {}, user: { uid: 'user-123' } } as any

      proxy_request(proxyReq, req, createMockRes())

      expect(proxyReq.setHeader).toHaveBeenCalledWith('x-user-uid', 'user-123')
    })

    it('should NOT set x-user-uid when req has no user', () => {
      const proxyReq = createMockProxyReq()
      const req = { body: {}, headers: {} } as Request

      proxy_request(proxyReq, req, createMockRes())

      const calls = (proxyReq.setHeader as jest.Mock).mock.calls.map(([header]) => header)
      expect(calls).not.toContain('x-user-uid')
    })

    it('should write the body and set Content headers when body is non-empty', () => {
      const proxyReq = createMockProxyReq()
      const body = { email: 'test@test.com', password: '123' }
      const req = { body, headers: {} } as Request

      proxy_request(proxyReq, req, createMockRes())

      const bodyData = JSON.stringify(body)
      expect(proxyReq.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(proxyReq.setHeader).toHaveBeenCalledWith(
        'Content-Length',
        Buffer.byteLength(bodyData)
      )
      expect(proxyReq.write).toHaveBeenCalledWith(bodyData)
    })

    it('should NOT write body when req.body is empty', () => {
      const proxyReq = createMockProxyReq()
      const req = { body: {}, headers: {} } as Request

      proxy_request(proxyReq, req, createMockRes())

      expect(proxyReq.write).not.toHaveBeenCalled()
    })
  })

  describe('proxy_error', () => {
    it('should respond with 502 and error JSON', () => {
      const mockRes = {
        writeHead: jest.fn(),
        end: jest.fn(),
      }
      const req = {} as Request

      proxy_error(new Error('upstream down'), req, mockRes)

      expect(mockRes.writeHead).toHaveBeenCalledWith(502, {
        'Content-Type': 'application/json',
      })
      expect(mockRes.end).toHaveBeenCalledWith(
        JSON.stringify({ error: 'Upstream unavailable' })
      )
    })
  })
})
