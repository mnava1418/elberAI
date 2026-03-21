import { Request, Response, NextFunction } from 'express'
import { ClientRequest } from 'http'
import { proxy_request, proxy_error, proxy_validate } from '../../controllers/proxy.controller'

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

const createMockProxyReq = () =>
  ({
    setHeader: jest.fn(),
    write: jest.fn(),
  } as unknown as ClientRequest)

describe('proxy_request', () => {
  it('should set x-api-gateway-secret header', () => {
    const proxyReq = createMockProxyReq()
    const req = { body: {}, headers: {} } as Request

    proxy_request(proxyReq, req as any, createMockRes())

    expect(proxyReq.setHeader).toHaveBeenCalledWith('x-api-gateway-secret', 'test-gateway-secret')
  })

  it('should set x-user-uid when req.user has uid', () => {
    const proxyReq = createMockProxyReq()
    const req = { body: {}, user: { uid: 'user-123' } } as any

    proxy_request(proxyReq, req, createMockRes())

    expect(proxyReq.setHeader).toHaveBeenCalledWith('x-user-uid', 'user-123')
  })

  it('should NOT set x-user-uid when req has no user', () => {
    const proxyReq = createMockProxyReq()
    const req = { body: {}, headers: {} } as Request

    proxy_request(proxyReq, req as any, createMockRes())

    const headers = (proxyReq.setHeader as jest.Mock).mock.calls.map(([h]) => h)
    expect(headers).not.toContain('x-user-uid')
  })

  it('should write the body and set Content headers when body is non-empty', () => {
    const proxyReq = createMockProxyReq()
    const body = { email: 'a@b.com' }
    const req = { body, headers: {} } as Request

    proxy_request(proxyReq, req as any, createMockRes())

    const bodyData = JSON.stringify(body)
    expect(proxyReq.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
    expect(proxyReq.setHeader).toHaveBeenCalledWith('Content-Length', Buffer.byteLength(bodyData))
    expect(proxyReq.write).toHaveBeenCalledWith(bodyData)
  })

  it('should NOT write body when req.body is empty', () => {
    const proxyReq = createMockProxyReq()
    const req = { body: {}, headers: {} } as Request

    proxy_request(proxyReq, req as any, createMockRes())

    expect(proxyReq.write).not.toHaveBeenCalled()
  })
})

describe('proxy_error', () => {
  it('should respond with 502 and error JSON', () => {
    const mockRes = { writeHead: jest.fn(), end: jest.fn() }
    const req = {} as Request

    proxy_error(new Error('upstream down'), req, mockRes)

    expect(mockRes.writeHead).toHaveBeenCalledWith(502, { 'Content-Type': 'application/json' })
    expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify({ error: 'Upstream unavailable' }))
  })
})

describe('proxy_validate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call next when gateway secret matches', () => {
    const req = {
      headers: { 'x-api-gateway-secret': 'test-gateway-secret' },
    } as unknown as Request
    const res = createMockRes()
    const next = jest.fn() as NextFunction

    proxy_validate(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should return 403 when gateway secret does not match', () => {
    const req = {
      headers: { 'x-api-gateway-secret': 'wrong-secret' },
    } as unknown as Request
    const res = createMockRes()
    const next = jest.fn() as NextFunction

    proxy_validate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Call.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 403 when x-api-gateway-secret header is missing', () => {
    const req = { headers: {} } as unknown as Request
    const res = createMockRes()
    const next = jest.fn() as NextFunction

    proxy_validate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})
